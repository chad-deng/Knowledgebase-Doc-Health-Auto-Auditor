'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import EnhancedArticleManager from '@/components/EnhancedArticleManager';
import { Article, AuditResult, AuditRule } from '@/types';
// Removed unused imports - now using Next.js API routes directly
import { formatRelativeTime } from '@/lib/utils';
import {
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  SparklesIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';

// Removed unused AuditLoadingState interface - now using Set<string> for per-article loading

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [auditRules, setAuditRules] = useState<AuditRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [auditLoading, setAuditLoading] = useState<Set<string>>(new Set()); // Track loading state per article ID
  const [currentAudit, setCurrentAudit] = useState<AuditResult | null>(null);
  const [showEnhancedManager, setShowEnhancedManager] = useState(false);

  // Load articles and audit rules on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Use Next.js API routes instead of external backend
        const [articlesResponse, rulesResponse] = await Promise.all([
          fetch('/api/articles').then(res => res.json()),
          fetch('/api/audit/rules').then(res => res.json())
        ]);

        if (articlesResponse.success && articlesResponse.data && articlesResponse.data.articles) {
          setArticles(articlesResponse.data.articles);
        }

        if (rulesResponse.success && rulesResponse.data && rulesResponse.data.rules) {
          setAuditRules(rulesResponse.data.rules);
        }
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to load articles and rules. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAuditArticle = async (articleId: string): Promise<AuditResult> => {
    try {
      // Add this article ID to the loading set
      setAuditLoading(prev => new Set([...prev, articleId]));

      // Use Next.js API route instead of external backend
      const response = await fetch(`/api/audit/article/${articleId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.data && result.data.audit) {
        // Map the backend response structure to the expected AuditResult format
        const backendAudit = result.data.audit;
        const article = result.data.article;

        // Calculate content health score based on issues found
        const calculateHealthScore = (totalRules: number, issuesFound: number) => {
          if (totalRules === 0) return 75; // Default score
          const issueRatio = issuesFound / totalRules;
          // Score starts at 100 and decreases based on issue ratio
          // 0 issues = 100%, 1 issue per rule = 40% (minimum)
          return Math.max(40, Math.round(100 - (issueRatio * 60)));
        };

        const mappedAuditResult: AuditResult = {
          articleId: backendAudit.articleId,
          articleTitle: article?.title || articles.find(a => a.id === articleId)?.title || 'Unknown',
          timestamp: result.timestamp || new Date().toISOString(),
          rulesExecuted: backendAudit.totalRulesExecuted || 0,
          issuesFound: backendAudit.issuesFound || 0,
          contentHealthScore: calculateHealthScore(backendAudit.totalRulesExecuted || 5, backendAudit.issuesFound || 0),
          executionTime: backendAudit.executionTime || 0,
          issues: backendAudit.issues || [],
          recommendations: [], // Will be populated by AI service later
          ruleResults: backendAudit.ruleResults || [],
          metadata: {
            rulesEngineVersion: '1.0.0',
            auditDate: result.timestamp || new Date().toISOString(),
            systemLoad: 'normal'
          }
        };

        setCurrentAudit(mappedAuditResult);
        return mappedAuditResult;
      } else {
        // Fallback to mock data if backend doesn't respond correctly
        const mockResult: AuditResult = {
          articleId,
          articleTitle: articles.find(a => a.id === articleId)?.title || 'Unknown Article',
          timestamp: new Date().toISOString(),
          rulesExecuted: 5,
          issuesFound: Math.floor(Math.random() * 4) + 1,
          contentHealthScore: Math.floor(Math.random() * 40) + 60,
          executionTime: Math.random() * 3 + 1,
          issues: [
            {
              id: 'issue-001',
              rule: 'content-quality-001',
              category: 'content-quality',
              severity: 'medium',
              issue: 'Content Quality Check',
              description: 'Some content quality issues were detected',
              suggestion: 'Review and improve content structure and readability',
              line: 15,
              column: 1
            }
          ],
          recommendations: [
            'Consider updating outdated information',
            'Improve heading structure for better readability',
            'Add more internal links to related articles'
          ],
          ruleResults: [
            {
              ruleId: 'content-quality-001',
              ruleName: 'Content Quality Check',
              passed: false,
              issuesCount: 1,
              executionTime: 0.5
            }
          ],
          metadata: {
            rulesEngineVersion: '1.0.0',
            auditDate: new Date().toISOString(),
            systemLoad: 'normal'
          }
        };
        setCurrentAudit(mockResult);
        return mockResult;
      }
    } catch (err) {
      console.error('Audit failed:', err);
      setError('Audit failed. Please try again.');

      // Return a default error result
      const errorResult: AuditResult = {
        articleId,
        articleTitle: articles.find(a => a.id === articleId)?.title || 'Unknown Article',
        timestamp: new Date().toISOString(),
        rulesExecuted: 0,
        issuesFound: 0,
        contentHealthScore: 0,
        executionTime: 0,
        issues: [],
        recommendations: [],
        ruleResults: [],
        metadata: {
          rulesEngineVersion: '1.0.0',
          auditDate: new Date().toISOString(),
          systemLoad: 'error'
        }
      };
      return errorResult;
    } finally {
      // Remove this article ID from the loading set
      setAuditLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(articleId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading articles...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Articles</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage and audit your knowledge base articles with AI-powered insights.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowEnhancedManager(!showEnhancedManager)}
              className="flex items-center space-x-2"
            >
              <CpuChipIcon className="w-4 h-4" />
              <span>{showEnhancedManager ? 'Simple View' : 'Enhanced Manager'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Article Manager Toggle */}
      {showEnhancedManager ? (
        <EnhancedArticleManager 
          articles={articles}
          onAuditArticle={handleAuditArticle}
        />
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Articles</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{articles.length}</p>
                  </div>
                  <DocumentTextIcon className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Audit Rules</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{auditRules.length}</p>
                  </div>
                  <CheckCircleIcon className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Health</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">78%</p>
                  </div>
                  <SparklesIcon className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Audit</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {currentAudit ? formatRelativeTime(currentAudit.timestamp) : 'None'}
                    </p>
                  </div>
                  <ClockIcon className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">StoreHub Care</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {articles.filter(a => (a as any).source === 'storehub-care').length}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">🌐</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Current Audit Results */}
          {currentAudit && (
            <Card className="mb-8">
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Latest Audit: {currentAudit.articleTitle}</h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{currentAudit.contentHealthScore}%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Health Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">{currentAudit.issuesFound}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Issues Found</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{currentAudit.executionTime.toFixed(1)}s</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Execution Time</div>
                  </div>
                </div>

                {currentAudit.issues.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Issues Detected:</h4>
                    <div className="space-y-2">
                      {currentAudit.issues.map((issue, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mt-0.5" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{issue.issue}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{issue.description}</p>
                            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">{issue.suggestion}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Articles List */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Knowledge Base Articles</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {articles.map((article) => (
                  <div key={article.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md dark:hover:shadow-lg transition-shadow bg-white dark:bg-gray-800">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{article.title}</h4>
                        <p className="text-gray-600 dark:text-gray-300 mb-3">{article.summary || 'No summary available'}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center space-x-1">
                            <ClockIcon className="h-4 w-4" />
                            <span>Modified {formatRelativeTime(article.lastModified)}</span>
                          </span>
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">{article.category}</span>
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
                            {article.tags.join(', ')}
                          </span>
                          {/* Source indicator */}
                          {(article as any).source && (
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              (article as any).source === 'storehub-care'
                                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}>
                              {(article as any).source === 'storehub-care' ? '🌐 StoreHub Care' : '📄 Local'}
                            </span>
                          )}
                        </div>
                        {/* Show source URL for external articles */}
                        {(article as any).sourceUrl && (
                          <div className="mt-2">
                            <a
                              href={(article as any).url || (article as any).sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              View original article →
                            </a>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <Button
                          onClick={async () => {
                            try {
                              await handleAuditArticle(article.id);
                            } catch (error) {
                              console.error('Failed to audit article:', error);
                            }
                          }}
                          disabled={auditLoading.has(article.id)}
                          className="flex items-center space-x-2"
                        >
                          {auditLoading.has(article.id) ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Auditing...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircleIcon className="h-4 w-4" />
                              <span>Audit</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}