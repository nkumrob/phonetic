import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/middleware/with-rate-limit';
import { config } from '@/lib/config/env';
import { getCacheHeaders, cacheConfigs } from '@/lib/utils/cache-headers';

async function handleGet(request: NextRequest) {
  const data = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    version: process.env.npm_package_version || 'unknown',
  };
  
  // Health checks should not be cached
  const headers = getCacheHeaders(cacheConfigs.realtime);
  
  return NextResponse.json(data, { headers });
}

// Export rate-limited handler
export const GET = withRateLimit(handleGet, {
  max: 100, // 100 health checks per window
  windowMs: 60 * 1000, // 1 minute window
});