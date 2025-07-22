'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useSession } from '@/lib/contexts/session-context';
import { cn } from '@/lib/utils/cn';
import { Settings } from 'lucide-react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userAvatar, setUserAvatar] = useState('🧑‍✈️');
  const pathname = usePathname();
  const { session } = useSession();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load user avatar
  useEffect(() => {
    const savedAvatar = localStorage.getItem('userAvatar') || '🧑‍✈️';
    setUserAvatar(savedAvatar);
  }, []);

  const navigation = [
    { name: 'Learn', href: '/learn', icon: '📚' },
    { name: 'Practice', href: '/practice', icon: '🎯' },
    { name: 'Tools', href: '/tools', icon: '🛠️' },
  ];

  return (
    <header className={cn(
      "sticky top-0 z-50 transition-all duration-300",
      scrolled ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-lg" : "bg-transparent"
    )}>
      <nav className="container mx-auto px-4" aria-label="Global">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-amber-500 rounded-lg blur opacity-30 group-hover:opacity-50 transition-opacity" />
              <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 text-white font-black text-xl px-3 py-2 rounded-lg">
                NATO
              </div>
            </div>
            <span className="text-xl font-bold text-primary hidden sm:inline">Phonetic</span>
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
                    <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-blue-500 to-amber-500 rounded-full" />
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
              className={cn(
                "hidden md:flex items-center gap-2 px-4 py-2 rounded-lg",
                "bg-gradient-to-r from-blue-50 to-amber-50 dark:from-blue-900/20 dark:to-amber-900/20",
                "hover:from-blue-100 hover:to-amber-100 dark:hover:from-blue-900/30 dark:hover:to-amber-900/30",
                "transition-all duration-200"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{userAvatar}</span>
                <div className="text-sm">
                  <div className="font-semibold text-primary">Level {session.userProgress.level}</div>
                  <div className="text-xs text-secondary">{session.userProgress.experience} XP</div>
                </div>
              </div>
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
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-50 to-amber-50 dark:from-blue-900/20 dark:to-amber-900/20"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="text-2xl">🏆</span>
                <div>
                  <div className="font-semibold">Level {session.userProgress.level}</div>
                  <div className="text-sm text-secondary">{session.userProgress.experience} XP</div>
                </div>
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