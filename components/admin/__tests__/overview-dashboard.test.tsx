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

describe('OverviewDashboard', () => {
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('loads stats and renders the KPI cards', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => STATS }) as unknown as typeof fetch;

    render(<OverviewDashboard />);

    expect(await screen.findByText('42')).toBeInTheDocument();
    expect(screen.getByText('128')).toBeInTheDocument();
    expect(screen.getByText(/1\.6 hours|95/)).toBeInTheDocument(); // formatted time saved
    expect(global.fetch).toHaveBeenCalledWith('/api/admin/stats/overview?days=30');
  });

  it('shows an error state when the fetch fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, json: async () => ({}) }) as unknown as typeof fetch;

    render(<OverviewDashboard />);

    expect(await screen.findByRole('alert')).toHaveTextContent(/could not load/i);
  });
});
