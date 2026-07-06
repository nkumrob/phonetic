'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { track } from '@/lib/client/track';

/**
 * Effect half of the page-view tracker; exported separately so tests can
 * drive it with an explicit pathname (no app router in jsdom).
 */
export function PageViewEffect({ pathname }: { pathname: string | null }) {
  useEffect(() => {
    if (pathname) track('page_view', pathname);
  }, [pathname]);

  return null;
}

/** Fires one page_view event per route change. */
export function PageViewTracker() {
  const pathname = usePathname();

  return <PageViewEffect pathname={pathname} />;
}
