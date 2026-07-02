'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { AI_TOOLS } from '@/components/ai-tools';

export interface NavItem {
  name: string;
  href: string;
  emoji: string;
}

/** Items for the Tools dropdown: AI tools, phonetic tools, then All tools. */
export function toolsMenuItems(): NavItem[] {
  return [
    ...AI_TOOLS.filter((tool) => tool.category === 'ai').map(({ name, href, emoji }) => ({
      name,
      href,
      emoji,
    })),
    ...AI_TOOLS.filter((tool) => tool.category === 'phonetic').map(({ name, href, emoji }) => ({
      name,
      href,
      emoji,
    })),
    { name: 'All tools', href: '/tools', emoji: '🧰' },
  ];
}

export const NATO_MENU_ITEMS: NavItem[] = [
  { name: 'Learn the Alphabet', href: '/learn', emoji: '📚' },
  { name: 'Practice & Quiz', href: '/practice', emoji: '🎯' },
  { name: 'Printable Chart', href: '/api/pdf', emoji: '🖨️' },
];

export interface NavDropdownProps {
  label: string;
  items: NavItem[];
  onNavigate?: () => void;
}

export function NavDropdown({ label, items, onNavigate }: NavDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-secondary hover:text-foreground transition-colors"
      >
        {label}
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={cn('transition-transform', open && 'rotate-180')}
        />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 min-w-56 rounded-xl bg-white dark:bg-warmNeutral-800 border border-warmNeutral-200 dark:border-warmNeutral-700 shadow-lg py-2 z-50">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                setOpen(false);
                onNavigate?.();
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm text-warmNeutral-700 dark:text-warmNeutral-200 hover:bg-warmNeutral-100 dark:hover:bg-warmNeutral-700 transition-colors"
            >
              <span aria-hidden="true">{item.emoji}</span>
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
