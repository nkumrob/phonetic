'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Gentle review solicitation: returning visitors (second visit onwards) get
 * one dismissible card in the corner asking for a review. First-time
 * visitors are only marked; nobody is asked twice. Never shown on admin or
 * the review form itself.
 */
export const VISITED_KEY = 'np-visited';
export const ASKED_KEY = 'np-review-asked';
const SHOW_DELAY_MS = 12000;

function isExcluded(pathname: string): boolean {
  return pathname.startsWith('/admin') || pathname.startsWith('/reviews');
}

export function ReviewAskEffect({ pathname }: { pathname: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || isExcluded(pathname)) return;
    try {
      if (window.localStorage.getItem(ASKED_KEY)) return;
      if (!window.localStorage.getItem(VISITED_KEY)) {
        window.localStorage.setItem(VISITED_KEY, '1');
        return;
      }
    } catch {
      return; // storage blocked: never nag
    }

    const timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, [pathname]);

  if (!visible) return null;

  function dismiss() {
    try {
      window.localStorage.setItem(ASKED_KEY, '1');
    } catch {
      // ignore
    }
    setVisible(false);
  }

  return (
    <div
      role="dialog"
      aria-label="Share your experience"
      className="fixed bottom-6 right-6 z-50 w-80 max-w-[calc(100vw-3rem)] rounded-xl border border-warmNeutral-200 bg-white p-5 shadow-[0_16px_32px_-16px_rgba(92,54,38,0.45)] animate-fade-in dark:border-warmNeutral-700 dark:bg-warmNeutral-800"
    >
      <p className="font-bold">Welcome back</p>
      <p className="mt-1 text-sm text-gray-600 dark:text-warmNeutral-300">
        If the tools or the NATO comms training have helped your work, a one-sentence review helps
        other professionals find us.
      </p>
      <div className="mt-4 flex items-center gap-3">
        <Link
          href="/reviews"
          onClick={dismiss}
          className="inline-flex items-center justify-center rounded-lg bg-coolBlue-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-coolBlue-700"
        >
          Leave a review
        </Link>
        <button
          type="button"
          onClick={dismiss}
          className="text-sm font-semibold text-gray-500 hover:text-gray-700 dark:text-warmNeutral-400 dark:hover:text-warmNeutral-200"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}

/** Router-connected wrapper; tests drive ReviewAskEffect with an explicit pathname. */
export function ReviewAskPopup({ pathname }: { pathname?: string }) {
  const routerPathname = usePathname();

  return <ReviewAskEffect pathname={pathname ?? routerPathname ?? '/'} />;
}
