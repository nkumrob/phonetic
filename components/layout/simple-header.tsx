'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils/cn';
import { Settings } from 'lucide-react';
import { useSimpleAppState } from '@/lib/contexts/simple-app-context';

export function SimpleHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { state } = useSimpleAppState();

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
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="bg-coolBlue-500 text-white font-black text-xl px-4 py-2 rounded-lg">
              NATO
            </div>
            <span className="text-xl font-black text-foreground hidden sm:inline tracking-largeText">Phonetic</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "relative px-4 py-2 rounded-lg font-medium transition-all duration-200",
                    "hover:bg-gray-100 dark:hover:bg-gray-800",
                    isActive 
                      ? "text-primary" 
                      : "text-secondary hover:text-primary"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{item.icon}</span>
                    {item.name}
                  </span>
                  {isActive && (
                    <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Profile Link */}
            <Link
              href="/profile"
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="text-xl">{state.user.avatar || '🧑‍✈️'}</span>
              <span className="text-sm font-medium">{state.user.name || 'Profile'}</span>
            </Link>

            {/* Settings Link */}
            <Link
              href="/settings"
              className={cn(
                "p-2 rounded-lg transition-colors",
                "hover:bg-gray-100 dark:hover:bg-gray-800",
                pathname === '/settings' && "bg-gray-100 dark:bg-gray-800"
              )}
              aria-label="Settings"
            >
              <Settings className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </Link>

            <ThemeToggle />
            
            {/* Mobile menu button */}
            <button
              className={cn(
                "md:hidden p-2 rounded-lg",
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
                <span className="text-2xl">{state.user.avatar || '🧑‍✈️'}</span>
                <span className="font-medium">{state.user.name || 'Profile'}</span>
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
                    onClick={() => setMobileMenuOpen(false)}
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