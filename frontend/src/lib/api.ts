import { 
  Article, 
  ArticleSearchParams, 
  ArticlesResponse, 
  AuditRule, 
  AuditResult, 
  AISuggestion, 
  AIResponse, 
  QuickFix, 
  OptimizationRecommendation,
  APIResponse 
} from '@/types';

// Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;

// Error Classes
export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

// HTTP Client with error handling and retries
class HTTPClient {
  private baseURL: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string, timeout: number = API_TIMEOUT) {
    this.baseURL = baseURL;
    this.timeout = timeout;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    retries: number = MAX_RETRIES
  ): Promise<APIResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.defaultHeaders,
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status >= 500 && retries > 0) {
          // Retry on server errors
          await new Promise(resolve => setTimeout(resolve, 1000));
          return this.makeRequest<T>(endpoint, options, retries - 1);
        }

        const errorData = await response.json().catch(() => ({}));
        throw new APIError(
          errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData.error?.code,
          errorData.error?.details
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof APIError) {
        throw error;
      }

      if (error.name === 'AbortError') {
        throw new NetworkError('Request timeout');
      }

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new NetworkError('Network connection failed');
      }

      throw new APIError('Unknown error occurred', undefined, 'UNKNOWN_ERROR', error as any);
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<APIResponse<T>> {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      if (searchParams.toString()) {
        url += `?${searchParams.toString()}`;
      }
    }
    return this.makeRequest<T>(url);
  }

  async post<T>(endpoint: string, body?: any): Promise<APIResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: any): Promise<APIResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<APIResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

// Initialize HTTP client
const httpClient = new HTTPClient(API_BASE_URL);

// Articles API
export const articlesAPI = {
  // Get all articles with filtering and pagination
  getArticles: async (params?: ArticleSearchParams): Promise<ArticlesResponse> => {
    const response = await httpClient.get<ArticlesResponse>('/api/articles', params);
    if (response.status === 'error') {
      throw new APIError(response.error?.message || 'Failed to fetch articles');
    }
    return response.data!;
  },

  // Get single article by ID
  getArticle: async (id: string): Promise<Article> => {
    const response = await httpClient.get<Article>(`/api/articles/${id}`);
    if (response.status === 'error') {
      throw new APIError(response.error?.message || 'Failed to fetch article');
    }
    return response.data!;
  },

  // Search articles
  searchArticles: async (query: string, params?: Partial<ArticleSearchParams>): Promise<ArticlesResponse> => {
    const response = await httpClient.get<ArticlesResponse>(`/api/articles/search/${encodeURIComponent(query)}`, params);
    if (response.status === 'error') {
      throw new APIError(response.error?.message || 'Failed to search articles');
    }
    return response.data!;
  },

  // Get article categories
  getCategories: async (): Promise<Array<{ name: string; count: number; slug: string }>> => {
    const response = await httpClient.get<Array<{ name: string; count: number; slug: string }>>('/api/articles/meta/categories');
    if (response.status === 'error') {
      throw new APIError(response.error?.message || 'Failed to fetch categories');
    }
    return response.data!;
  },

  // Get article tags
  getTags: async (): Promise<Array<{ name: string; count: number }>> => {
    const response = await httpClient.get<Array<{ name: string; count: number }>>('/api/articles/meta/tags');
    if (response.status === 'error') {
      throw new APIError(response.error?.message || 'Failed to fetch tags');
    }
    return response.data!;
  },

  // Get article statistics
  getStatistics: async (): Promise<any> => {
    const response = await httpClient.get<any>('/api/articles/meta/statistics');
    if (response.status === 'error') {
      throw new APIError(response.error?.message || 'Failed to fetch statistics');
    }
    return response.data!;
  },
};

// Audit API
export const auditAPI = {
  // Get available audit rules
  getRules: async (): Promise<AuditRule[]> => {
    const response = await httpClient.get<AuditRule[]>('/api/audit/rules');
    if (response.status === 'error') {
      throw new APIError(response.error?.message || 'Failed to fetch audit rules');
    }
    return response.data!;
  },

  // Get specific rule details
  getRule: async (ruleId: string): Promise<AuditRule> => {
    const response = await httpClient.get<AuditRule>(`/api/audit/rules/${ruleId}`);
    if (response.status === 'error') {
      throw new APIError(response.error?.message || 'Failed to fetch rule details');
    }
    return response.data!;
  },

  // Update rule configuration
  updateRuleConfig: async (ruleId: string, config: Record<string, any>): Promise<{ success: boolean }> => {
    const response = await httpClient.post<{ success: boolean }>(`/api/audit/rules/${ruleId}/config`, config);
    if (response.status === 'error') {
      throw new APIError(response.error?.message || 'Failed to update rule configuration');
    }
    return response.data!;
  },

  // Audit single article
  auditArticle: async (
    articleId: string, 
    options?: { rules?: string[]; severity?: string }
  ): Promise<AuditResult> => {
    const response = await httpClient.post<AuditResult>(`/api/audit/article/${articleId}`, options);
    if (response.status === 'error') {
      throw new APIError(response.error?.message || 'Failed to audit article');
    }
    return response.data!;
  },

  // Batch audit multiple articles
  auditArticles: async (
    articleIds: string[], 
    options?: { rules?: string[]; severity?: string }
  ): Promise<{
    processed: number;
    failed: number;
    results: AuditResult[];
    errors?: Array<{ articleId: string; error: string }>;
  }> => {
    const response = await httpClient.post<any>('/api/audit/articles', {
      articleIds,
      ...options,
    });
    if (response.status === 'error') {
      throw new APIError(response.error?.message || 'Failed to audit articles');
    }
    return response.data!;
  },

  // Get audit statistics
  getStats: async (): Promise<any> => {
    const response = await httpClient.get<any>('/api/audit/stats');
    if (response.status === 'error') {
      throw new APIError(response.error?.message || 'Failed to fetch audit statistics');
    }
    return response.data!;
  },
};

