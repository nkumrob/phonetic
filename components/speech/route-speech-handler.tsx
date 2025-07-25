'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { speechManager } from '@/lib/utils/speech-synthesis';
import { logger } from '@/lib/utils/logger';

export function RouteSpeechHandler() {
  const pathname = usePathname();

  useEffect(() => {
    // Cancel speech on route change
    logger.info('Route changed, cancelling speech', {
      context: 'route-speech-handler',
      metadata: { pathname }
    });
    speechManager.cancel();
    
    // Also cancel any browser speech that might be lingering
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [pathname]);

  return null;
}