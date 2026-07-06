import { getTrafficStats } from '@/lib/db/analytics-repo';
import { createStatsHandler } from '../handler';

export const GET = createStatsHandler((days) => getTrafficStats(days));
