import { withRateLimit } from '@/lib/middleware/with-rate-limit';
import { createAiToolHandler } from './handler';

export const POST = withRateLimit(createAiToolHandler(), {
  max: 10,
  windowMs: 60 * 60 * 1000,
});
