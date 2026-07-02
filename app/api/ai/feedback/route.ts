import { withRateLimit } from '@/lib/middleware/with-rate-limit';
import { createFeedbackHandler } from './handler';

export const POST = withRateLimit(createFeedbackHandler(), {
  max: 30,
  windowMs: 60 * 60 * 1000,
});