// AI API
export const aiAPI = {
  // Check AI service health
  getHealth: async (): Promise<{ status: string; model: string; responseTime: number }> => {
    const response = await httpClient.get<any>('/api/ai/health');
    if (response.status === 'error') {
      throw new APIError(response.error?.message || 'Failed to check AI service health');
    }
    return response.data!;
  },

  // Generate AI suggestions
  generateSuggestions: async (
    articleId: string,
    options?: {
      suggestionType?: 'comprehensive' | 'quickFix' | 'optimization' | 'seo' | 'readability';
      maxSuggestions?: number;
      focusAreas?: string[];
      includeExamples?: boolean;
      rules?: string[];
    }
  ): Promise<{
    articleId: string;
    articleTitle: string;
    auditSummary: {
      rulesExecuted: number;
      issuesFound: number;
      contentHealthScore: number;
    };
    aiSuggestions: AISuggestion[];
    metadata: any;
  }> => {
    const response = await httpClient.post<any>(`/api/ai/suggest/${articleId}`, options);
    if (response.status === 'error') {
      throw new APIError(response.error?.message || 'Failed to generate AI suggestions');
    }
    return response.data!;
  },

  // Generate quick fixes
  generateQuickFixes: async (
    articleId: string,
    options?: {
      issues?: any[];
      urgency?: 'low' | 'normal' | 'high' | 'critical';
      maxFixes?: number;
    }
  ): Promise<{
    articleId: string;
    articleTitle: string;
    issuesAnalyzed: number;
    quickFixes: QuickFix[];
    metadata: any;
  }> => {
    const response = await httpClient.post<any>(`/api/ai/quick-fix/${articleId}`, options);
    if (response.status === 'error') {
      throw new APIError(response.error?.message || 'Failed to generate quick fixes');
    }
    return response.data!;
  },

  // Generate optimization recommendations
  generateOptimizations: async (
    articleId: string,
    options?: {
      performanceMetrics?: {
        viewCount: number;
        helpfulVotes: number;
        bounceRate: number;
        averageTimeOnPage: number;
      };
      goals?: string;
      focusAreas?: string[];
    }
  ): Promise<{
    articleId: string;
    articleTitle: string;
    performanceMetrics: any;
    optimizationRecommendations: OptimizationRecommendation[];
    metadata: any;
  }> => {
    const response = await httpClient.post<any>(`/api/ai/optimize/${articleId}`, options);
    if (response.status === 'error') {
      throw new APIError(response.error?.message || 'Failed to generate optimization recommendations');
    }
    return response.data!;
  },

  // Batch generate suggestions
  batchGenerateSuggestions: async (
    articleIds: string[],
    options?: {
      suggestionType?: string;
      maxSuggestions?: number;
      focusAreas?: string[];
    }
  ): Promise<{
    processed: number;
    failed: number;
    results: Array<{
      articleId: string;
      articleTitle: string;
      auditSummary: any;
      suggestions: AISuggestion[];
      processingTime: number;
    }>;
    errors?: Array<{ articleId: string; error: string }>;
  }> => {
    const response = await httpClient.post<any>('/api/ai/batch-suggest', {
      articleIds,
      ...options,
    });
    if (response.status === 'error') {
      throw new APIError(response.error?.message || 'Failed to batch generate suggestions');
    }
    return response.data!;
  },

  // Analyze article context
  analyzeContext: async (
    articleId: string,
    options?: {
      analysisType?: 'comprehensive';
      includeMetrics?: boolean;
    }
  ): Promise<{
    articleId: string;
    analysisType: string;
    contextAnalysis: {
      articleAnalysis: any;
      contentContext: any;
      auditInsights: any;
      recommendations: any;
    };
    metadata: any;
  }> => {
    const response = await httpClient.post<any>(`/api/ai/analyze-context/${articleId}`, options);
    if (response.status === 'error') {
      throw new APIError(response.error?.message || 'Failed to analyze article context');
    }
    return response.data!;
  },
};

// System API (for health checks and status)
export const systemAPI = {
  // Health check
  getHealth: async (): Promise<{ status: string; timestamp: string; version: string }> => {
    const response = await httpClient.get<{ status: string; timestamp: string; version: string }>('/health');
    if (response.status === 'error') {
      throw new APIError(response.error?.message || 'Failed to check system health');
    }
    return response.data!;
  },

  // API information
  getInfo: async (): Promise<{ name: string; version: string; endpoints: Record<string, string> }> => {
    const response = await httpClient.get<{ name: string; version: string; endpoints: Record<string, string> }>('/api');
    if (response.status === 'error') {
      throw new APIError(response.error?.message || 'Failed to fetch API information');
    }
    return response.data!;
  },
};

// Export a default API client object for convenience
export const api = {
  articles: articlesAPI,
  audit: auditAPI,
  ai: aiAPI,
  system: systemAPI,
};

export default api;