'use client';

import { useEffect, useState } from 'react';
import { formatTimeSaved, getTimeSavedMinutes } from '@/lib/client/time-saved';

/** Personal productivity stat — reads the local tally after mount (avoids hydration mismatch). */
export function TimeSavedBanner() {
  const [minutes, setMinutes] = useState(0);

  useEffect(() => {
    setMinutes(getTimeSavedMinutes());
  }, []);

  if (minutes <= 0) return null;

  return (
    <p className="mt-6 text-center text-sm font-semibold text-warmAmber-700 dark:text-warmAmber-400">
      <span aria-hidden="true">⏱</span> You&apos;ve saved {formatTimeSaved(minutes)} with these tools
    </p>
  );
}
