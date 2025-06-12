'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUI } from '@/lib/context';
import {
  HomeIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  SparklesIcon,
  ClockIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/', 
    icon: HomeIcon,
    description: 'Overview and analytics'
  },
  { 
    name: 'Articles', 
    href: '/articles', 
    icon: DocumentTextIcon,
    description: 'Manage knowledge base content'
  },
  { 
    name: 'Audit History', 
    href: '/audit-history', 
    icon: ClockIcon,
    description: 'View past audit results'
  },
  {
    name: 'AI Assistant',
    href: '/ai',
    icon: SparklesIcon,
    description: 'AI-powered content assistance'
  },
  {
    name: 'Monitoring',
    href: '/monitoring',
    icon: ExclamationTriangleIcon,
    description: 'System health and error monitoring'
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Cog6ToothIcon,
    description: 'Application configuration'
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUI();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus management for accessibility
  useEffect(() => {
    if (sidebarOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [sidebarOpen]);

  // Handle escape key to close sidebar
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sidebarOpen) {
        toggleSidebar();
      }
    };

    if (sidebarOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when sidebar is open on mobile
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen, toggleSidebar]);

  // Handle click outside to close sidebar on mobile
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      toggleSidebar();
    }
  };

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={handleOverlayClick}
          aria-hidden="true"
        >
          <div className="sidebar-backdrop"></div>
        </div>
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        id="sidebar"
        className={cn(
          'sidebar-container',
          sidebarOpen ? 'sidebar-open' : 'sidebar-closed'
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full">
          {/* Logo area with mobile close button */}
          <div className="sidebar-header">
            <div className="flex items-center space-x-2">
              {/* Empty space for clean design */}
            </div>
            
            {/* Mobile close button */}
            <button
              ref={closeButtonRef}
              onClick={toggleSidebar}
              className="sidebar-close-btn"
              aria-label="Close sidebar"
            >
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* Navigation */}
          <nav 
            className="sidebar-nav"
            role="list"
            aria-label="Main navigation menu"
          >
            {navigation.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => {
                    // Close mobile sidebar when navigating
                    if (window.innerWidth < 1024) {
                      toggleSidebar();
                    }
                  }}
                  className={cn(
                    'nav-item',
                    isActive ? 'nav-item-active' : 'nav-item-inactive'
                  )}
                  role="listitem"
                  aria-current={isActive ? 'page' : undefined}
                  aria-describedby={`nav-desc-${index}`}
                >
                  <item.icon
                    className={cn(
                      'nav-icon',
                      isActive ? 'nav-icon-active' : 'nav-icon-inactive'
                    )}
                    aria-hidden="true"
                  />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className={cn(
                      "truncate font-medium",
                      isActive ? "nav-text-active" : "nav-text-inactive"
                    )}>
                      {item.name}
                    </span>
                    {/* Show description on hover for better UX */}
                    <span 
                      id={`nav-desc-${index}`}
                      className="sr-only"
                    >
                      {item.description}
                    </span>
                  </div>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div 
                      className="nav-active-indicator"
                      aria-hidden="true"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer with performance indicators */}
          <div className="sidebar-footer">
            <div className="space-y-3">
              {/* API Status */}
              <div className="flex items-center justify-between">
                <span className="footer-label">API Status</span>
                <div className="flex items-center space-x-2">
                  <div 
                    className="footer-status-indicator"
                    role="status"
                    aria-label="API status: online"
                  />
                  <span className="footer-status-text">Online</span>
                </div>
              </div>
              
              {/* Version */}
              <div className="flex items-center justify-between">
                <span className="footer-label">Version</span>
                <span className="footer-version">v1.0.0</span>
              </div>
              
              {/* Performance indicator */}
              <div className="flex items-center justify-between">
                <span className="footer-label">Performance</span>
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-0.5">
                    <div className="performance-bar performance-bar-high" />
                    <div className="performance-bar performance-bar-high" />
                    <div className="performance-bar performance-bar-high" />
                    <div className="performance-bar performance-bar-medium" />
                    <div className="performance-bar performance-bar-low" />
                  </div>
                  <span className="footer-performance-text">Good</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 