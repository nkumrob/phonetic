'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Wrench, MessageSquare, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const NAV = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/tools', label: 'Tools', icon: Wrench },
  { href: '/admin/reviews', label: 'Reviews', icon: MessageSquare },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === '/admin/login') return <>{children}</>;

  async function logout() {
    await fetch('/api/admin/session', { method: 'DELETE' });
    window.location.href = '/admin/login';
  }

  return (
    <div className="container px-6 py-10 md:px-8">
      <p className="font-mono text-[13px] uppercase tracking-[0.12em] text-tertiary">Admin</p>
      <div className="mt-6 flex flex-col gap-8 md:flex-row">
        <nav className="flex gap-2 md:w-56 md:flex-col md:gap-1" aria-label="Admin">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
                  active
                    ? 'bg-coolBlue-600 text-white'
                    : 'text-gray-600 hover:bg-warmNeutral-100 dark:text-warmNeutral-200 dark:hover:bg-warmNeutral-800',
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {label}
              </Link>
            );
          })}
          <button
            onClick={logout}
            className="mt-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-gray-500 hover:bg-warmNeutral-100 md:mt-8 dark:text-warmNeutral-300 dark:hover:bg-warmNeutral-800"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Log out
          </button>
        </nav>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
