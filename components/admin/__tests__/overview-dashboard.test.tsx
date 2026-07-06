import { render, screen } from '@testing-library/react';
import { OverviewDashboard } from '../overview-dashboard';

const STATS = {
  uniqueVisitors: 42,
  interactions: 128,
  aiConversations: 30,
  tokens: 21000,
  timeSavedMinutes: 95,
  dailySeries: [{ date: '2026-07-05', ai: 3, other: 5 }],
  toolLeaderboard: [{ tool: 'summarizer', uses: 12 }],
  timeSavedDistribution: [{ bucket: '5-15', votes: 4 }],
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
