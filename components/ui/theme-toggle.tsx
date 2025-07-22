'use client';

import React from 'react';
import { useTheme } from '@/lib/hooks/use-theme';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5 text-gray-600 hover:text-gray-900" />
      ) : (
        <Sun className="h-5 w-5 text-yellow-500 hover:text-yellow-400" />
      )}
    </button>
  );
}