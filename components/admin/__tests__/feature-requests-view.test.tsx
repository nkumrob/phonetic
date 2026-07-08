import { render, screen, waitFor } from '@testing-library/react';
import { FeatureRequestsView } from '../feature-requests-view';

const SAMPLE = {
  id: 'r1',
  name: 'Alice',
  email: 'a@b.com',
  request: 'Please add X feature',
  createdAt: '2026-07-01T10:00:00Z',
};

describe('FeatureRequestsView', () => {
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('renders cards with request text and name', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ requests: [SAMPLE] }),
    }) as unknown as typeof fetch;

    render(<FeatureRequestsView />);

    expect(await screen.findByText('Please add X feature')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('shows empty state when requests array is empty', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ requests: [] }),
    }) as unknown as typeof fetch;

    render(<FeatureRequestsView />);

    expect(await screen.findByText('No feature requests yet.')).toBeInTheDocument();
  });

  it('shows role=alert on fetch error', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal server error' }),
    }) as unknown as typeof fetch;

    render(<FeatureRequestsView />);

    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });
});
