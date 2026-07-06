import { getAiOpsStats } from '@/lib/db/analytics-repo';
import { createStatsHandler } from '../handler';

export const GET = createStatsHandler((days) => getAiOpsStats(days));
