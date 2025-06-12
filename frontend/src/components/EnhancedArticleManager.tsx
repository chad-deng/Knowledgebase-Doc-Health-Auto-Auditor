'use client';

import { useState, useEffect } from 'react';
import { 
  CheckIcon, 
  XMarkIcon, 
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  DocumentDuplicateIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import { Article, AuditResult } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { formatRelativeTime } from '@/lib/utils';

interface BulkOperation {
  type: 'audit' | 'compare' | 'export';
  selectedArticles: string[];
  status: 'idle' | 'running' | 'completed' | 'error';
  progress: number;
  results?: any;
}

interface FilterOptions {
  status: 'all' | 'healthy' | 'warning' | 'critical';
  category: 'all' | string;
  lastAudited: 'all' | 'recent' | 'outdated' | 'never';
  sortBy: 'title' | 'lastModified' | 'healthScore' | 'lastAudited';
  sortOrder: 'asc' | 'desc';
}

interface EnhancedArticleManagerProps {
  articles: Article[];
  onAuditArticle?: (articleId: string) => Promise<AuditResult>;
  onBulkAudit?: (articleIds: string[]) => Promise<AuditResult[]>;
}

const mockAuditResults: Record<string, { score: number; status: 'healthy' | 'warning' | 'critical'; lastAudited: string }> = {
  'article-001': { score: 85, status: 'healthy', lastAudited: '2025-06-11T05:00:00Z' },
  'article-002': { score: 72, status: 'warning', lastAudited: '2025-06-10T15:30:00Z' },
  'article-003': { score: 91, status: 'healthy', lastAudited: '2025-06-11T02:15:00Z' },
  'article-004': { score: 58, status: 'critical', lastAudited: '2025-06-09T11:45:00Z' },
  'article-005': { score: 78, status: 'warning', lastAudited: '2025-06-11T08:20:00Z' },
  'article-006': { score: 95, status: 'healthy', lastAudited: '2025-06-11T01:10:00Z' }
};

export default function EnhancedArticleManager({ articles, onAuditArticle, onBulkAudit }: EnhancedArticleManagerProps) {
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    category: 'all',
    lastAudited: 'all',
    sortBy: 'title',
    sortOrder: 'asc'
  });
  const [bulkOperation, setBulkOperation] = useState<BulkOperation>({
    type: 'audit',
    selectedArticles: [],
    status: 'idle',
    progress: 0
  });
  const [showFilters, setShowFilters] = useState(false);
  const [comparedArticles, setComparedArticles] = useState<string[]>([]);

  // Filter and sort articles
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const auditData = mockAuditResults[article.id];
    const matchesStatus = filters.status === 'all' || 
                         (auditData && auditData.status === filters.status);
    
    const matchesCategory = filters.category === 'all' || 
                           article.category === filters.category;
    
    return matchesSearch && matchesStatus && matchesCategory;
  }).sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (filters.sortBy) {
      case 'title':
        aValue = a.title;
        bValue = b.title;
        break;
      case 'lastModified':
        aValue = new Date(a.lastModified);
        bValue = new Date(b.lastModified);
        break;
      case 'healthScore':
        aValue = mockAuditResults[a.id]?.score || 0;
        bValue = mockAuditResults[b.id]?.score || 0;
        break;
      case 'lastAudited':
        aValue = new Date(mockAuditResults[a.id]?.lastAudited || 0);
        bValue = new Date(mockAuditResults[b.id]?.lastAudited || 0);
        break;
      default:
        aValue = a.title;
        bValue = b.title;
    }
    
    if (filters.sortOrder === 'desc') {
      return aValue > bValue ? -1 : 1;
    }
    return aValue < bValue ? -1 : 1;
  });

  const handleSelectAll = () => {
    if (selectedArticles.length === filteredArticles.length) {
      setSelectedArticles([]);
    } else {
      setSelectedArticles(filteredArticles.map(a => a.id));
    }
  };

  const handleSelectArticle = (articleId: string) => {
    setSelectedArticles(prev => 
      prev.includes(articleId) 
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId]
    );
  };

  const handleBulkAudit = async () => {
    if (selectedArticles.length === 0) return;
    
    setBulkOperation({
      type: 'audit',
      selectedArticles,
      status: 'running',
      progress: 0
    });

    // Simulate bulk audit process
    for (let i = 0; i < selectedArticles.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setBulkOperation(prev => ({
        ...prev,
        progress: ((i + 1) / selectedArticles.length) * 100
      }));
    }

    setBulkOperation(prev => ({
      ...prev,
      status: 'completed',
      progress: 100
    }));

    setTimeout(() => {
      setBulkOperation(prev => ({ ...prev, status: 'idle', progress: 0 }));
      setSelectedArticles([]);
    }, 2000);
  };

  const handleCompareArticles = () => {
    if (selectedArticles.length < 2) return;
    setComparedArticles(selectedArticles.slice(0, 2));
  };

  const getStatusColor = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  const getStatusIcon = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy': return <CheckIcon className="w-4 h-4" />;
      case 'warning': return <ExclamationTriangleIcon className="w-4 h-4" />;
      case 'critical': return <XMarkIcon className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <AdjustmentsHorizontalIcon className="w-4 h-4" />
              <span>Filters</span>
            </Button>
          </div>

          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All</option>
                    <option value="healthy">Healthy</option>
                    <option value="warning">Warning</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Categories</option>
                    <option value="setup">Setup</option>
                    <option value="troubleshooting">Troubleshooting</option>
                    <option value="api">API</option>
                    <option value="features">Features</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="title">Title</option>
                    <option value="lastModified">Last Modified</option>
                    <option value="healthScore">Health Score</option>
                    <option value="lastAudited">Last Audited</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                  <select
                    value={filters.sortOrder}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortOrder: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Operations */}
      {selectedArticles.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">
                  {selectedArticles.length} article{selectedArticles.length > 1 ? 's' : ''} selected
                </span>
                {bulkOperation.status === 'running' && (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm text-blue-600">{bulkOperation.progress.toFixed(0)}% complete</span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={handleBulkAudit}
                  disabled={bulkOperation.status === 'running'}
                  className="flex items-center space-x-2"
                >
                  <PlayIcon className="w-4 h-4" />
                  <span>Bulk Audit</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCompareArticles}
                  disabled={selectedArticles.length < 2}
                  className="flex items-center space-x-2"
                >
                  <DocumentDuplicateIcon className="w-4 h-4" />
                  <span>Compare</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Articles List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Articles ({filteredArticles.length})</h3>
            <Button
              variant="outline"
              onClick={handleSelectAll}
              className="text-sm"
            >
              {selectedArticles.length === filteredArticles.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredArticles.map((article) => {
              const auditData = mockAuditResults[article.id];
              const isSelected = selectedArticles.includes(article.id);
              
              return (
                <div
                  key={article.id}
                  className={`p-4 border rounded-lg transition-all cursor-pointer hover:shadow-md ${
                    isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => handleSelectArticle(article.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectArticle(article.id)}
                        className="mt-1"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{article.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{article.summary}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center space-x-1">
                            <ClockIcon className="w-3 h-3" />
                            <span>Modified {formatRelativeTime(article.lastModified)}</span>
                          </span>
                          <span className="px-2 py-1 bg-gray-100 rounded">{article.category}</span>
                          {auditData && (
                            <span className="flex items-center space-x-1">
                              <span>Last audited {formatRelativeTime(auditData.lastAudited)}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {auditData && (
                        <>
                          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(auditData.status)}`}>
                            {getStatusIcon(auditData.status)}
                            <span>{auditData.score}%</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Article Comparison */}
      {comparedArticles.length === 2 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Article Comparison</h3>
              <Button
                variant="outline"
                onClick={() => setComparedArticles([])}
              >
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {comparedArticles.map((articleId) => {
                const article = articles.find(a => a.id === articleId);
                const auditData = mockAuditResults[articleId];
                
                if (!article) return null;
                
                return (
                  <div key={articleId} className="space-y-4">
                    <div className="border-b pb-4">
                      <h4 className="font-medium text-gray-900 dark:text-white">{article.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{article.summary}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Health Score:</span>
                        <span className="text-sm font-medium">{auditData?.score || 'N/A'}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Word Count:</span>
                        <span className="text-sm font-medium">{article.content.split(' ').length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Category:</span>
                        <span className="text-sm font-medium">{article.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Last Modified:</span>
                        <span className="text-sm font-medium">{formatRelativeTime(article.lastModified)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Tags:</span>
                        <span className="text-sm font-medium">{article.tags.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}