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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Dismiss"
        onClick={dismiss}
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-[2px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Share your experience"
        className="relative w-full max-w-md animate-slide-up rounded-2xl border border-warmNeutral-200 bg-white p-8 shadow-[0_32px_64px_-24px_rgba(92,54,38,0.55)] dark:border-warmNeutral-700 dark:bg-warmNeutral-800"
      >
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 rounded-t-2xl bg-coolBlue-600" />
        <p className="font-mono text-[13px] uppercase tracking-[0.12em] text-tertiary">Welcome back</p>
        <h2 className="mt-2 text-2xl font-black tracking-headlines">How is it working for you?</h2>
        <p className="mt-3 text-gray-600 dark:text-warmNeutral-300">
          If the AI tools or the NATO comms training have helped your work, a one-sentence review
          helps other professionals find us.
        </p>
        <div className="mt-6 flex items-center gap-4">
          <Link
            href="/reviews"
            onClick={dismiss}
            className="inline-flex flex-1 items-center justify-center rounded-lg bg-coolBlue-600 px-5 py-3 font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-coolBlue-700"
          >
            Leave a review
          </Link>
          <button
            type="button"
            onClick={dismiss}
            className="font-semibold text-gray-500 hover:text-gray-700 dark:text-warmNeutral-400 dark:hover:text-warmNeutral-200"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}

/** Router-connected wrapper; tests drive ReviewAskEffect with an explicit pathname. */
export function ReviewAskPopup({ pathname }: { pathname?: string }) {
  const routerPathname = usePathname();

  return <ReviewAskEffect pathname={pathname ?? routerPathname ?? '/'} />;
}
