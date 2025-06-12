'use client';

import { useState, useEffect } from 'react';
import { ChartBarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, ClockIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface AnalyticsData {
  auditStats: {
    totalAudits: number;
    passedAudits: number;
    failedAudits: number;
    averageScore: number;
    trendsData: Array<{ date: string; audits: number; score: number }>;
  };
  systemHealth: {
    uptime: string;
    responseTime: number;
    requestsPerHour: number;
    errorRate: number;
  };
  contentHealth: {
    totalArticles: number;
    healthyArticles: number;
    warningArticles: number;
    criticalArticles: number;
    topIssues: Array<{ type: string; count: number; severity: 'low' | 'medium' | 'high' }>;
  };
  performance: {
    averageAuditTime: number;
    rulesExecuted: number;
    aiSuggestions: number;
    processingSpeed: number;
  };
}

const mockAnalyticsData: AnalyticsData = {
  auditStats: {
    totalAudits: 127,
    passedAudits: 98,
    failedAudits: 29,
    averageScore: 78.5,
    trendsData: [
      { date: '2025-06-07', audits: 15, score: 72.1 },
      { date: '2025-06-08', audits: 22, score: 75.3 },
      { date: '2025-06-09', audits: 18, score: 76.8 },
      { date: '2025-06-10', audits: 25, score: 79.2 },
      { date: '2025-06-11', audits: 19, score: 78.5 }
    ]
  },
  systemHealth: {
    uptime: '99.94%',
    responseTime: 145,
    requestsPerHour: 1847,
    errorRate: 0.06
  },
  contentHealth: {
    totalArticles: 6,
    healthyArticles: 4,
    warningArticles: 2,
    criticalArticles: 0,
    topIssues: [
      { type: 'Missing Meta Description', count: 12, severity: 'medium' },
      { type: 'Outdated Content', count: 8, severity: 'high' },
      { type: 'Grammar Issues', count: 15, severity: 'low' },
      { type: 'Broken Links', count: 3, severity: 'high' },
      { type: 'SEO Issues', count: 9, severity: 'low' }
    ]
  },
  performance: {
    averageAuditTime: 2.3,
    rulesExecuted: 635,
    aiSuggestions: 89,
    processingSpeed: 94.2
  }
};

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

function MetricCard({ title, value, change, icon: Icon, color = 'blue' }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200'
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              {change >= 0 ? (
                <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {Math.abs(change)}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

interface SimpleChartProps {
  data: Array<{ date: string; audits: number; score: number }>;
  type: 'audits' | 'score';
}

function SimpleChart({ data, type }: SimpleChartProps) {
  const maxValue = Math.max(...data.map(d => type === 'audits' ? d.audits : d.score));
  const minValue = Math.min(...data.map(d => type === 'audits' ? d.audits : d.score));
  const range = maxValue - minValue;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {type === 'audits' ? 'Daily Audit Volume' : 'Average Content Score'}
      </h3>
      <div className="h-64 flex items-end justify-between space-x-2">
        {data.map((item, index) => {
          const value = type === 'audits' ? item.audits : item.score;
          const height = range > 0 ? ((value - minValue) / range) * 200 + 20 : 100;
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className={`w-full ${type === 'audits' ? 'bg-blue-500' : 'bg-green-500'} rounded-t-sm transition-all duration-300 hover:opacity-80`}
                style={{ height: `${height}px` }}
                title={`${item.date}: ${value}${type === 'score' ? '%' : ' audits'}`}
              ></div>
              <div className="text-xs text-gray-600 mt-2 transform -rotate-45">
                {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  title: string;
}

function DonutChart({ data, title }: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let cumulativePercentage = 0;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="flex items-center justify-center">
        <div className="relative w-48 h-48">
          <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="#f3f4f6"
              strokeWidth="20"
            />
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const strokeDasharray = `${percentage * 5.02} 502`;
              const strokeDashoffset = -cumulativePercentage * 5.02;
              cumulativePercentage += percentage;

              return (
                <circle
                  key={index}
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke={item.color}
                  strokeWidth="20"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-300"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>
        </div>
        <div className="ml-8 space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center">
              <div 
                className="w-4 h-4 rounded-full mr-3"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-sm text-gray-700">{item.label}: {item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>(mockAnalyticsData);
  const [isLoading, setIsLoading] = useState(false);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAnalyticsData(prev => ({
        ...prev,
        systemHealth: {
          ...prev.systemHealth,
          responseTime: prev.systemHealth.responseTime + (Math.random() - 0.5) * 10,
          requestsPerHour: prev.systemHealth.requestsPerHour + Math.floor((Math.random() - 0.5) * 100)
        }
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const contentHealthData = [
    { label: 'Healthy', value: analyticsData.contentHealth.healthyArticles, color: '#10b981' },
    { label: 'Warning', value: analyticsData.contentHealth.warningArticles, color: '#f59e0b' },
    { label: 'Critical', value: analyticsData.contentHealth.criticalArticles, color: '#ef4444' }
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Audits"
          value={analyticsData.auditStats.totalAudits}
          change={12}
          icon={ChartBarIcon}
          color="blue"
        />
        <MetricCard
          title="Average Score"
          value={`${analyticsData.auditStats.averageScore}%`}
          change={3.2}
          icon={ArrowTrendingUpIcon}
          color="green"
        />
        <MetricCard
          title="Response Time"
          value={`${analyticsData.systemHealth.responseTime.toFixed(0)}ms`}
          change={-5.1}
          icon={ClockIcon}
          color="purple"
        />
        <MetricCard
          title="System Uptime"
          value={analyticsData.systemHealth.uptime}
          change={0.1}
          icon={CheckCircleIcon}
          color="green"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleChart data={analyticsData.auditStats.trendsData} type="audits" />
        <SimpleChart data={analyticsData.auditStats.trendsData} type="score" />
      </div>

      {/* Content Health and Issues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DonutChart 
          data={contentHealthData} 
          title="Content Health Distribution"
        />
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Top Issues</h3>
          <div className="space-y-3">
            {analyticsData.contentHealth.topIssues.map((issue, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    issue.severity === 'high' ? 'bg-red-500' :
                    issue.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-900">{issue.type}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{issue.count} issues</span>
                  <ExclamationTriangleIcon className={`w-4 h-4 ${
                    issue.severity === 'high' ? 'text-red-500' :
                    issue.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                  }`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{analyticsData.performance.averageAuditTime}s</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Audit Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{analyticsData.performance.rulesExecuted}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Rules Executed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{analyticsData.performance.aiSuggestions}</div>
            <div className="text-sm text-gray-600">AI Suggestions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{analyticsData.performance.processingSpeed}%</div>
            <div className="text-sm text-gray-600">Processing Speed</div>
          </div>
        </div>
      </div>
    </div>
  );
}