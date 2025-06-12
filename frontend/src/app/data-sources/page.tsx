'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  XCircleIcon,
  CloudIcon,
  ArrowPathIcon,
  PlusIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { formatRelativeTime } from '@/lib/utils';

interface DataSource {
  id: string;
  name: string;
  platform: string;
  baseUrl: string;
  enabled: boolean;
  status: 'ready' | 'syncing' | 'success' | 'error';
  lastSync: string | null;
  syncCount: number;
  errorCount: number;
  lastError?: string;
  articlesCount?: number;
}

interface DataSourceStatus {
  isInitialized: boolean;
  totalSources: number;
  enabledSources: number;
  sources: DataSource[];
}

export default function DataSourcesPage() {
  const [dataSourceStatus, setDataSourceStatus] = useState<DataSourceStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDataSourceStatus();
  }, []);

  const fetchDataSourceStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ai/data-sources/status');
      const result = await response.json();
      
      if (result.status === 'success') {
        setDataSourceStatus(result.data);
      } else {
        setError('Failed to fetch data source status');
      }
    } catch (err) {
      setError('Failed to connect to API');
      console.error('Error fetching data source status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (sourceId?: string) => {
    try {
      setSyncing(sourceId || 'all');
      setError(null);

      const response = await fetch('/api/ai/data-sources/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sourceId, forceRefresh: true }),
      });

      const result = await response.json();

      if (result.status === 'success') {
        // Refresh the status after sync
        await fetchDataSourceStatus();
      } else {
        setError('Sync failed');
      }
    } catch (err) {
      setError('Sync request failed');
      console.error('Error syncing data source:', err);
    } finally {
      setSyncing(null);
    }
  };

  const handleRealScrape = async () => {
    try {
      setSyncing('storehub-care-scrape');
      setError(null);

      console.log('🏪 Starting real StoreHub Care scraping...');

      const response = await fetch('/api/scrape/storehub-care', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ maxArticlesPerCategory: 4, forceRefresh: true }),
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Scraping completed:', result.data);
        // Refresh the status after scraping
        await fetchDataSourceStatus();
      } else {
        setError('Real scraping failed');
      }
    } catch (err) {
      setError('Real scraping request failed');
      console.error('Error with real scraping:', err);
    } finally {
      setSyncing(null);
    }
  };

  const handleToggleSource = async (sourceId: string, enable: boolean) => {
    try {
      const endpoint = enable ? 'enable' : 'disable';
      const response = await fetch(`/api/ai/data-sources/${endpoint}/${sourceId}`);
      const result = await response.json();
      
      if (result.status === 'success') {
        await fetchDataSourceStatus();
      } else {
        setError(`Failed to ${endpoint} data source`);
      }
    } catch (err) {
      setError(`Failed to ${enable ? 'enable' : 'disable'} data source`);
      console.error('Error toggling data source:', err);
    }
  };

  const getStatusIcon = (source: DataSource) => {
    if (syncing === source.id) {
      return <ArrowPathIcon className="h-5 w-5 text-blue-500 animate-spin" />;
    }
    
    switch (source.status) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'syncing':
        return <ArrowPathIcon className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusText = (source: DataSource) => {
    if (syncing === source.id) return 'Syncing...';
    
    switch (source.status) {
      case 'success':
        return `Last synced ${source.lastSync ? formatRelativeTime(source.lastSync) : 'never'}`;
      case 'error':
        return source.lastError || 'Error occurred';
      case 'syncing':
        return 'Syncing...';
      default:
        return 'Ready to sync';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-200 dark:bg-gray-700 h-32 rounded-lg"></div>
            ))}
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Data Sources</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage external knowledge base sources and synchronization.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleRealScrape}
              disabled={syncing !== null}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
            >
              <CloudIcon className={`w-4 h-4 ${syncing === 'storehub-care-scrape' ? 'animate-spin' : ''}`} />
              <span>{syncing === 'storehub-care-scrape' ? 'Scraping...' : 'Scrape Real Data'}</span>
            </Button>
            <Button
              onClick={() => handleSync()}
              disabled={syncing !== null}
              className="flex items-center space-x-2"
            >
              <ArrowPathIcon className={`w-4 h-4 ${syncing === 'all' ? 'animate-spin' : ''}`} />
              <span>Sync All</span>
            </Button>
            <Button
              variant="outline"
              onClick={fetchDataSourceStatus}
              className="flex items-center space-x-2"
            >
              <ArrowPathIcon className="w-4 h-4" />
              <span>Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <XCircleIcon className="h-5 w-5 text-red-500" />
            <span className="text-red-700 dark:text-red-300">{error}</span>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {dataSourceStatus && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Sources</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{dataSourceStatus.totalSources}</p>
                </div>
                <CloudIcon className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Enabled Sources</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{dataSourceStatus.enabledSources}</p>
                </div>
                <CheckCircleIcon className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">System Status</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dataSourceStatus.isInitialized ? 'Ready' : 'Initializing'}
                  </p>
                </div>
                <Cog6ToothIcon className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Data Sources List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Configured Sources</h3>
            <Button variant="outline" className="flex items-center space-x-2">
              <PlusIcon className="w-4 h-4" />
              <span>Add Source</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {dataSourceStatus?.sources.length === 0 ? (
            <div className="text-center py-8">
              <CloudIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No data sources configured</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dataSourceStatus?.sources.map((source) => (
                <div key={source.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(source)}
                        <div>
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                            {source.name || source.id}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{source.baseUrl}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>Platform: {source.platform}</span>
                        <span>Syncs: {source.syncCount}</span>
                        {source.errorCount > 0 && (
                          <span className="text-red-500">Errors: {source.errorCount}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {getStatusText(source)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSync(source.id)}
                        disabled={syncing !== null}
                      >
                        Sync
                      </Button>
                      <Button
                        variant={source.enabled ? "destructive" : "primary"}
                        size="sm"
                        onClick={() => handleToggleSource(source.id, !source.enabled)}
                      >
                        {source.enabled ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
