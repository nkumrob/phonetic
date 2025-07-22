'use client';

import React from 'react';
import { useTheme } from '@/lib/hooks/use-theme';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl transition-all hover:bg-warmNeutral-100 dark:hover:bg-warmNeutral-800 hover:shadow-sm"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5 text-warmNeutral-600 hover:text-warmNeutral-900" />
      ) : (
        <Sun className="h-5 w-5 text-warmAmber-500 hover:text-warmAmber-400" />
      )}
    </button>
  );
}