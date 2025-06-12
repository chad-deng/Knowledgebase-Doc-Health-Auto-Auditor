'use client';

import { useEffect, useState } from 'react';
import { useUI } from '@/lib/context';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useUI();
  const [mounted, setMounted] = useState(false);

  // Detect system preference
  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  // Apply theme immediately to prevent flash
  useEffect(() => {
    const root = document.documentElement;
    const systemTheme = getSystemTheme();
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    
    let initialTheme: 'light' | 'dark' = 'light';
    
    if (savedTheme === 'dark') {
      initialTheme = 'dark';
    } else if (savedTheme === 'system' || !savedTheme) {
      initialTheme = systemTheme;
    }
    
    // Apply theme immediately
    if (initialTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Set theme state
    if (initialTheme !== theme) {
      setTheme(initialTheme);
    }
    
    setMounted(true);
  }, []);

  // Handle theme changes
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    
    // Apply theme class
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Save to localStorage (but preserve system preference)
    const currentSaved = localStorage.getItem('theme');
    if (currentSaved !== 'system') {
      localStorage.setItem('theme', theme);
    }
  }, [theme, mounted]);

  // Listen for system theme changes
  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'system') {
        const newTheme = e.matches ? 'dark' : 'light';
        setTheme(newTheme);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [setTheme, mounted]);

  // Script to prevent flash of wrong theme
  const themeScript = `
    (function() {
      function getTheme() {
        const saved = localStorage.getItem('theme');
        if (saved === 'dark') return 'dark';
        if (saved === 'light') return 'light';
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      
      const theme = getTheme();
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    })();
  `;

  return (
    <>
      {/* Inline script to set theme before React hydration */}
      <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      {children}
    </>
  );
}