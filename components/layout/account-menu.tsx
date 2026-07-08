'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Settings, TrendingUp, User } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useTheme } from '@/lib/hooks/use-theme';

const THEMES = ['light', 'dark', 'system'] as const;
const THEME_LABELS: Record<(typeof THEMES)[number], string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
};

interface AccountMenuProps {
  /** Practice-profile name, once the visitor sets one. */
  userName?: string | null;
  /** Header passes its speech-cancel handler here, like the nav dropdowns. */
  onNavigate?: () => void;
}

/**
 * Single account affordance replacing the old Profile/Settings/ThemeToggle
 * trio: one trigger, one menu with progress, settings, and an inline theme
 * switch. Same open/close mechanics as NavDropdown.
 */
export function AccountMenu({ userName, onNavigate }: AccountMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  function navigate() {
    setOpen(false);
    onNavigate?.();
  }

  const itemClass =
    'flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-warmNeutral-200 hover:bg-warmNeutral-100 dark:hover:bg-warmNeutral-700 transition-colors';

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={userName ? `Account: ${userName}` : 'Account'}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-secondary transition-colors hover:bg-warmNeutral-100 hover:text-foreground dark:hover:bg-warmNeutral-800"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-warmNeutral-100 dark:bg-warmNeutral-700">
          <User size={16} aria-hidden="true" className="text-gray-700 dark:text-warmNeutral-200" />
        </span>
        {userName && <span className="hidden lg:inline">{userName}</span>}
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={cn('transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-60 rounded-xl border border-warmNeutral-200 bg-white py-2 shadow-lg dark:border-warmNeutral-700 dark:bg-warmNeutral-800">
          <Link href="/profile" onClick={navigate} className={itemClass}>
            <TrendingUp size={16} aria-hidden="true" />
            Your progress
          </Link>
          <Link href="/settings" onClick={navigate} className={itemClass}>
            <Settings size={16} aria-hidden="true" />
            Settings
          </Link>

          <div className="my-2 border-t border-warmNeutral-200 dark:border-warmNeutral-700" />

          <div className="px-4 py-1">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-tertiary">Theme</p>
            <div className="inline-flex w-full gap-1 rounded-lg border border-warmNeutral-200 p-1 dark:border-warmNeutral-700">
              {THEMES.map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={theme === value}
                  onClick={() => setTheme(value)}
                  className={cn(
                    'flex-1 rounded-md px-2 py-1 text-xs font-bold transition-colors',
                    theme === value
                      ? 'bg-coolBlue-600 text-white'
                      : 'text-gray-600 hover:bg-warmNeutral-100 dark:text-warmNeutral-200 dark:hover:bg-warmNeutral-700'
                  )}
                >
                  {THEME_LABELS[value]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
