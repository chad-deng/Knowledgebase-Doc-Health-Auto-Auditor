'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { AuditTimeline } from '@/components/audit/AuditTimeline';
import { AuditComparison } from '@/components/audit/AuditComparison';
import { AuditSummary } from '@/components/audit/AuditSummary';
import {
  ClockIcon,
  ChartBarIcon,
  DocumentTextIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlayIcon,
  PauseIcon,
  StopIcon
} from '@heroicons/react/24/outline';

// Types for audit history data
interface AuditRun {
  id: string;
  run_name: string;
  description?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  started_at?: string;
  completed_at?: string;
  duration_ms?: number;
  total_articles_processed: number;
  total_issues_found: number;
  total_warnings_found: number;
  total_suggestions_found: number;
  triggered_by?: string;
  version?: string;
  created_at: string;
  updated_at: string;
}

interface AuditResult {
  id: string;
  audit_run_id: string;
  article_id: string;
  article_title: string;
  rule_id: string;
  rule_name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  issue_type: string;
  issue_description: string;
  suggestion?: string;
  created_at: string;
}

interface FilterOptions {
  status: string;
  dateRange: string;
  triggeredBy: string;
  searchTerm: string;
}

interface SortOptions {
  field: keyof AuditRun;
  direction: 'asc' | 'desc';
}

