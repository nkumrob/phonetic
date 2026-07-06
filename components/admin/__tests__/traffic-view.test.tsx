import { render, screen } from '@testing-library/react';
import { TrafficView } from '../traffic-view';

const TRAFFIC_STATS = {
  topPages: [{ path: '/phonetic', views: 100 }],
  countries: [{ country: 'US', visitors: 50, interactions: 120 }],
  newVisitors: 30,
  returningVisitors: 20,
  avgInteractionsPerVisitor: 2.4,
  funnel: [{ mode: 'simple', started: 50, completed: 40 }],
  toolLeaderboard: [{ tool: 'phonetic-ai', uses: 80 }],
};

describe('TrafficView', () => {
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('loads and renders core traffic sections', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => TRAFFIC_STATS,
    }) as unknown as typeof fetch;

    render(<TrafficView />);

    expect(await screen.findByText('30')).toBeInTheDocument(); // newVisitors
    expect(screen.getByText('20')).toBeInTheDocument();        // returningVisitors
    expect(screen.getByText('/phonetic')).toBeInTheDocument(); // topPages
    expect(screen.getByText('US')).toBeInTheDocument();        // countries
  });

  it('renders section headings', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => TRAFFIC_STATS,
    }) as unknown as typeof fetch;

    render(<TrafficView />);

    expect(await screen.findByText('Top pages')).toBeInTheDocument();
    expect(screen.getByText('Top countries')).toBeInTheDocument();
    expect(screen.getByText('Practice funnel')).toBeInTheDocument();
  });

  it('renders the funnel mode and completion', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => TRAFFIC_STATS,
    }) as unknown as typeof fetch;

    render(<TrafficView />);

    expect(await screen.findByText(/simple/i)).toBeInTheDocument();
    expect(screen.getByText(/80%/)).toBeInTheDocument(); // 40/50 = 80%
  });

  it('shows an error alert when fetch fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({}),
    }) as unknown as typeof fetch;

    render(<TrafficView />);

    expect(await screen.findByRole('alert')).toHaveTextContent(/could not load/i);
  });

  it('fetches with the correct URL and signal', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => TRAFFIC_STATS,
    }) as unknown as typeof fetch;

    render(<TrafficView />);

    await screen.findByText('30');
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/admin/stats/traffic?days=30',
      expect.objectContaining({ signal: expect.anything() }),
    );
  });
});
