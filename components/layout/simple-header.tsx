'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils/cn';
import { Settings } from 'lucide-react';
import { useSimpleAppState } from '@/lib/contexts/simple-app-context';
import { speechManager } from '@/lib/utils/speech-synthesis';

export function SimpleHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { state } = useSimpleAppState();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const navigation = [
    { name: 'Learn', href: '/learn', icon: '📚' },
    { name: 'Practice', href: '/practice', icon: '🎯' },
    { name: 'Tools', href: '/tools', icon: '🛠️' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-sm">
      <nav className="container mx-auto px-4" aria-label="Global">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-2 group"
            onClick={() => {
              speechManager.cancel();
              // Dispatch custom event to clear text converters
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('clear-text-converters'));
              }
            }}
          >
            <div className="bg-coolBlue-500 text-white font-black text-sm sm:text-xl px-2 sm:px-4 py-1 sm:py-2 rounded-lg">
              NATO Phonetic
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "relative px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2",
                    "hover:bg-gray-100 dark:hover:bg-gray-800",
                    isActive 
                      ? "text-primary" 
                      : "text-secondary hover:text-primary"
                  )}
                  onClick={() => speechManager.cancel()}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.name}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Profile Link - Desktop Only */}
            <Link
              href="/profile"
              className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="text-xl">{mounted ? (state.user.avatar || '✈️') : '✈️'}</span>
              <span className="text-sm font-medium">{mounted ? (state.user.name || 'Profile') : 'Profile'}</span>
            </Link>

            {/* Settings Link - Hidden on Mobile */}
            <Link
              href="/settings"
              className={cn(
                "hidden sm:block p-2 rounded-lg transition-colors",
                "hover:bg-gray-100 dark:hover:bg-gray-800",
                pathname === '/settings' && "bg-gray-100 dark:bg-gray-800"
              )}
              aria-label="Settings"
            >
              <Settings className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </Link>

            {/* Theme Toggle - Hidden on Mobile */}
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            
            {/* Mobile menu button */}
            <button
              className={cn(
                "md:hidden p-1.5 sm:p-2 rounded-lg",
                "hover:bg-gray-100 dark:hover:bg-gray-800",
                "transition-colors duration-200"
              )}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-900 shadow-xl border-t border-border">
            <div className="container mx-auto px-4 py-4 space-y-2">
              {/* Profile Link Mobile */}
              <Link
                href="/profile"
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="text-2xl">{mounted ? (state.user.avatar || '✈️') : '✈️'}</span>
                <span className="font-medium">{mounted ? (state.user.name || 'Profile') : 'Profile'}</span>
              </Link>

              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors",
                      isActive 
                        ? "bg-primary/10 text-primary" 
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      speechManager.cancel();
                    }}
                  >
                    <span className="text-xl">{item.icon}</span>
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}