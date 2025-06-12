'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
  HomeIcon,
  BugAntIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  retryCount: number;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo, errorId: string) => void;
  showDetails?: boolean;
  maxRetries?: number;
  level?: 'page' | 'component' | 'critical';
}

/**
 * Enhanced Error Boundary with comprehensive error handling, logging, and recovery options
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Generate unique error ID
    const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError } = this.props;
    const { errorId } = this.state;

    // Update state with error info
    this.setState({ errorInfo });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error);
      console.error('Error Info:', errorInfo);
    }

    // Send error to logging service
    this.logError(error, errorInfo, errorId);

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo, errorId);
    }

    // Track error in analytics (if available)
    this.trackError(error, errorInfo, errorId);
  }

  /**
   * Log error to backend logging service
   */
  private async logError(error: Error, errorInfo: ErrorInfo, errorId: string) {
    try {
      const errorData = {
        errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        level: this.props.level || 'component',
        timestamp: new Date().toISOString(),
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'SSR',
        url: typeof window !== 'undefined' ? window.location.href : 'SSR',
        userId: this.getUserId(), // Implement based on your auth system
        sessionId: this.getSessionId()
      };

      // Send to backend logging endpoint
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      await fetch(`${backendUrl}/api/monitoring/frontend-error`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(errorData)
      }).catch(err => {
        console.error('Failed to log error to backend:', err);
      });

    } catch (loggingError) {
      console.error('Error in error logging:', loggingError);
    }
  }

  /**
   * Track error in analytics
   */
  private trackError(error: Error, errorInfo: ErrorInfo, errorId: string) {
    try {
      // Track error event (implement based on your analytics service)
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'exception', {
          description: error.message,
          fatal: this.props.level === 'critical',
          error_id: errorId
        });
      }
    } catch (trackingError) {
      console.error('Error in error tracking:', trackingError);
    }
  }

  /**
   * Get user ID (implement based on your auth system)
   */
  private getUserId(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      // Implement based on your authentication system
      return localStorage.getItem('userId') || null;
    } catch {
      return null;
    }
  }

  /**
   * Get session ID
   */
  private getSessionId(): string {
    if (typeof window === 'undefined') return `session_ssr_${Date.now()}`;
    try {
      let sessionId = sessionStorage.getItem('sessionId');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('sessionId', sessionId);
      }
      return sessionId;
    } catch {
      return `session_${Date.now()}`;
    }
  }

  /**
   * Retry rendering the component
   */
  private handleRetry = () => {
    const { maxRetries = 3 } = this.props;
    const { retryCount } = this.state;

    if (retryCount < maxRetries) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: retryCount + 1
      });

      // Auto-retry with exponential backoff for certain errors
      if (this.shouldAutoRetry()) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s, etc.
        this.retryTimeoutId = setTimeout(() => {
          this.handleRetry();
        }, delay);
      }
    }
  };

  /**
   * Check if error should trigger auto-retry
   */
  private shouldAutoRetry(): boolean {
    const { error } = this.state;
    if (!error) return false;

    // Auto-retry for network errors, chunk loading errors, etc.
    const autoRetryErrors = [
      'ChunkLoadError',
      'Loading chunk',
      'Loading CSS chunk',
      'NetworkError',
      'Failed to fetch'
    ];

    return autoRetryErrors.some(errorType => 
      error.message.includes(errorType) || error.name.includes(errorType)
    );
  }

  /**
   * Navigate to home page
   */
  private handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  /**
   * Copy error details to clipboard
   */
  private handleCopyError = async () => {
    const { error, errorInfo, errorId } = this.state;
    
    const errorDetails = {
      errorId,
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'SSR'
    };

    if (typeof window !== 'undefined') {
      try {
        await navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
        alert('Error details copied to clipboard');
      } catch {
        console.error('Failed to copy error details');
      }
    }
  };

  /**
   * Report error to support
   */
  private handleReportError = () => {
    if (typeof window === 'undefined') return;

    const { errorId } = this.state;
    const subject = encodeURIComponent(`Error Report - ${errorId}`);
    const body = encodeURIComponent(`Error ID: ${errorId}\nURL: ${window.location.href}\nTimestamp: ${new Date().toISOString()}\n\nPlease describe what you were doing when this error occurred:`);

    window.open(`mailto:support@example.com?subject=${subject}&body=${body}`);
  };

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  render() {
    const { hasError, error, errorId, retryCount } = this.state;
    const { children, fallback, showDetails = false, maxRetries = 3, level = 'component' } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Different error displays based on level
      if (level === 'critical') {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <Card className="max-w-md w-full mx-4">
              <CardHeader>
                <div className="flex items-center space-x-2 text-red-600">
                  <ExclamationTriangleIcon className="h-6 w-6" />
                  <h2 className="text-lg font-semibold">Critical Error</h2>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  A critical error has occurred. Please refresh the page or contact support.
                </p>
                <div className="space-y-2">
                  <Button onClick={() => typeof window !== 'undefined' && window.location.reload()} className="w-full">
                    <ArrowPathIcon className="h-4 w-4 mr-2" />
                    Refresh Page
                  </Button>
                  <Button variant="outline" onClick={this.handleGoHome} className="w-full">
                    <HomeIcon className="h-4 w-4 mr-2" />
                    Go to Home
                  </Button>
                </div>
                {showDetails && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm text-gray-500">Error Details</summary>
                    <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto">
                      {error?.stack}
                    </pre>
                  </details>
                )}
              </CardContent>
            </Card>
          </div>
        );
      }

      // Component-level error display
      return (
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-red-600">
                <BugAntIcon className="h-5 w-5" />
                <h3 className="font-medium">Something went wrong</h3>
              </div>
              <span className="text-xs text-gray-500">ID: {errorId}</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {error?.message || 'An unexpected error occurred in this component.'}
            </p>
            
            <div className="flex flex-wrap gap-2">
              {retryCount < maxRetries && (
                <Button size="sm" onClick={this.handleRetry}>
                  <ArrowPathIcon className="h-4 w-4 mr-1" />
                  Retry ({maxRetries - retryCount} left)
                </Button>
              )}
              
              <Button size="sm" variant="outline" onClick={this.handleCopyError}>
                <ClipboardDocumentIcon className="h-4 w-4 mr-1" />
                Copy Error
              </Button>
              
              <Button size="sm" variant="outline" onClick={this.handleReportError}>
                Report Issue
              </Button>
            </div>

            {showDetails && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-gray-500">Technical Details</summary>
                <div className="mt-2 space-y-2">
                  <div>
                    <strong className="text-xs">Error:</strong>
                    <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1 overflow-auto">
                      {error?.message}
                    </pre>
                  </div>
                  {process.env.NODE_ENV === 'development' && (
                    <div>
                      <strong className="text-xs">Stack Trace:</strong>
                      <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1 overflow-auto">
                        {error?.stack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </CardContent>
        </Card>
      );
    }

    return children;
  }
}

/**
 * Higher-order component for wrapping components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

/**
 * Hook for manually reporting errors
 */
export function useErrorReporting() {
  const reportError = (error: Error, context?: Record<string, any>) => {
    const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.error('Manual error report:', error);
    
    // Log to backend
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    fetch(`${backendUrl}/api/monitoring/frontend-error`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        errorId,
        message: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString(),
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'SSR',
        url: typeof window !== 'undefined' ? window.location.href : 'SSR'
      })
    }).catch(err => {
      console.error('Failed to report error:', err);
    });

    return errorId;
  };

  return { reportError };
}
