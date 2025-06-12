// Core Entity Types
export interface Article {
  id: string;
  title: string;
  content: string;
  summary?: string;
  lastModified: string;
  author: string;
  category: string;
  tags: string[];
  status: 'published' | 'draft' | 'archived';
  viewCount: number;
  helpfulVotes: number;
  lastReviewed: string;
}

export interface ArticleSearchParams {
  search?: string;
  category?: string;
  tags?: string[];
  status?: string;
  sortBy?: 'title' | 'lastModified' | 'viewCount' | 'helpfulVotes';
  sortOrder?: 'asc' | 'desc';
  offset?: number;
  limit?: number;
}

export interface ArticlesResponse {
  articles: Article[];
  pagination: {
    total: number;
    offset: number;
    limit: number;
    hasMore: boolean;
  };
}

// Audit System Types
export interface AuditRule {
  id: string;
  name: string;
  description: string;
  category: 'content-quality' | 'technical' | 'seo';
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  configurable: boolean;
  parameters?: Record<string, any>;
}

export interface AuditIssue {
  id: string;
  rule: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  issue: string;
  description: string;
  suggestion: string;
  line?: number;
  column?: number;
  context?: string;
}

export interface AuditResult {
  articleId: string;
  articleTitle: string;
  timestamp: string;
  rulesExecuted: number;
  issuesFound: number;
  contentHealthScore: number;
  issues: AuditIssue[];
  executionTime: number;
  recommendations?: string[];
  ruleResults: Array<{
    ruleId: string;
    ruleName: string;
    passed: boolean;
    issuesCount: number;
    executionTime: number;
  }>;
  metadata?: {
    rulesEngineVersion: string;
    auditDate: string;
    systemLoad: string;
  };
}

// AI Integration Types
export interface AISuggestion {
  id: number;
  title: string;
  priority: 'low' | 'medium' | 'high';
  category: 'content' | 'technical' | 'seo' | 'ux';
  issue: string;
  solution: string;
  impact: string;
  contextRelevance: number;
  implementationComplexity: 'low' | 'medium' | 'high';
  estimatedImpact: 'low' | 'medium' | 'high';
}

export interface AIResponse {
  suggestions: AISuggestion[];
  metadata: {
    requestId: string;
    model: string;
    promptType: string;
    contextAnalysis: {
      totalIssues: number;
      highPriorityIssues: number;
      categories: string[];
    };
    processingTime: number;
    tokensUsed: {
      promptTokens: number;
      responseTokens: number;
      totalTokens: number;
    };
  };
}

export interface QuickFix {
  id: number;
  quickFix: string;
  timeRequired: string;
  impact: string;
  urgency: 'low' | 'medium' | 'high';
  estimatedTime: number;
}

export interface OptimizationRecommendation {
  id: number;
  metric: string;
  currentState: string;
  recommendation: string;
  expectedOutcome: string;
  priority: 'low' | 'medium' | 'high';
  feasibilityScore: 'low' | 'medium' | 'high';
  expectedROI: 'low' | 'medium' | 'high';
}

// System Architecture Types
export interface SystemComponent {
  id: string;
  name: string;
  type: 'frontend' | 'backend' | 'database' | 'ai-service' | 'external-api';
  description: string;
  technologies: string[];
  connections: string[];
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  position: {
    x: number;
    y: number;
  };
  details: {
    endpoints?: string[];
    features?: string[];
    dependencies?: string[];
  };
}

export interface FlowStep {
  id: string;
  title: string;
  description: string;
  component: string;
  highlight: {
    component: string;
    animation: 'pulse' | 'glow' | 'bounce' | 'fade';
  };
  content: {
    explanation: string;
    technicalDetails?: string;
    userActions?: string[];
  };
}

// UI State Types
export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
  code?: string;
  details?: any;
}

export interface NotificationState {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: number;
  duration?: number;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

// Application State Types
export interface ArticleState {
  list: Article[];
  selected: Article | null;
  searchParams: ArticleSearchParams;
  loading: LoadingState;
  error: ErrorState;
  cache: Map<string, Article>;
}

export interface AuditState {
  rules: AuditRule[];
  selectedRules: string[];
  results: AuditResult[];
  currentAudit: AuditResult | null;
  inProgress: boolean;
  loading: LoadingState;
  error: ErrorState;
}

export interface AIState {
  suggestions: AISuggestion[];
  quickFixes: QuickFix[];
  recommendations: OptimizationRecommendation[];
  currentResponse: AIResponse | null;
  loading: LoadingState;
  error: ErrorState;
}

export interface UIState {
  selectedComponent: string | null;
  flowStep: number;
  totalFlowSteps: number;
  notifications: NotificationState[];
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
}

export interface AppState {
  articles: ArticleState;
  audit: AuditState;
  ai: AIState;
  ui: UIState;
}

// API Response Types
export interface APIResponse<T> {
  status: 'success' | 'error';
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    requestId?: string;
    version?: string;
  };
}

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ArticleCardProps extends BaseComponentProps {
  article: Article;
  onSelect: (article: Article) => void;
  onAudit: (articleId: string) => void;
  showActions?: boolean;
}

export interface AuditPanelProps extends BaseComponentProps {
  article: Article;
  rules: AuditRule[];
  onAuditStart: (articleId: string, ruleIds: string[]) => void;
  onRulesChange: (ruleIds: string[]) => void;
  loading?: boolean;
}

export interface ArchitectureDiagramProps extends BaseComponentProps {
  components: SystemComponent[];
  highlightedComponent?: string;
  onComponentClick: (component: SystemComponent) => void;
  interactive?: boolean;
}

// Event Types
export interface AppEvent {
  type: string;
  payload?: any;
  timestamp: number;
}

export interface ArticleEvent extends AppEvent {
  type: 'article.selected' | 'article.audit.started' | 'article.audit.completed';
  payload: {
    articleId: string;
    article?: Article;
    auditResult?: AuditResult;
  };
}

export interface UIEvent extends AppEvent {
  type: 'ui.component.selected' | 'ui.flow.step.changed' | 'ui.notification.added';
  payload: {
    componentId?: string;
    stepIndex?: number;
    notification?: NotificationState;
  };
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export type ValueOf<T> = T[keyof T];

export type StringKeys<T> = {
  [K in keyof T]: T[K] extends string ? K : never;
}[keyof T];

// Configuration Types
export interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };
  ui: {
    theme: 'light' | 'dark';
    defaultPageSize: number;
    enableAnimations: boolean;
  };
  features: {
    enableAI: boolean;
    enableRealTimeUpdates: boolean;
    enableAnalytics: boolean;
  };
} 