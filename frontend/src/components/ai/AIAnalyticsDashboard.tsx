'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  ChartBarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  EyeIcon,
  LightBulbIcon,
  ClockIcon,
  UserGroupIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface AnalyticsData {
  totalAnalyses: number;
  contentGenerated: number;
  workflowsOptimized: number;
  collaborationSessions: number;
  averageImprovementScore: number;
  trendsData: Array<{
    date: string;
    analyses: number;
    generations: number;
    optimizations: number;
  }>;
}

interface AICapability {
  id: string;
  name: string;
  usage: number;
  category: string;
}

interface AnalyticsInsight {
  id: string;
  title: string;
  summary: string;
  type: 'trend' | 'recommendation' | 'alert';
  impact: 'high' | 'medium' | 'low';
  data: any;
}

interface AIAnalyticsDashboardProps {
  data: AnalyticsData;
  capabilities: AICapability[];
  onInsightGenerated: (insight: AnalyticsInsight) => void;
}

export function AIAnalyticsDashboard({ data, capabilities, onInsightGenerated }: AIAnalyticsDashboardProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  const generateInsights = async () => {
    setIsGeneratingInsights(true);
    
    // Simulate insight generation
    setTimeout(() => {
      const insights: AnalyticsInsight[] = [
        {
          id: 'trend-1',
          title: 'Content Generation Trending Up',
          summary: 'AI content generation has increased by 34% this week, indicating growing adoption of automated content creation.',
          type: 'trend',
          impact: 'high',
          data: { increase: 34, period: 'week' }
        },
        {
          id: 'rec-1',
          title: 'Optimize Workflow Automation',
          summary: 'Based on usage patterns, implementing automated workflows could save 15 hours per week.',
          type: 'recommendation',
          impact: 'medium',
          data: { timeSaved: 15, confidence: 0.87 }
        },
        {
          id: 'alert-1',
          title: 'Collaboration Usage Below Average',
          summary: 'Team collaboration features are underutilized. Consider training sessions to increase adoption.',
          type: 'alert',
          impact: 'medium',
          data: { currentUsage: 23, averageUsage: 45 }
        }
      ];

      insights.forEach(insight => onInsightGenerated(insight));
      setIsGeneratingInsights(false);
    }, 2000);
  };

  const getUsageColor = (usage: number) => {
    if (usage >= 80) return 'text-green-600';
    if (usage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getUsageBarColor = (usage: number) => {
    if (usage >= 80) return 'bg-green-500';
    if (usage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const calculateTrend = (data: AnalyticsData['trendsData'], metric: keyof AnalyticsData['trendsData'][0]) => {
    if (data.length < 2) return 0;
    const recent = data[data.length - 1][metric] as number;
    const previous = data[data.length - 2][metric] as number;
    return ((recent - previous) / previous) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ChartBarIcon className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Analytics Dashboard</h3>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
              <Button
                size="sm"
                onClick={generateInsights}
                disabled={isGeneratingInsights}
                className="flex items-center space-x-1"
              >
                <LightBulbIcon className="h-4 w-4" />
                <span>{isGeneratingInsights ? 'Generating...' : 'Generate Insights'}</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {data.totalAnalyses.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Analyses</div>
              <div className="flex items-center justify-center mt-1">
                <TrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-xs text-green-600">
                  +{Math.abs(calculateTrend(data.trendsData, 'analyses')).toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {data.contentGenerated}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Content Generated</div>
              <div className="flex items-center justify-center mt-1">
                <TrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-xs text-green-600">
                  +{Math.abs(calculateTrend(data.trendsData, 'generations')).toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {data.workflowsOptimized}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Workflows Optimized</div>
              <div className="flex items-center justify-center mt-1">
                <TrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-xs text-green-600">
                  +{Math.abs(calculateTrend(data.trendsData, 'optimizations')).toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {data.collaborationSessions}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Collaboration Sessions</div>
              <div className="flex items-center justify-center mt-1">
                <ClockIcon className="h-4 w-4 text-gray-500 mr-1" />
                <span className="text-xs text-gray-600">Active</span>
              </div>
            </div>

            <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {data.averageImprovementScore}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Improvement</div>
              <div className="flex items-center justify-center mt-1">
                <TrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-xs text-green-600">Excellent</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Capability Usage */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Capability Usage</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Usage statistics for different AI capabilities
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {capabilities.map((capability) => (
              <div key={capability.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {capability.name}
                    </span>
                    <span className={`text-sm font-semibold ${getUsageColor(capability.usage)}`}>
                      {capability.usage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getUsageBarColor(capability.usage)}`}
                      style={{ width: `${capability.usage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trends Chart */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Activity Trends</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Daily activity across different AI capabilities
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Simple trend visualization */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <EyeIcon className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Analyses</span>
                </div>
                <div className="flex items-center space-x-2">
                  {data.trendsData.map((day, index) => (
                    <div
                      key={index}
                      className="flex-1 bg-blue-200 dark:bg-blue-800 rounded"
                      style={{ height: `${(day.analyses / 70) * 40 + 10}px` }}
                      title={`${day.date}: ${day.analyses} analyses`}
                    />
                  ))}
                </div>
              </div>

              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <DocumentTextIcon className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Generations</span>
                </div>
                <div className="flex items-center space-x-2">
                  {data.trendsData.map((day, index) => (
                    <div
                      key={index}
                      className="flex-1 bg-green-200 dark:bg-green-800 rounded"
                      style={{ height: `${(day.generations / 20) * 40 + 10}px` }}
                      title={`${day.date}: ${day.generations} generations`}
                    />
                  ))}
                </div>
              </div>

              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <UserGroupIcon className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Optimizations</span>
                </div>
                <div className="flex items-center space-x-2">
                  {data.trendsData.map((day, index) => (
                    <div
                      key={index}
                      className="flex-1 bg-purple-200 dark:bg-purple-800 rounded"
                      style={{ height: `${(day.optimizations / 10) * 40 + 10}px` }}
                      title={`${day.date}: ${day.optimizations} optimizations`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Summary</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Top Performing Areas</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Content Analysis</span>
                  <span className="text-sm font-medium text-green-600">Excellent</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">AI Generation</span>
                  <span className="text-sm font-medium text-green-600">Very Good</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Workflow Optimization</span>
                  <span className="text-sm font-medium text-yellow-600">Good</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Improvement Opportunities</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Team Collaboration</span>
                  <span className="text-sm font-medium text-orange-600">Needs Attention</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Advanced Analytics</span>
                  <span className="text-sm font-medium text-yellow-600">Moderate</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Automation Adoption</span>
                  <span className="text-sm font-medium text-yellow-600">Growing</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
