'use client';

import { useEffect } from 'react';
import { pullAndMergeProgress } from '@/lib/client/progress-sync';

/** Pulls the server progress copy once per page load and merges it in. */
export function ProgressSyncProvider() {
  useEffect(() => {
    void pullAndMergeProgress();
  }, []);

  return null;
}
