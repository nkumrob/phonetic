import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { runAiTool, type RunAiToolResult } from '@/lib/ai/ai-service';
import { recordToolUsage, type ToolUsageEntry } from '@/lib/ai/metrics';
import { anonymousSessionHash } from '@/lib/ai/session-hash';
import { AiServiceError } from '@/lib/ai/types';
import { cacheConfigs, getCacheHeaders } from '@/lib/utils/cache-headers';
import { logger } from '@/lib/utils/logger';

interface HandlerDeps {
  runTool?: (toolId: string, input: string) => Promise<RunAiToolResult>;
  record?: (entry: ToolUsageEntry) => void;
}

/**
 * Generic AI tool handler (kept out of route.ts because Next.js route files
 * may only export HTTP method handlers). The tool id comes from the pathname
 * because withRateLimit does not forward the route context/params argument.
 */
export function createAiToolHandler(deps?: HandlerDeps) {
  const runTool = deps?.runTool ?? runAiTool;
  const record = deps?.record ?? recordToolUsage;

  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const toolId = request.nextUrl.pathname.split('/').filter(Boolean).pop() ?? '';

      let body: unknown;
      try {
        body = await request.json();
      } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
      }

      const input = (body as { input?: unknown })?.input;
      const result = await runTool(toolId, typeof input === 'string' ? input : '');

      const usageId = randomUUID();
      // Fire-and-forget: the response never waits on (or fails because of) metrics.
      record({
        id: usageId,
        toolName: toolId,
        model: result.model,
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        latencyMs: result.latencyMs,
        sessionHash: anonymousSessionHash(request),
        anonId: request.cookies.get('np_anon')?.value ?? null,
      });

      return NextResponse.json(
        { result: { output: result.text, usageId } },
        { headers: getCacheHeaders(cacheConfigs.realtime) }
      );
    } catch (error) {
      if (error instanceof AiServiceError) {
        return NextResponse.json({ error: error.message }, { status: error.status });
      }
      logger.error('AI tool request failed', error, { context: 'api/ai' });
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}
