'use client';

import { GoogleAnalytics } from './google-analytics';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  // Replace with your actual GA4 measurement ID
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <>
      {GA_MEASUREMENT_ID && <GoogleAnalytics measurementId={GA_MEASUREMENT_ID} />}
      {children}
    </>
  );
}