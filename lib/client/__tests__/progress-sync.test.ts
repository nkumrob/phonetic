import {
  collectLocalProgress,
  mergeProgress,
  applyProgress,
  pullAndMergeProgress,
  notifyProgressChanged,
  __resetSyncStateForTests,
  type ProgressData,
} from '../progress-sync';

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
