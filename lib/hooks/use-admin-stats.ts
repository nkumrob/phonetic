import { useEffect, useState } from 'react';

/**
 * Default navigator: a full-page redirect. Kept module-level so its identity is
 * stable across renders (safe to list in the effect's dependency array) and so
 * tests can inject a spy via the optional `navigate` argument instead of
 * mocking `window.location`.
 */
function defaultNavigate(href: string): void {
  window.location.href = href;
}

/**
 * Fetches admin stats JSON with a cancellable request keyed on `url`.
 *
 * - Success (`res.ok`) populates `data`.
 * - A 401 triggers `navigate('/admin/login')` (session expired) and leaves
 *   `error` false — the redirect is the recovery path.
 * - Any other non-OK response sets `error`.
 * - Changing `url` (or unmounting) aborts the in-flight request so a stale
 *   response can never overwrite fresher state.
 *
 * @param url      - Stats endpoint to fetch.
 * @param navigate - Redirect function; defaults to a full-page navigation.
 */
export function useAdminStats<T>(
  url: string,
  navigate: (href: string) => void = defaultNavigate,
): { data: T | null; error: boolean } {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setError(false);
    setData(null);

    fetch(url, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          if (response.status === 401) navigate('/admin/login');
          else setError(true);
          return null;
        }
        return response.json();
      })
      .then((json) => {
        if (json !== null) setData(json as T);
      })
      .catch((err: unknown) => {
        // Aborts are expected on url change / unmount — never surface them.
        if (!(err instanceof Error && err.name === 'AbortError')) setError(true);
      });

    return () => controller.abort();
  }, [url, navigate]);

  return { data, error };
}
