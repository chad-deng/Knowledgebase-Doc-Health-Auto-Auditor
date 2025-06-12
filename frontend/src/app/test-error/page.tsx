'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { useErrorHandler } from '@/utils/errorHandling';
import { useNetworkErrorHandler } from '@/utils/networkErrorHandler';

// Component that throws an error
function ErrorThrowingComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error from component');
  }
  return <div>Component is working fine!</div>;
}

export default function TestErrorPage() {
  const [throwError, setThrowError] = useState(false);
  const [lastAction, setLastAction] = useState<string>('');
  const { handleError, handleAsyncError } = useErrorHandler();
  const { fetchJSON } = useNetworkErrorHandler();

  // Test async error
  const testAsyncError = async () => {
    setLastAction('Testing async error handling...');
    try {
      await handleAsyncError(
        async () => {
          throw new Error('Test async error');
        },
        { component: 'TestErrorPage', operation: 'testAsyncError' }
      );
    } catch (error) {
      setLastAction('✅ Async error successfully handled and logged!');
      console.log('Async error handled:', error);
    }
  };

  // Test network error
  const testNetworkError = async () => {
    setLastAction('Testing network error handling...');
    try {
      await fetchJSON('http://localhost:3001/api/nonexistent-endpoint');
    } catch (error) {
      setLastAction('✅ Network error successfully handled with retry logic!');
      console.log('Network error handled:', error);
    }
  };

  // Test manual error reporting
  const testManualError = () => {
    setLastAction('Testing manual error reporting...');
    const error = new Error('Manual test error');
    const errorId = handleError(error, {
      component: 'TestErrorPage',
      operation: 'testManualError',
      metadata: { testType: 'manual' }
    });
    setLastAction(`✅ Manual error successfully reported! Error ID: ${errorId}`);
    console.log('Manual error reported with ID:', errorId);
  };

  // Test unhandled promise rejection
  const testUnhandledPromise = () => {
    setLastAction('Testing unhandled promise rejection...');
    // This will trigger the global unhandled promise rejection handler
    Promise.reject(new Error('Test unhandled promise rejection'));
    setTimeout(() => {
      setLastAction('✅ Unhandled promise rejection successfully caught by global handler!');
    }, 100);
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Error Handling Test Page</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Test various error scenarios to verify the error handling system is working correctly.
        </p>
        {lastAction && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-blue-800 dark:text-blue-200 text-sm font-medium">
              {lastAction}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Component Error Test */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Component Error Test</h3>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Test React Error Boundary by throwing an error in a component.
            </p>
            <ErrorBoundary level="component" showDetails={true}>
              <ErrorThrowingComponent shouldThrow={throwError} />
            </ErrorBoundary>
            <div className="mt-4 space-y-2">
              <Button
                onClick={() => {
                  setLastAction('Testing React Error Boundary...');
                  setThrowError(true);
                  setTimeout(() => {
                    setLastAction('✅ Component error successfully caught by Error Boundary!');
                  }, 100);
                }}
                variant="destructive"
                size="sm"
              >
                Throw Component Error
              </Button>
              <Button
                onClick={() => {
                  setThrowError(false);
                  setLastAction('Component reset successfully');
                }}
                variant="outline"
                size="sm"
              >
                Reset Component
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Async Error Test */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Async Error Test</h3>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Test async error handling with proper error reporting.
            </p>
            <Button 
              onClick={testAsyncError}
              variant="destructive"
              size="sm"
            >
              Test Async Error
            </Button>
          </CardContent>
        </Card>

        {/* Network Error Test */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Network Error Test</h3>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Test network error handling with retry mechanisms.
            </p>
            <Button 
              onClick={testNetworkError}
              variant="destructive"
              size="sm"
            >
              Test Network Error
            </Button>
          </CardContent>
        </Card>

        {/* Manual Error Test */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Manual Error Test</h3>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Test manual error reporting with custom context.
            </p>
            <Button 
              onClick={testManualError}
              variant="destructive"
              size="sm"
            >
              Report Manual Error
            </Button>
          </CardContent>
        </Card>

        {/* Unhandled Promise Test */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Unhandled Promise Test</h3>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Test global unhandled promise rejection handling.
            </p>
            <Button 
              onClick={testUnhandledPromise}
              variant="destructive"
              size="sm"
            >
              Test Unhandled Promise
            </Button>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="md:col-span-2">
          <CardHeader>
            <h3 className="text-lg font-semibold">Testing Instructions</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p><strong>1. Component Error:</strong> Click "Throw Component Error" to test React Error Boundary.</p>
              <p><strong>2. Async Error:</strong> Click "Test Async Error" and check console for error handling.</p>
              <p><strong>3. Network Error:</strong> Click "Test Network Error" to test network error handling with retry.</p>
              <p><strong>4. Manual Error:</strong> Click "Report Manual Error" to test manual error reporting.</p>
              <p><strong>5. Unhandled Promise:</strong> Click "Test Unhandled Promise" to test global error handling.</p>
              <p><strong>6. Monitoring:</strong> Check the <a href="/monitoring" className="text-blue-600 hover:underline">monitoring dashboard</a> to see error reports.</p>
              <p><strong>7. Backend Logs:</strong> Check the backend console for error logging and correlation IDs.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
