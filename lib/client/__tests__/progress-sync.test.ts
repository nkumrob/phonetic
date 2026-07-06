import {
  collectLocalProgress,
  mergeProgress,
  applyProgress,
  pullAndMergeProgress,
  notifyProgressChanged,
  __resetSyncStateForTests,
  type ProgressData,
} from '../progress-sync';
import { clearHistory } from '../tool-history';

const ENTRY_OLD = { inputPreview: 'old', output: 'o1', timestamp: 1000 };
const ENTRY_NEW = { inputPreview: 'new', output: 'o2', timestamp: 2000 };

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
  jest.useRealTimers();
  __resetSyncStateForTests();
});

describe('collectLocalProgress', () => {
  it('gathers tool-history keys and the time-saved total', () => {
    window.localStorage.setItem('tool-history:summarizer', JSON.stringify([ENTRY_OLD]));
    window.localStorage.setItem('time-saved-minutes', '13');

    expect(collectLocalProgress()).toEqual({
      toolHistory: { summarizer: [ENTRY_OLD] },
      timeSavedMinutes: 13,
    });
  });
});

describe('mergeProgress', () => {
  it('unions entries by timestamp, newest first, capped at 5, and takes the max time saved', () => {
    const local: ProgressData = { toolHistory: { summarizer: [ENTRY_NEW] }, timeSavedMinutes: 5 };
    const remote: ProgressData = { toolHistory: { summarizer: [ENTRY_OLD, ENTRY_NEW] }, timeSavedMinutes: 13 };

    const merged = mergeProgress(local, remote);

    expect(merged.toolHistory.summarizer).toEqual([ENTRY_NEW, ENTRY_OLD]);
    expect(merged.timeSavedMinutes).toBe(13);
  });
});

describe('applyProgress', () => {
  it('writes merged data back to localStorage', () => {
    applyProgress({ toolHistory: { summarizer: [ENTRY_NEW] }, timeSavedMinutes: 8 });

    expect(JSON.parse(window.localStorage.getItem('tool-history:summarizer')!)).toEqual([ENTRY_NEW]);
    expect(window.localStorage.getItem('time-saved-minutes')).toBe('8');
  });
});

describe('pullAndMergeProgress', () => {
  it('merges remote into local and pushes when local adds information', async () => {
    window.localStorage.setItem('tool-history:summarizer', JSON.stringify([ENTRY_NEW]));
    const remote = { toolHistory: { summarizer: [ENTRY_OLD] }, timeSavedMinutes: 13 };
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ data: JSON.stringify(remote) }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) });
    global.fetch = fetchMock as unknown as typeof fetch;

    await pullAndMergeProgress();

    expect(JSON.parse(window.localStorage.getItem('tool-history:summarizer')!)).toEqual([ENTRY_NEW, ENTRY_OLD]);
    expect(window.localStorage.getItem('time-saved-minutes')).toBe('13');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][0]).toBe('/api/progress');
    expect(fetchMock.mock.calls[1][1].method).toBe('PUT');
  });

  it('does not push when local adds nothing new', async () => {
    const remote = { toolHistory: {}, timeSavedMinutes: 0 };
    const fetchMock = jest
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ data: JSON.stringify(remote) }) });
    global.fetch = fetchMock as unknown as typeof fetch;

    await pullAndMergeProgress();

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('swallows network failures', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('offline')) as unknown as typeof fetch;
    await expect(pullAndMergeProgress()).resolves.toBeUndefined();
  });
});

describe('notifyProgressChanged', () => {
  it('debounces pushes (one PUT for rapid changes)', async () => {
    jest.useFakeTimers();
    const fetchMock = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
    global.fetch = fetchMock as unknown as typeof fetch;

    notifyProgressChanged();
    notifyProgressChanged();
    notifyProgressChanged();
    jest.advanceTimersByTime(2000);
    await Promise.resolve();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][1].method).toBe('PUT');
  });
});

describe('clearHistory triggers server sync (Fix 1)', () => {
  it('pushes after clearHistory so the cleared tool is absent from the PUT body', async () => {
    jest.useFakeTimers();
    window.localStorage.setItem('tool-history:summarizer', JSON.stringify([ENTRY_OLD]));
    const fetchMock = jest.fn().mockResolvedValue({ ok: true });
    global.fetch = fetchMock as unknown as typeof fetch;

    clearHistory('summarizer');
    jest.advanceTimersByTime(2000);
    await Promise.resolve();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][1].method).toBe('PUT');
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string) as ProgressData;
    expect(body.toolHistory).not.toHaveProperty('summarizer');
  });
});

