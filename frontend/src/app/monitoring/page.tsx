'use client';

import React from 'react';
import { ErrorMonitoringDashboard } from '@/components/monitoring/ErrorMonitoringDashboard';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

export default function MonitoringPage() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">System Monitoring</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Monitor system health, track errors, and analyze performance metrics in real-time.
        </p>
      </div>

      <ErrorBoundary level="page" showDetails={true}>
        <ErrorMonitoringDashboard />
      </ErrorBoundary>
    </div>
  );
}
