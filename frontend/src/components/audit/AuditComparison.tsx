'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

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

interface AuditComparisonProps {
  auditRuns: AuditRun[];
}

export function AuditComparison({ auditRuns }: AuditComparisonProps) {
  const [selectedRuns, setSelectedRuns] = useState<AuditRun[]>([]);
  const [availableRuns, setAvailableRuns] = useState<AuditRun[]>(
    auditRuns.filter(run => run.status === 'completed').slice(0, 10)
  );

  const addRunToComparison = (run: AuditRun) => {
    if (selectedRuns.length < 3 && !selectedRuns.find(r => r.id === run.id)) {
      setSelectedRuns([...selectedRuns, run]);
    }
  };

  const removeRunFromComparison = (runId: string) => {
    setSelectedRuns(selectedRuns.filter(run => run.id !== runId));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return 'N/A';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return { direction: 'neutral', percentage: 0 };
    const change = ((current - previous) / previous) * 100;
    return {
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
      percentage: Math.abs(change)
    };
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up':
        return <ArrowUpIcon className="h-4 w-4 text-red-500" />;
      case 'down':
        return <ArrowDownIcon className="h-4 w-4 text-green-500" />;
      default:
        return <MinusIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (direction: string, isIssue: boolean = false) => {
    if (direction === 'neutral') return 'text-gray-500';
    
    // For issues/warnings, down is good (green), up is bad (red)
    // For articles processed, up is good (green), down is bad (red)
    if (isIssue) {
      return direction === 'down' ? 'text-green-500' : 'text-red-500';
    } else {
      return direction === 'up' ? 'text-green-500' : 'text-red-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Run Selection */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Select Audit Runs to Compare (Max 3)
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Choose up to 3 completed audit runs to compare their results
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableRuns.map((run) => (
              <div
                key={run.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedRuns.find(r => r.id === run.id)
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                onClick={() => {
                  if (selectedRuns.find(r => r.id === run.id)) {
                    removeRunFromComparison(run.id);
                  } else {
                    addRunToComparison(run);
                  }
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                    {run.run_name}
                  </h4>
                  {selectedRuns.find(r => r.id === run.id) ? (
                    <CheckCircleIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  ) : (
                    <div className="h-5 w-5 border border-gray-300 dark:border-gray-600 rounded-full flex-shrink-0"></div>
                  )}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(run.created_at)} • {run.total_issues_found} issues
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Results */}
      {selectedRuns.length >= 2 && (
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <ChartBarIcon className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Comparison Results
              </h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                      Metric
                    </th>
                    {selectedRuns.map((run, index) => (
                      <th key={run.id} className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">
                        <div className="space-y-1">
                          <div className="text-sm truncate">{run.run_name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(run.created_at)}
                          </div>
                          {index > 0 && (
                            <div className="text-xs text-blue-600 dark:text-blue-400">
                              vs Previous
                            </div>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {/* Articles Processed */}
                  <tr>
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                      Articles Processed
                    </td>
                    {selectedRuns.map((run, index) => {
                      const trend = index > 0 ? calculateTrend(
                        run.total_articles_processed,
                        selectedRuns[index - 1].total_articles_processed
                      ) : null;
                      
                      return (
                        <td key={run.id} className="py-3 px-4 text-center">
                          <div className="space-y-1">
                            <div className="text-lg font-semibold text-gray-900 dark:text-white">
                              {run.total_articles_processed}
                            </div>
                            {trend && (
                              <div className={`flex items-center justify-center space-x-1 text-xs ${getTrendColor(trend.direction, false)}`}>
                                {getTrendIcon(trend.direction)}
                                <span>{trend.percentage.toFixed(1)}%</span>
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Issues Found */}
                  <tr>
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                      Issues Found
                    </td>
                    {selectedRuns.map((run, index) => {
                      const trend = index > 0 ? calculateTrend(
                        run.total_issues_found,
                        selectedRuns[index - 1].total_issues_found
                      ) : null;
                      
                      return (
                        <td key={run.id} className="py-3 px-4 text-center">
                          <div className="space-y-1">
                            <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                              {run.total_issues_found}
                            </div>
                            {trend && (
                              <div className={`flex items-center justify-center space-x-1 text-xs ${getTrendColor(trend.direction, true)}`}>
                                {getTrendIcon(trend.direction)}
                                <span>{trend.percentage.toFixed(1)}%</span>
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Warnings Found */}
                  <tr>
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                      Warnings Found
                    </td>
                    {selectedRuns.map((run, index) => {
                      const trend = index > 0 ? calculateTrend(
                        run.total_warnings_found,
                        selectedRuns[index - 1].total_warnings_found
                      ) : null;
                      
                      return (
                        <td key={run.id} className="py-3 px-4 text-center">
                          <div className="space-y-1">
                            <div className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                              {run.total_warnings_found}
                            </div>
                            {trend && (
                              <div className={`flex items-center justify-center space-x-1 text-xs ${getTrendColor(trend.direction, true)}`}>
                                {getTrendIcon(trend.direction)}
                                <span>{trend.percentage.toFixed(1)}%</span>
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Suggestions */}
                  <tr>
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                      Suggestions
                    </td>
                    {selectedRuns.map((run, index) => {
                      const trend = index > 0 ? calculateTrend(
                        run.total_suggestions_found,
                        selectedRuns[index - 1].total_suggestions_found
                      ) : null;
                      
                      return (
                        <td key={run.id} className="py-3 px-4 text-center">
                          <div className="space-y-1">
                            <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                              {run.total_suggestions_found}
                            </div>
                            {trend && (
                              <div className={`flex items-center justify-center space-x-1 text-xs ${getTrendColor(trend.direction, false)}`}>
                                {getTrendIcon(trend.direction)}
                                <span>{trend.percentage.toFixed(1)}%</span>
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Duration */}
                  <tr>
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                      Duration
                    </td>
                    {selectedRuns.map((run, index) => {
                      const trend = index > 0 && run.duration_ms && selectedRuns[index - 1].duration_ms ? calculateTrend(
                        run.duration_ms,
                        selectedRuns[index - 1].duration_ms!
                      ) : null;
                      
                      return (
                        <td key={run.id} className="py-3 px-4 text-center">
                          <div className="space-y-1">
                            <div className="text-lg font-semibold text-gray-900 dark:text-white">
                              {formatDuration(run.duration_ms)}
                            </div>
                            {trend && (
                              <div className={`flex items-center justify-center space-x-1 text-xs ${getTrendColor(trend.direction, true)}`}>
                                {getTrendIcon(trend.direction)}
                                <span>{trend.percentage.toFixed(1)}%</span>
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Summary</h4>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p>• Comparing {selectedRuns.length} audit runs</p>
                <p>• Date range: {formatDate(selectedRuns[selectedRuns.length - 1].created_at)} to {formatDate(selectedRuns[0].created_at)}</p>
                <p>• Total articles processed: {selectedRuns.reduce((sum, run) => sum + run.total_articles_processed, 0)}</p>
                <p>• Total issues found: {selectedRuns.reduce((sum, run) => sum + run.total_issues_found, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedRuns.length === 1 && (
        <Card>
          <CardContent className="p-8 text-center">
            <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Select at least 2 audit runs to compare
            </p>
          </CardContent>
        </Card>
      )}

      {selectedRuns.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Select audit runs above to start comparing
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
