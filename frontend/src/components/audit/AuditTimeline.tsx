'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import {
  CheckCircleIcon,
  XCircleIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  ClockIcon,
  ExclamationTriangleIcon
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

interface AuditTimelineProps {
  auditRuns: AuditRun[];
  onRunSelect: (run: AuditRun) => void;
  selectedRun?: AuditRun | null;
}

export function AuditTimeline({ auditRuns, onRunSelect, selectedRun }: AuditTimelineProps) {
  // Group runs by date
  const groupedRuns = auditRuns.reduce((groups, run) => {
    const date = new Date(run.created_at).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(run);
    return groups;
  }, {} as Record<string, AuditRun[]>);

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

  const getStatusColor = (status: AuditRun['status']) => {
    switch (status) {
      case 'completed':
        return 'border-green-500 bg-green-50 dark:bg-green-900/20';
      case 'failed':
        return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      case 'running':
        return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
      case 'pending':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'cancelled':
        return 'border-gray-500 bg-gray-50 dark:bg-gray-900/20';
      default:
        return 'border-gray-300 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
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

  const getSeverityIcon = (run: AuditRun) => {
    const criticalIssues = run.total_issues_found;
    if (criticalIssues > 20) {
      return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
    } else if (criticalIssues > 10) {
      return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />;
    }
    return null;
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-8">
          {Object.entries(groupedRuns)
            .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
            .map(([date, runs]) => (
              <div key={date} className="relative">
                {/* Date Header */}
                <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 py-2 mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {new Date(date).toLocaleDateString([], { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h3>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {runs.length} audit run{runs.length !== 1 ? 's' : ''}
                  </div>
                </div>

                {/* Timeline */}
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

                  {/* Timeline items */}
                  <div className="space-y-6">
                    {runs
                      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                      .map((run, index) => (
                        <div key={run.id} className="relative flex items-start">
                          {/* Timeline dot */}
                          <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 ${getStatusColor(run.status)}`}>
                            {getStatusIcon(run.status)}
                          </div>

                          {/* Content */}
                          <div className="ml-6 flex-1">
                            <div
                              onClick={() => onRunSelect(run)}
                              className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                                selectedRun?.id === run.id
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                              }`}
                            >
                              {/* Header */}
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                      {run.run_name}
                                    </h4>
                                    {getSeverityIcon(run)}
                                  </div>
                                  {run.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                      {run.description}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                                  <div>{formatTime(run.created_at)}</div>
                                  {run.triggered_by && (
                                    <div className="text-xs">by {run.triggered_by}</div>
                                  )}
                                </div>
                              </div>

                              {/* Metrics */}
                              <div className="grid grid-cols-4 gap-4 mt-3">
                                <div className="text-center">
                                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {run.total_articles_processed}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">Articles</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                                    {run.total_issues_found}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">Issues</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                                    {run.total_warnings_found}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">Warnings</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                                    {formatDuration(run.duration_ms)}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">Duration</div>
                                </div>
                              </div>

                              {/* Status bar */}
                              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between text-xs">
                                  <span className={`px-2 py-1 rounded-full font-medium ${
                                    run.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                    run.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                    run.status === 'running' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                    run.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                    'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                  }`}>
                                    {run.status.charAt(0).toUpperCase() + run.status.slice(1)}
                                  </span>
                                  {run.version && (
                                    <span className="text-gray-500 dark:text-gray-400">
                                      v{run.version}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ))}
        </div>

        {auditRuns.length === 0 && (
          <div className="text-center py-12">
            <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No audit runs to display</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
