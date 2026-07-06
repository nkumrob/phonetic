/**
 * Analytics event allowlist. Shared by the client tracker and the
 * /api/events handler. AI tool runs are NOT events — they live in
 * tool_usage. 'time_saved_vote' is reserved (no call site yet): AI
 * votes are recorded via /api/ai/feedback into tool_usage.
 *
 * NOTE: The DB events table no longer has a CHECK constraint on name —
 * this array is the sole gatekeeper. Adding a name here is sufficient;
 * no table rebuild required.
 */
export const EVENT_NAMES = [
  'page_view',
  'converter_use',
  'practice_session',
  'template_use',
  'time_saved_vote',
  'practice_complete',
] as const;

export type EventName = (typeof EVENT_NAMES)[number];

export const EVENT_METADATA_MAX_BYTES = 512;
export const EVENT_TOOL_MAX_CHARS = 100;

export function isEventName(value: unknown): value is EventName {
  return typeof value === 'string' && (EVENT_NAMES as readonly string[]).includes(value);
}
