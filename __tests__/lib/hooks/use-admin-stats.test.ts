/**
 * @jest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react';
import { useAdminStats } from '@/lib/hooks/use-admin-stats';

/** Builds a Response-like object for the fetch stub. */
function res(ok: boolean, status: number, body: unknown) {
  return { ok, status, json: async () => body } as Response;
}

describe('useAdminStats', () => {
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('populates data on a successful response', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(res(true, 200, { hello: 'world' })) as unknown as typeof fetch;

    const { result } = renderHook(() => useAdminStats<{ hello: string }>('/api/x'));

    await waitFor(() => expect(result.current.data).toEqual({ hello: 'world' }));
    expect(result.current.error).toBe(false);
  });

  it('sets error on a non-OK, non-401 response', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(res(false, 500, {})) as unknown as typeof fetch;

    const { result } = renderHook(() => useAdminStats('/api/x'));

    await waitFor(() => expect(result.current.error).toBe(true));
    expect(result.current.data).toBeNull();
  });

  it('navigates to /admin/login on 401 without setting error', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(res(false, 401, {})) as unknown as typeof fetch;
    const navigate = jest.fn();

    const { result } = renderHook(() => useAdminStats('/api/x', navigate));

    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/admin/login'));
    expect(result.current.error).toBe(false);
    expect(result.current.data).toBeNull();
  });

  it('cancels the stale response when the url changes mid-flight', async () => {
    const fetchMock = jest.fn((url: string, opts?: { signal?: AbortSignal }) => {
      if (url === '/api/slow') {
        // Never resolves on its own — only rejects when aborted, like real fetch.
        return new Promise<Response>((_resolve, reject) => {
          opts?.signal?.addEventListener('abort', () => {
            const err = new Error('aborted');
            err.name = 'AbortError';
            reject(err);
          });
        });
      }
      return Promise.resolve(res(true, 200, { from: 'fast' }));
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const { result, rerender } = renderHook(({ url }) => useAdminStats<{ from: string }>(url), {
      initialProps: { url: '/api/slow' },
    });

    // Switch to a fast url before the slow one settles.
    rerender({ url: '/api/fast' });

    await waitFor(() => expect(result.current.data).toEqual({ from: 'fast' }));
    expect(result.current.error).toBe(false);
  });
});
