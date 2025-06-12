'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { useUI } from '@/lib/context';
import { 
  Bars3Icon, 
  XMarkIcon, 
  SunIcon, 
  MoonIcon, 
  ComputerDesktopIcon,
  ChevronDownIcon 
} from '@heroicons/react/24/outline';

export function Header() {
  const { sidebarOpen, toggleSidebar, theme, setTheme } = useUI();
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');
  const [themePreference, setThemePreference] = useState<'light' | 'dark' | 'system'>('system');
  const [mounted, setMounted] = useState(false);

  // Initialize theme preference and system theme detection
  useEffect(() => {
    setMounted(true);
    
    // Get initial theme preference from localStorage
    const savedPreference = localStorage.getItem('theme') as 'light' | 'dark' | 'system' || 'system';
    setThemePreference(savedPreference);
    
    // Detect initial system theme
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setSystemTheme(isDark ? 'dark' : 'light');
    
    // Set initial theme based on preference
    if (savedPreference === 'system') {
      setTheme(isDark ? 'dark' : 'light');
    } else {
      setTheme(savedPreference);
    }
  }, []); // Only run once on mount

  // Listen for system theme changes
  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const newSystemTheme = e.matches ? 'dark' : 'light';
      setSystemTheme(newSystemTheme);
      
      // Only update theme if user prefers system theme
      if (themePreference === 'system') {
        setTheme(newSystemTheme);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [mounted, themePreference, setTheme]);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setThemePreference(newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'system') {
      setTheme(systemTheme);
    } else {
      setTheme(newTheme);
    }
    
    setThemeMenuOpen(false);
  };

  const getThemeIcon = () => {
    if (!mounted) return <MoonIcon className="h-4 w-4" />;
    
    if (themePreference === 'system') {
      return <ComputerDesktopIcon className="h-4 w-4" />;
    }
    return theme === 'dark' 
      ? <SunIcon className="h-4 w-4" /> 
      : <MoonIcon className="h-4 w-4" />;
  };

  const getThemeLabel = () => {
    if (!mounted) return 'Theme';
    
    if (themePreference === 'system') return 'System';
    return theme === 'dark' ? 'Dark' : 'Light';
  };

  return (
    <header 
      className="header-container"
      role="banner"
    >
      <div className="flex items-center justify-between">
        {/* Left Section - Mobile Menu & Logo */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="lg:hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            aria-expanded={sidebarOpen}
            aria-controls="sidebar"
          >
            {sidebarOpen ? (
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Bars3Icon className="h-5 w-5" aria-hidden="true" />
            )}
          </Button>
          
          <div className="flex items-center">
            <div 
              className="flex-shrink-0"
              role="img"
              aria-label="StoreHub Logo"
            >
              <img 
                src="/logo-new.svg" 
                alt="StoreHub KnowledgeBase Article Health Auditor" 
                className="h-16 w-auto"
                style={{ maxHeight: '64px' }}
              />
            </div>
          </div>
        </div>

        {/* Right Section - Theme Toggle Only */}
        <div className="flex items-center">
          {/* Enhanced Theme Toggle */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setThemeMenuOpen(!themeMenuOpen)}
              className="flex items-center space-x-2 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Change theme"
              aria-expanded={themeMenuOpen}
              aria-haspopup="menu"
            >
              {getThemeIcon()}
              <span className="hidden md:inline text-sm">{getThemeLabel()}</span>
              <ChevronDownIcon 
                className={`h-3 w-3 transition-transform duration-200 ${
                  themeMenuOpen ? 'rotate-180' : ''
                }`}
                aria-hidden="true"
              />
            </Button>

            {/* Theme Dropdown Menu */}
            {themeMenuOpen && (
              <div 
                className="theme-dropdown"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="theme-menu"
              >
                <div className="py-1">
                  <button
                    onClick={() => handleThemeChange('light')}
                    className={`theme-option ${
                      themePreference === 'light' ? 'theme-option-active' : ''
                    }`}
                    role="menuitem"
                  >
                    <SunIcon className="h-4 w-4 mr-3" aria-hidden="true" />
                    Light
                  </button>
                  <button
                    onClick={() => handleThemeChange('dark')}
                    className={`theme-option ${
                      themePreference === 'dark' ? 'theme-option-active' : ''
                    }`}
                    role="menuitem"
                  >
                    <MoonIcon className="h-4 w-4 mr-3" aria-hidden="true" />
                    Dark
                  </button>
                  <button
                    onClick={() => handleThemeChange('system')}
                    className={`theme-option ${
                      themePreference === 'system' ? 'theme-option-active' : ''
                    }`}
                    role="menuitem"
                  >
                    <ComputerDesktopIcon className="h-4 w-4 mr-3" aria-hidden="true" />
                    System
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 