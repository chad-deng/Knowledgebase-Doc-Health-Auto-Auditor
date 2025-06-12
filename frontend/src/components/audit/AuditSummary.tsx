'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import {
  ChartBarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

interface AuditRun {
  id: string;
  run_name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  total_articles_processed: number;
  total_issues_found: number;
  total_warnings_found: number;
  total_suggestions_found: number;
  duration_ms?: number;
  created_at: string;
}

interface AuditSummaryProps {
  auditRuns: AuditRun[];
}

export function AuditSummary({ auditRuns }: AuditSummaryProps) {
  const completedRuns = auditRuns.filter(run => run.status === 'completed');
  const recentRuns = completedRuns.slice(0, 5);
  const previousRuns = completedRuns.slice(5, 10);

  // Calculate totals
  const totalArticles = recentRuns.reduce((sum, run) => sum + run.total_articles_processed, 0);
  const totalIssues = recentRuns.reduce((sum, run) => sum + run.total_issues_found, 0);
  const totalWarnings = recentRuns.reduce((sum, run) => sum + run.total_warnings_found, 0);
  const totalSuggestions = recentRuns.reduce((sum, run) => sum + run.total_suggestions_found, 0);
  const avgDuration = recentRuns.reduce((sum, run) => sum + (run.duration_ms || 0), 0) / recentRuns.length;

  // Calculate trends (compare recent vs previous)
  const previousTotalIssues = previousRuns.reduce((sum, run) => sum + run.total_issues_found, 0);
  const issuesTrend = previousTotalIssues > 0 ? ((totalIssues - previousTotalIssues) / previousTotalIssues) * 100 : 0;

  const previousTotalWarnings = previousRuns.reduce((sum, run) => sum + run.total_warnings_found, 0);
  const warningsTrend = previousTotalWarnings > 0 ? ((totalWarnings - previousTotalWarnings) / previousTotalWarnings) * 100 : 0;

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <ArrowTrendingUpIcon className="h-4 w-4 text-red-500" />;
    if (trend < 0) return <ArrowTrendingDownIcon className="h-4 w-4 text-green-500" />;
    return <div className="h-4 w-4" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-red-500';
    if (trend < 0) return 'text-green-500';
    return 'text-gray-500';
  };

  const getHealthScore = () => {
    if (recentRuns.length === 0) return 0;
    
    const avgIssuesPerArticle = totalIssues / Math.max(totalArticles, 1);
    const avgWarningsPerArticle = totalWarnings / Math.max(totalArticles, 1);
    
    // Health score: 100 - (issues_weight * avg_issues + warnings_weight * avg_warnings)
    const healthScore = Math.max(0, 100 - (avgIssuesPerArticle * 20 + avgWarningsPerArticle * 10));
    return Math.round(healthScore);
  };

  const healthScore = getHealthScore();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {/* Health Score */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Health Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{healthScore}%</p>
            </div>
            <div className={`p-3 rounded-full ${
              healthScore >= 80 ? 'bg-green-100 dark:bg-green-900/20' :
              healthScore >= 60 ? 'bg-yellow-100 dark:bg-yellow-900/20' :
              'bg-red-100 dark:bg-red-900/20'
            }`}>
              {healthScore >= 80 ? (
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              ) : (
                <ExclamationTriangleIcon className={`h-6 w-6 ${
                  healthScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`} />
              )}
            </div>
          </div>
          <div className="mt-2">
            <span className={`text-xs ${
              healthScore >= 80 ? 'text-green-600' :
              healthScore >= 60 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {healthScore >= 80 ? 'Excellent' :
               healthScore >= 60 ? 'Good' :
               healthScore >= 40 ? 'Fair' : 'Needs Attention'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Total Issues */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Issues</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{totalIssues}</p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center space-x-1">
            {getTrendIcon(issuesTrend)}
            <span className={`text-xs ${getTrendColor(issuesTrend)}`}>
              {Math.abs(issuesTrend).toFixed(1)}% vs previous period
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Total Warnings */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Warnings</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{totalWarnings}</p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center space-x-1">
            {getTrendIcon(warningsTrend)}
            <span className={`text-xs ${getTrendColor(warningsTrend)}`}>
              {Math.abs(warningsTrend).toFixed(1)}% vs previous period
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Articles Processed */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Articles Processed</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalArticles}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <DocumentTextIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Last {recentRuns.length} runs
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Summary */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Latest Run */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Latest Run</h4>
              {recentRuns.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {recentRuns[0].run_name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {new Date(recentRuns[0].created_at).toLocaleDateString()}
                  </p>
                  <div className="flex items-center space-x-4 text-xs">
                    <span className="text-red-600 dark:text-red-400">
                      {recentRuns[0].total_issues_found} issues
                    </span>
                    <span className="text-yellow-600 dark:text-yellow-400">
                      {recentRuns[0].total_warnings_found} warnings
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No recent runs</p>
              )}
            </div>

            {/* Average Duration */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Average Duration</h4>
              <div className="flex items-center space-x-2">
                <ClockIcon className="h-5 w-5 text-gray-400" />
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatDuration(avgDuration)}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Based on {recentRuns.length} recent runs
              </p>
            </div>

            {/* Success Rate */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Success Rate</h4>
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {auditRuns.length > 0 ? Math.round((completedRuns.length / auditRuns.length) * 100) : 0}%
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {completedRuns.length} of {auditRuns.length} runs completed
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
