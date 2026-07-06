import type { EventName } from '@/lib/constants/events';

/**
 * Fire-and-forget analytics tracker. Never throws, never awaited by callers,
 * SSR-safe. Transport: sendBeacon (survives page unload) → fetch keepalive.
 */
export function track(
  name: EventName,
  tool?: string,
  metadata?: Record<string, unknown>
): void {
  if (typeof window === 'undefined') return;

  try {
    const payload = JSON.stringify({
      name,
      ...(tool !== undefined ? { tool } : {}),
      ...(metadata !== undefined ? { metadata } : {}),
    });

    if (typeof navigator.sendBeacon === 'function') {
      navigator.sendBeacon('/api/events', new Blob([payload], { type: 'application/json' }));
      return;
    }

    void fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Telemetry must never affect the user experience.
  }
}
