import { getToolStats } from '@/lib/db/analytics-repo';
import { createStatsHandler } from '../handler';

export const GET = createStatsHandler((days) => getToolStats(days));
