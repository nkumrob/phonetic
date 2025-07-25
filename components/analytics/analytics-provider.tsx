'use client';

import { GoogleAnalytics } from './google-analytics';
import { config } from '@/lib/config/env';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const shouldLoadAnalytics = config.enableAnalytics && config.gaId;

  return (
    <>
      {shouldLoadAnalytics && config.gaId && <GoogleAnalytics measurementId={config.gaId} />}
      {children}
    </>
  );
}