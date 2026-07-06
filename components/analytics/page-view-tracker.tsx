'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { track } from '@/lib/client/track';

/**
 * Fires one page_view event per route change. The pathname prop is
 * injectable for tests; production use passes nothing and reads the router.
 */
export function PageViewTracker({ pathname }: { pathname?: string }) {
  // usePathname throws when rendered outside the app router (jsdom tests
  // pass the pathname prop instead), so the hook call is guarded.
  let routerPathname: string | null = null;
  try {
    routerPathname = usePathname();
  } catch {
    routerPathname = null;
  }
  const current = pathname ?? routerPathname;

  useEffect(() => {
    if (current) track('page_view', current);
  }, [current]);

  return null;
}
