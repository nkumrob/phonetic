import { render, screen } from '@testing-library/react';
import { OverviewDashboard } from '../overview-dashboard';

/** Minimal fixture matching the v2 OverviewStats shape (KpiWithDelta). */
const STATS = {
  uniqueVisitors: { current: 42, previous: 38 },
  interactions: { current: 128, previous: 110 },
  aiConversations: { current: 30, previous: 25 },
  tokens: { current: 21000, previous: 18000 },
  timeSavedMinutes: { current: 95, previous: 80 },
  pageViews: { current: 5, previous: 4 },
  dailySeries: [{ date: '2026-07-05', ai: 3, other: 5, prevTotal: 6 }],
};

/** Stub activity response — an empty feed is fine for most tests. */
const ACTIVITY: unknown[] = [];

function mockFetch(statsData = STATS, activityData: unknown[] = ACTIVITY) {
  return jest.fn().mockImplementation((url: string) => {
    if (String(url).includes('activity')) {
      return Promise.resolve({ ok: true, json: async () => activityData });
    }
    return Promise.resolve({ ok: true, json: async () => statsData });
  }) as unknown as typeof fetch;
}

describe('OverviewDashboard', () => {
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('loads stats and renders the KPI cards', async () => {
    global.fetch = mockFetch();

    render(<OverviewDashboard />);

    expect(await screen.findByText('42')).toBeInTheDocument();
    expect(screen.getByText('128')).toBeInTheDocument();
    expect(screen.getByText(/1\.6 hours|95/)).toBeInTheDocument(); // formatted time saved
    // useAdminStats issues a cancellable request, so fetch receives a signal too.
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/admin/stats/overview?days=30',
      expect.objectContaining({ signal: expect.anything() }),
    );
  });

  it('renders KPI deltas as trend indicators', async () => {
    global.fetch = mockFetch();

    render(<OverviewDashboard />);

    // At least one delta indicator should be visible after data loads.
    // uniqueVisitors: 42 vs 38, interactions: 128 vs 110, etc. — all positive
    await screen.findByText('42');
    expect(screen.getAllByText(/↑\d+%/).length).toBeGreaterThan(0);
  });

  it('shows the "Recent activity" section heading', async () => {
    global.fetch = mockFetch();

    render(<OverviewDashboard />);

    expect(await screen.findByText('Recent activity')).toBeInTheDocument();
  });

  it('shows "No activity yet." when activity feed is empty', async () => {
    global.fetch = mockFetch(STATS, []);

    render(<OverviewDashboard />);

    expect(await screen.findByText('No activity yet.')).toBeInTheDocument();
  });

  it('shows an error state when the overview fetch fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, json: async () => ({}) }) as unknown as typeof fetch;

    render(<OverviewDashboard />);

    expect(await screen.findByRole('alert')).toHaveTextContent(/could not load/i);
  });

  it('renders the Interactions KPI hint as "activity, excl. page views"', async () => {
    global.fetch = mockFetch();

    render(<OverviewDashboard />);

    await screen.findByText('128');
    expect(screen.getByText('activity, excl. page views')).toBeInTheDocument();
  });
});
