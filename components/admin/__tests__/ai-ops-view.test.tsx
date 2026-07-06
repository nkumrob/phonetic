import { render, screen } from '@testing-library/react';
import { AiOpsView } from '../ai-ops-view';

const AI_STATS = {
  byModel: [
    {
      model: 'claude-haiku-4-5',
      conversations: 42,
      inputTokens: 10000,
      outputTokens: 5000,
      estimatedCostUsd: 0.035,
    },
  ],
  totalCostUsd: 0.035,
  avgLatencyMs: 1200,
  timeSavedDistribution: [{ bucket: '1-5', votes: 10 }],
};

describe('AiOpsView', () => {
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('loads and renders the model table', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => AI_STATS,
    }) as unknown as typeof fetch;

    render(<AiOpsView />);

    expect(await screen.findByText('claude-haiku-4-5')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument(); // conversations
  });

  it('renders avg latency KPI', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => AI_STATS,
    }) as unknown as typeof fetch;

    render(<AiOpsView />);

    await screen.findByText('claude-haiku-4-5');
    expect(screen.getByText('1,200')).toBeInTheDocument();
  });

  it('renders em-dash for null cost and shows model-prices hint', async () => {
    const statsWithNull = {
      ...AI_STATS,
      byModel: [{ ...AI_STATS.byModel[0], estimatedCostUsd: null }],
      totalCostUsd: null,
    };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => statsWithNull,
    }) as unknown as typeof fetch;

    render(<AiOpsView />);

    expect(await screen.findByText('—')).toBeInTheDocument();
    expect(screen.getByText(/model-prices\.ts/)).toBeInTheDocument();
  });

  it('renders section headings', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => AI_STATS,
    }) as unknown as typeof fetch;

    render(<AiOpsView />);

    expect(await screen.findByText('By model')).toBeInTheDocument();
    expect(screen.getByText('Time saved votes')).toBeInTheDocument();
  });

  it('shows an error alert when fetch fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({}),
    }) as unknown as typeof fetch;

    render(<AiOpsView />);

    expect(await screen.findByRole('alert')).toHaveTextContent(/could not load/i);
  });

  it('fetches with the correct URL and signal', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => AI_STATS,
    }) as unknown as typeof fetch;

    render(<AiOpsView />);

    await screen.findByText('claude-haiku-4-5');
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/admin/stats/ai?days=30',
      expect.objectContaining({ signal: expect.anything() }),
    );
  });
});
