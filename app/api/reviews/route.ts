/**
 * Reviews API Route — thin Next.js wrapper.
 * All logic lives in handler.ts for testability.
 */

import { createGetHandler, createPostHandler } from './handler';

export const GET = createGetHandler();
export const POST = createPostHandler();