export default function AuditHistoryPage() {
  const [auditRuns, setAuditRuns] = useState<AuditRun[]>([]);
  const [filteredRuns, setFilteredRuns] = useState<AuditRun[]>([]);
  const [selectedRun, setSelectedRun] = useState<AuditRun | null>(null);
  const [auditResults, setAuditResults] = useState<AuditResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter and sort state
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    dateRange: 'all',
    triggeredBy: 'all',
    searchTerm: ''
  });

  const [sortOptions, setSortOptions] = useState<SortOptions>({
    field: 'created_at',
    direction: 'desc'
  });

  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'timeline' | 'comparison'>('list');

  // Fetch audit runs from the database API
  const fetchAuditRuns = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/database/audit-runs?limit=100');
      const data = await response.json();

      if (data.success) {
        setAuditRuns(data.data || []);
        setFilteredRuns(data.data || []);
      } else {
        throw new Error(data.error || 'Failed to fetch audit runs');
      }
    } catch (err) {
      console.error('Error fetching audit runs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch audit history');

      // Fallback to mock data for development
      const mockData = generateMockAuditRuns();
      setAuditRuns(mockData);
      setFilteredRuns(mockData);
    } finally {
      setLoading(false);
    }
  };

  // Fetch audit results for a specific run
  const fetchAuditResults = async (runId: string) => {
    try {
      const response = await fetch(`/api/database/audit-runs/${runId}/results`);
      const data = await response.json();

      if (data.success) {
        setAuditResults(data.data || []);
      } else {
        throw new Error(data.error || 'Failed to fetch audit results');
      }
    } catch (err) {
      console.error('Error fetching audit results:', err);
      // Fallback to mock results
      setAuditResults(generateMockAuditResults(runId));
    }
  };

  // Generate mock data for development/fallback
  const generateMockAuditRuns = (): AuditRun[] => {
    const statuses: AuditRun['status'][] = ['completed', 'failed', 'running', 'pending'];
    const triggers = ['user', 'system', 'scheduled', 'api'];

    return Array.from({ length: 15 }, (_, i) => {
      const createdAt = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const startedAt = new Date(createdAt.getTime() + 5 * 60 * 1000);
      const completedAt = new Date(startedAt.getTime() + Math.random() * 30 * 60 * 1000);
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      return {
        id: `audit-run-${i + 1}`,
        run_name: `Audit Run ${i + 1} - ${status === 'completed' ? 'Success' : status.charAt(0).toUpperCase() + status.slice(1)}`,
        description: `Automated audit run ${i + 1} covering all knowledge base articles`,
        status,
        started_at: status !== 'pending' ? startedAt.toISOString() : undefined,
        completed_at: status === 'completed' || status === 'failed' ? completedAt.toISOString() : undefined,
        duration_ms: status === 'completed' || status === 'failed' ? Math.floor(Math.random() * 30 * 60 * 1000) : undefined,
        total_articles_processed: Math.floor(Math.random() * 50) + 10,
        total_issues_found: Math.floor(Math.random() * 25) + 5,
        total_warnings_found: Math.floor(Math.random() * 15) + 2,
        total_suggestions_found: Math.floor(Math.random() * 20) + 8,
        triggered_by: triggers[Math.floor(Math.random() * triggers.length)],
        version: '1.0.0',
        created_at: createdAt.toISOString(),
        updated_at: (status === 'completed' || status === 'failed' ? completedAt : createdAt).toISOString()
      };
    });
  };

  const generateMockAuditResults = (runId: string): AuditResult[] => {
    const severities: AuditResult['severity'][] = ['low', 'medium', 'high', 'critical'];
    const ruleNames = [
      'Content Quality Check',
      'SEO Optimization',
      'Broken Links Detection',
      'Outdated Content',
      'Duplicate Content'
    ];

    return Array.from({ length: Math.floor(Math.random() * 20) + 5 }, (_, i) => ({
      id: `result-${runId}-${i + 1}`,
      audit_run_id: runId,
      article_id: `article-${Math.floor(Math.random() * 10) + 1}`,
      article_title: `Knowledge Base Article ${Math.floor(Math.random() * 10) + 1}`,
      rule_id: `rule-${Math.floor(Math.random() * 5) + 1}`,
      rule_name: ruleNames[Math.floor(Math.random() * ruleNames.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      issue_type: 'content_quality',
      issue_description: `Issue found in article content that needs attention`,
      suggestion: 'Consider updating the content to improve quality and readability',
      created_at: new Date().toISOString()
    }));
  };

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...auditRuns];

    // Apply filters
    if (filters.status !== 'all') {
      filtered = filtered.filter(run => run.status === filters.status);
    }

    if (filters.triggeredBy !== 'all') {
      filtered = filtered.filter(run => run.triggered_by === filters.triggeredBy);
    }

    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(run =>
        run.run_name.toLowerCase().includes(searchLower) ||
        run.description?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.dateRange !== 'all') {
      const now = new Date();
      let cutoffDate: Date;

      switch (filters.dateRange) {
        case 'today':
          cutoffDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoffDate = new Date(0);
      }

      filtered = filtered.filter(run => new Date(run.created_at) >= cutoffDate);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortOptions.field];
      const bValue = b[sortOptions.field];

      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;

      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return sortOptions.direction === 'desc' ? -comparison : comparison;
    });

    setFilteredRuns(filtered);
  }, [auditRuns, filters, sortOptions]);

  // Load data on component mount
  useEffect(() => {
    fetchAuditRuns();
  }, []);

  // Handle run selection
  const handleRunSelect = async (run: AuditRun) => {
    setSelectedRun(run);
    if (run.status === 'completed') {
      await fetchAuditResults(run.id);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Handle sort changes
  const handleSort = (field: keyof AuditRun) => {
    setSortOptions(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Format duration
  const formatDuration = (ms?: number) => {
    if (!ms) return 'N/A';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Get status icon
  const getStatusIcon = (status: AuditRun['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'running':
        return <PlayIcon className="h-5 w-5 text-blue-500" />;
      case 'pending':
        return <PauseIcon className="h-5 w-5 text-yellow-500" />;
      case 'cancelled':
        return <StopIcon className="h-5 w-5 text-gray-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  // Get status color
  const getStatusColor = (status: AuditRun['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'running':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // Trigger new audit run
  const handleNewAuditRun = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/database/audit-runs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          run_name: `Manual Audit Run - ${new Date().toLocaleString()}`,
          description: 'Manual audit run triggered from history page',
          triggered_by: 'user'
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Refresh the audit runs list
        await fetchAuditRuns();
      } else {
        setError('Failed to create new audit run');
      }
    } catch (err) {
      console.error('Error creating audit run:', err);
      setError('Failed to create new audit run');
    } finally {
      setLoading(false);
    }
  };

  // Export functionality
  const handleExport = () => {
    const csvContent = [
      ['Run Name', 'Status', 'Started At', 'Duration', 'Articles Processed', 'Issues Found', 'Triggered By'].join(','),
      ...filteredRuns.map(run => [
        `"${run.run_name}"`,
        run.status,
        run.started_at ? formatDate(run.started_at) : 'N/A',
        formatDuration(run.duration_ms),
        run.total_articles_processed,
        run.total_issues_found,
        run.triggered_by || 'Unknown'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-history-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading audit history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <ClockIcon className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Audit History</h1>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                View and analyze historical audit runs with detailed insights and trends
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleNewAuditRun}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
                disabled={loading}
              >
                <PlayIcon className="h-4 w-4" />
                <span>New Audit Run</span>
              </Button>
              <Button
                onClick={handleExport}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                <span>Export CSV</span>
              </Button>
              <Button
                onClick={fetchAuditRuns}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <ChartBarIcon className="h-4 w-4" />
                <span>Refresh</span>
              </Button>
            </div>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'list', name: 'List View', icon: DocumentTextIcon },
                { id: 'timeline', name: 'Timeline', icon: CalendarIcon },
                { id: 'comparison', name: 'Comparison', icon: ChartBarIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setViewMode(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    viewMode === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <tab.icon className="h-4 w-4" />
                    <span>{tab.name}</span>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters & Search</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <FunnelIcon className="h-4 w-4" />
                <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
                {showFilters ? (
                  <ChevronUpIcon className="h-4 w-4" />
                ) : (
                  <ChevronDownIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          {showFilters && (
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Search
                  </label>
                  <div className="relative">
                    <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={filters.searchTerm}
                      onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                      placeholder="Search runs..."
                      className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">All Statuses</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                    <option value="running">Running</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Date Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date Range
                  </label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Last Week</option>
                    <option value="month">Last Month</option>
                  </select>
                </div>

                {/* Triggered By Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Triggered By
                  </label>
                  <select
                    value={filters.triggeredBy}
                    onChange={(e) => handleFilterChange('triggeredBy', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">All Sources</option>
                    <option value="user">User</option>
                    <option value="system">System</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="api">API</option>
                  </select>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Summary Cards */}
        <AuditSummary auditRuns={filteredRuns} />

        {/* Error Display */}
        {error && (
          <Card className="mb-6 border-red-200 dark:border-red-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                <ExclamationTriangleIcon className="h-5 w-5" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        {viewMode === 'timeline' && (
          <AuditTimeline
            auditRuns={filteredRuns}
            onRunSelect={handleRunSelect}
            selectedRun={selectedRun}
          />
        )}

        {viewMode === 'comparison' && (
          <AuditComparison auditRuns={filteredRuns} />
        )}

        {viewMode === 'list' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Audit Runs List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Audit Runs ({filteredRuns.length})
                  </h3>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Showing {filteredRuns.length} of {auditRuns.length} runs
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredRuns.length === 0 ? (
                  <div className="text-center py-8">
                    <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No audit runs found</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                      Try adjusting your filters or create a new audit run
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 pb-2">
                      <div className="col-span-4">
                        <button
                          onClick={() => handleSort('run_name')}
                          className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          <span>Run Name</span>
                          {sortOptions.field === 'run_name' && (
                            sortOptions.direction === 'asc' ?
                            <ChevronUpIcon className="h-3 w-3" /> :
                            <ChevronDownIcon className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                      <div className="col-span-2">
                        <button
                          onClick={() => handleSort('status')}
                          className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          <span>Status</span>
                          {sortOptions.field === 'status' && (
                            sortOptions.direction === 'asc' ?
                            <ChevronUpIcon className="h-3 w-3" /> :
                            <ChevronDownIcon className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                      <div className="col-span-2">
                        <button
                          onClick={() => handleSort('created_at')}
                          className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          <span>Created</span>
                          {sortOptions.field === 'created_at' && (
                            sortOptions.direction === 'asc' ?
                            <ChevronUpIcon className="h-3 w-3" /> :
                            <ChevronDownIcon className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                      <div className="col-span-2">Duration</div>
                      <div className="col-span-2">Issues</div>
                    </div>

                    {/* Table Rows */}
                    {filteredRuns.map((run) => (
                      <div
                        key={run.id}
                        onClick={() => handleRunSelect(run)}
                        className={`grid grid-cols-12 gap-4 p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedRun?.id === run.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        <div className="col-span-4">
                          <div className="font-medium text-gray-900 dark:text-white truncate">
                            {run.run_name}
                          </div>
                          {run.description && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {run.description}
                            </div>
                          )}
                        </div>
                        <div className="col-span-2">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(run.status)}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(run.status)}`}>
                              {run.status.charAt(0).toUpperCase() + run.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {formatDate(run.created_at)}
                          </div>
                          {run.triggered_by && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              by {run.triggered_by}
                            </div>
                          )}
                        </div>
                        <div className="col-span-2">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {formatDuration(run.duration_ms)}
                          </div>
                          {run.total_articles_processed > 0 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {run.total_articles_processed} articles
                            </div>
                          )}
                        </div>
                        <div className="col-span-2">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {run.total_issues_found}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {run.total_warnings_found} warnings
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detailed View Sidebar */}
          <div className="space-y-6">
            {selectedRun ? (
              <>
                {/* Run Details */}
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Run Details
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Run Name
                        </label>
                        <p className="text-gray-900 dark:text-white">{selectedRun.run_name}</p>
                      </div>

                      {selectedRun.description && (
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Description
                          </label>
                          <p className="text-gray-900 dark:text-white">{selectedRun.description}</p>
                        </div>
                      )}

                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Status
                        </label>
                        <div className="flex items-center space-x-2 mt-1">
                          {getStatusIcon(selectedRun.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedRun.status)}`}>
                            {selectedRun.status.charAt(0).toUpperCase() + selectedRun.status.slice(1)}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Articles
                          </label>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {selectedRun.total_articles_processed}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Issues
                          </label>
                          <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                            {selectedRun.total_issues_found}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Warnings
                          </label>
                          <p className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                            {selectedRun.total_warnings_found}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Suggestions
                          </label>
                          <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                            {selectedRun.total_suggestions_found}
                          </p>
                        </div>
                      </div>

                      {selectedRun.started_at && (
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Started At
                          </label>
                          <p className="text-gray-900 dark:text-white">
                            {formatDate(selectedRun.started_at)}
                          </p>
                        </div>
                      )}

                      {selectedRun.completed_at && (
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Completed At
                          </label>
                          <p className="text-gray-900 dark:text-white">
                            {formatDate(selectedRun.completed_at)}
                          </p>
                        </div>
                      )}

                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Duration
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {formatDuration(selectedRun.duration_ms)}
                        </p>
                      </div>

                      {selectedRun.triggered_by && (
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Triggered By
                          </label>
                          <p className="text-gray-900 dark:text-white">{selectedRun.triggered_by}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Audit Results */}
                {selectedRun.status === 'completed' && auditResults.length > 0 && (
                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Audit Results ({auditResults.length})
                      </h3>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {auditResults.map((result) => (
                          <div
                            key={result.id}
                            className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                                  {result.article_title}
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {result.rule_name}
                                </p>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                result.severity === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                result.severity === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                                result.severity === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              }`}>
                                {result.severity}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                              {result.issue_description}
                            </p>
                            {result.suggestion && (
                              <p className="text-xs text-blue-600 dark:text-blue-400">
                                💡 {result.suggestion}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Select an audit run to view details
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
}