'use client';

import { useEffect } from 'react';
import { useUI } from '@/lib/context';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useUI();

  useEffect(() => {
    // Load theme from localStorage on mount
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme && savedTheme !== theme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    // Apply or remove the dark class based on the theme state
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Save theme to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  return <>{children}</>;
}