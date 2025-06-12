'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { useUI } from '@/lib/context';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export function Header() {
  const { sidebarOpen, toggleSidebar, theme, setTheme } = useUI();

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="lg:hidden"
          >
            {sidebarOpen ? (
              <XMarkIcon className="h-5 w-5" />
            ) : (
              <Bars3Icon className="h-5 w-5" />
            )}
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SH</span>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                StoreHub Knowledge Base Auditor
              </h1>
              <p className="text-sm text-gray-500">
                AI-Powered Content Health Monitoring
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </Button>
          
          <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            <span>System Healthy</span>
          </div>
        </div>
      </div>
    </header>
  );
} 