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
  Cog6ToothIcon,
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  ComputerDesktopIcon
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

type SettingsTab = 'general' | 'data-sources' | 'notifications' | 'security';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [dataSourceStatus, setDataSourceStatus] = useState<DataSourceStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'data-sources') {
      fetchDataSourceStatus();
    }
  }, [activeTab]);

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

  const tabs = [
    { id: 'general', name: 'General', icon: Cog6ToothIcon },
    { id: 'data-sources', name: 'Data Sources', icon: CloudIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
  ];

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Application Preferences</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Configure general application settings</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">Auto-save drafts</label>
              <p className="text-sm text-gray-600 dark:text-gray-300">Automatically save article drafts while editing</p>
            </div>
            <input type="checkbox" defaultChecked className="rounded" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">Show audit suggestions</label>
              <p className="text-sm text-gray-600 dark:text-gray-300">Display AI-powered suggestions during audits</p>
            </div>
            <input type="checkbox" defaultChecked className="rounded" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">Enable analytics tracking</label>
              <p className="text-sm text-gray-600 dark:text-gray-300">Help improve the application with usage analytics</p>
            </div>
            <input type="checkbox" defaultChecked className="rounded" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Display Settings</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Customize the appearance and layout</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Items per page</label>
            <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option value="10">10 items</option>
              <option value="25" selected>25 items</option>
              <option value="50">50 items</option>
              <option value="100">100 items</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Default view</label>
            <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option value="list" selected>List view</option>
              <option value="grid">Grid view</option>
              <option value="compact">Compact view</option>
            </select>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDataSourcesSettings = () => (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <XCircleIcon className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Data Sources</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Manage external knowledge base sources and synchronization
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => handleSync()}
                disabled={syncing === 'all'}
                variant="outline"
                size="sm"
              >
                {syncing === 'all' ? (
                  <ArrowPathIcon className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <ArrowPathIcon className="h-4 w-4 mr-2" />
                )}
                Sync All
              </Button>
              <Button
                onClick={handleRealScrape}
                disabled={syncing === 'storehub-care-scrape'}
                variant="outline"
                size="sm"
              >
                {syncing === 'storehub-care-scrape' ? (
                  <ArrowPathIcon className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CloudIcon className="h-4 w-4 mr-2" />
                )}
                Real Scrape
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-200 dark:bg-gray-700 h-20 rounded-lg"></div>
              ))}
            </div>
          ) : dataSourceStatus ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {dataSourceStatus.totalSources}
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">Total Sources</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {dataSourceStatus.enabledSources}
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">Enabled</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {dataSourceStatus.sources.reduce((sum, source) => sum + (source.articlesCount || 0), 0)}
                  </div>
                  <div className="text-sm text-purple-600 dark:text-purple-400">Total Articles</div>
                </div>
              </div>

              <div className="space-y-3">
                {dataSourceStatus.sources.map((source) => (
                  <div
                    key={source.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(source)}
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{source.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{source.platform}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {source.articlesCount || 0} articles
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-300">
                            {getStatusText(source)}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleSync(source.id)}
                            disabled={syncing === source.id}
                            variant="outline"
                            size="sm"
                          >
                            {syncing === source.id ? (
                              <ArrowPathIcon className="h-4 w-4 animate-spin" />
                            ) : (
                              <ArrowPathIcon className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            onClick={() => handleToggleSource(source.id, !source.enabled)}
                            variant={source.enabled ? "outline" : "default"}
                            size="sm"
                          >
                            {source.enabled ? 'Disable' : 'Enable'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <CloudIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300">No data sources configured</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderNotificationsSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notification Preferences</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Configure when and how you receive notifications</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">Audit completion</label>
              <p className="text-sm text-gray-600 dark:text-gray-300">Notify when article audits are completed</p>
            </div>
            <input type="checkbox" defaultChecked className="rounded" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">System alerts</label>
              <p className="text-sm text-gray-600 dark:text-gray-300">Receive notifications about system issues</p>
            </div>
            <input type="checkbox" defaultChecked className="rounded" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">Data sync updates</label>
              <p className="text-sm text-gray-600 dark:text-gray-300">Get notified when data sources sync</p>
            </div>
            <input type="checkbox" className="rounded" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Security & Privacy</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Manage security settings and data privacy</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">Two-factor authentication</label>
              <p className="text-sm text-gray-600 dark:text-gray-300">Add an extra layer of security to your account</p>
            </div>
            <Button variant="outline" size="sm">Configure</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">Session timeout</label>
              <p className="text-sm text-gray-600 dark:text-gray-300">Automatically log out after inactivity</p>
            </div>
            <select className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option value="30">30 minutes</option>
              <option value="60" selected>1 hour</option>
              <option value="240">4 hours</option>
              <option value="480">8 hours</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">Data retention</label>
              <p className="text-sm text-gray-600 dark:text-gray-300">How long to keep audit history and logs</p>
            </div>
            <select className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option value="30">30 days</option>
              <option value="90" selected>90 days</option>
              <option value="180">6 months</option>
              <option value="365">1 year</option>
            </select>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'data-sources':
        return renderDataSourcesSettings();
      case 'notifications':
        return renderNotificationsSettings();
      case 'security':
        return renderSecuritySettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Configure application preferences and manage system settings.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Settings Navigation */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as SettingsTab)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
} 