describe('pullAndMergeProgress — malformed remote blobs (Fix 3)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('resolves and fires a corrective PUT when remote has wrong shape {"a":1}', async () => {
    // Seed one local entry so merged !== normalised-remote → triggers PUT
    window.localStorage.setItem('tool-history:translator', JSON.stringify([ENTRY_NEW]));

    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ data: '{"a":1}' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) });
    global.fetch = fetchMock as unknown as typeof fetch;

    await expect(pullAndMergeProgress()).resolves.toBeUndefined();

    // localStorage must still contain the seeded entry (unharmed)
    expect(window.localStorage.getItem('tool-history:translator')).not.toBeNull();

    // A corrective PUT must have fired
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][1].method).toBe('PUT');

    // PUT body must be well-formed
    const body = JSON.parse(fetchMock.mock.calls[1][1].body as string) as ProgressData;
    expect(body).toHaveProperty('toolHistory');
    expect(typeof body.timeSavedMinutes).toBe('number');
    expect(Number.isFinite(body.timeSavedMinutes)).toBe(true);
  });

  it('does not write NaN to time-saved-minutes when remote timeSavedMinutes is a non-numeric string', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValue({
        ok: true,
        json: async () => ({ data: '{"toolHistory":{},"timeSavedMinutes":"wat"}' }),
      });
    global.fetch = fetchMock as unknown as typeof fetch;

    await pullAndMergeProgress();

    const stored = window.localStorage.getItem('time-saved-minutes');
    // Must not be 'NaN' — either absent or a valid finite number string
    expect(stored).not.toBe('NaN');
    if (stored !== null) {
      expect(Number.isFinite(Number(stored))).toBe(true);
    }
  });
});

describe('boundProgressPayload (Fix 2)', () => {
  it('truncates outputs longer than 2000 chars in the pushed body', async () => {
    jest.useFakeTimers();
    const longOutput = 'x'.repeat(5000);
    window.localStorage.setItem(
      'tool-history:summarizer',
      JSON.stringify([{ inputPreview: 'q', output: longOutput, timestamp: 1000 }]),
    );
    const fetchMock = jest.fn().mockResolvedValue({ ok: true });
    global.fetch = fetchMock as unknown as typeof fetch;

    notifyProgressChanged();
    jest.advanceTimersByTime(2000);
    await Promise.resolve();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string) as ProgressData;
    const sentOutput = body.toolHistory['summarizer'][0].output;
    expect(sentOutput.length).toBeLessThanOrEqual(2000);
  });

  it('drops oldest entries until payload is under 30KB when truncation alone is insufficient', async () => {
    jest.useFakeTimers();
    // Build ~20 tools × 5 entries × 2000-char outputs ≈ 200KB before bounding
    const now = Date.now();
    for (let t = 0; t < 20; t++) {
      const entries = Array.from({ length: 5 }, (_, i) => ({
        inputPreview: `q${t}-${i}`,
        output: 'y'.repeat(2000),
        timestamp: now + t * 100 + i, // newer tools / entries have higher timestamps
      }));
      window.localStorage.setItem(`tool-history:tool-${t}`, JSON.stringify(entries));
    }
    const fetchMock = jest.fn().mockResolvedValue({ ok: true });
    global.fetch = fetchMock as unknown as typeof fetch;

    notifyProgressChanged();
    jest.advanceTimersByTime(2000);
    await Promise.resolve();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const raw = fetchMock.mock.calls[0][1].body as string;
    const byteLen = Buffer.byteLength(raw, 'utf-8'); // test runs in Node via jest
    expect(byteLen).toBeLessThan(30 * 1024);

    // Newest entries must still be present
    const body = JSON.parse(raw) as ProgressData;
    // tool-19 has the highest timestamps — should survive
    const newestTool = body.toolHistory['tool-19'];
    expect(newestTool).toBeDefined();
    expect(newestTool.length).toBeGreaterThan(0);
    // Verify the globally newest timestamp (now + 19*100 + 4) is present in the payload
    const maxTsInTool = Math.max(...newestTool.map((e) => e.timestamp));
    expect(maxTsInTool).toBe(now + 19 * 100 + 4);
  });
});
