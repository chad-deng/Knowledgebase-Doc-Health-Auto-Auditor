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

  const getStatusBadgeClass = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy': return 'article-status-healthy';
      case 'warning': return 'article-status-warning';
      case 'critical': return 'article-status-critical';
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
    <div className="article-manager">
      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="article-search-section">
            <div className="article-search-container">
              <MagnifyingGlassIcon className="article-search-icon" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="article-search-input"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="article-filter-toggle"
            >
              <AdjustmentsHorizontalIcon className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {showFilters && (
            <div className="article-filters-container">
              <div className="article-filters-grid">
                <div className="article-filter-group">
                  <label className="article-filter-label">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
                    className="article-filter-select"
                  >
                    <option value="all">All Status</option>
                    <option value="healthy">Healthy</option>
                    <option value="warning">Warning</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div className="article-filter-group">
                  <label className="article-filter-label">Sort By</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                    className="article-filter-select"
                  >
                    <option value="title">Title</option>
                    <option value="lastModified">Last Modified</option>
                    <option value="healthScore">Health Score</option>
                    <option value="lastAudited">Last Audited</option>
                  </select>
                </div>

                <div className="article-filter-group">
                  <label className="article-filter-label">Order</label>
                  <select
                    value={filters.sortOrder}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortOrder: e.target.value as any }))}
                    className="article-filter-select"
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
        <div className="article-bulk-operations">
          <div className="article-bulk-info">
            <span className="article-bulk-count">{selectedArticles.length} articles selected</span>
                <Button
                  variant="outline"
              size="sm"
              onClick={() => setSelectedArticles([])}
              className="article-bulk-clear"
            >
              Clear Selection
            </Button>
          </div>
          
          <div className="article-bulk-actions">
            <Button
                  onClick={handleBulkAudit}
                  disabled={bulkOperation.status === 'running'}
              className="article-bulk-button"
                >
              <PlayIcon className="w-4 h-4 mr-2" />
              {bulkOperation.status === 'running' ? 'Running...' : 'Bulk Audit'}
                </Button>
            
                <Button
                  variant="outline"
                  onClick={handleCompareArticles}
                  disabled={selectedArticles.length < 2}
              className="article-bulk-button"
                >
              <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
              Compare Selected
                </Button>
          </div>

          {bulkOperation.status === 'running' && (
            <div className="article-bulk-progress">
              <div className="article-progress-bar">
                <div 
                  className="article-progress-fill"
                  style={{ width: `${bulkOperation.progress}%` }}
                />
              </div>
              <span className="article-progress-text">{Math.round(bulkOperation.progress)}%</span>
            </div>
          )}
        </div>
      )}

      {/* Articles List */}
      <div className="article-list-container">
        <div className="article-list-header">
          <div className="article-list-controls">
            <label className="article-select-all">
              <input
                type="checkbox"
                checked={selectedArticles.length === filteredArticles.length && filteredArticles.length > 0}
                onChange={handleSelectAll}
                className="article-checkbox"
              />
              <span className="article-select-all-text">
                Select All ({filteredArticles.length})
              </span>
            </label>
          </div>
          <div className="article-results-count">
            {filteredArticles.length} of {articles.length} articles
          </div>
        </div>

        <div className="article-list">
            {filteredArticles.map((article) => {
              const auditData = mockAuditResults[article.id];
              const isSelected = selectedArticles.includes(article.id);
              
              return (
                <div
                  key={article.id}
                className={`article-item ${isSelected ? 'article-item-selected' : ''}`}
                >
                <div className="article-item-checkbox">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectArticle(article.id)}
                    className="article-checkbox"
                      />
                </div>

                <div className="article-item-content">
                  <div className="article-item-header">
                    <h3 className="article-item-title">{article.title}</h3>
                    <div className="article-item-badges">
                          {auditData && (
                        <span className={`article-status-badge ${getStatusBadgeClass(auditData.status)}`}>
                          {getStatusIcon(auditData.status)}
                          <span className="ml-1">{auditData.status}</span>
                            </span>
                          )}
                      <span className="article-category-badge">
                        {article.category}
                      </span>
                        </div>
                      </div>

                  <div className="article-item-meta">
                    <div className="article-meta-item">
                      <ClockIcon className="article-meta-icon" />
                      <span className="article-meta-text">
                        Modified {formatRelativeTime(new Date(article.lastModified))}
                      </span>
                    </div>
                      {auditData && (
                        <>
                        <div className="article-meta-item">
                          <span className="article-health-score">
                            Health: {auditData.score}%
                          </span>
                        </div>
                        <div className="article-meta-item">
                          <span className="article-audit-date">
                            Audited {formatRelativeTime(new Date(auditData.lastAudited))}
                          </span>
                          </div>
                        </>
                      )}
                    </div>

                  <div className="article-item-actions">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onAuditArticle?.(article.id)}
                      className="article-action-button"
                    >
                      <PlayIcon className="w-4 h-4 mr-1" />
                      Audit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="article-action-button"
                    >
                      View Details
                    </Button>
                  </div>
                  </div>
                </div>
              );
            })}
          </div>

        {filteredArticles.length === 0 && (
          <div className="article-empty-state">
            <div className="article-empty-content">
              <MagnifyingGlassIcon className="article-empty-icon" />
              <h3 className="article-empty-title">No articles found</h3>
              <p className="article-empty-description">
                Try adjusting your search query or filters to find articles.
              </p>
            </div>
                    </div>
        )}
            </div>
    </div>
  );
}