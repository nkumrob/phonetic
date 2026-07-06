import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { ReviewsModeration } from '../reviews-moderation';

const PENDING = {
  id: 'r1',
  name: 'Alice',
  rating: 5,
  title: 'Great',
  comment: 'Very useful',
  date: '2026-07-01T00:00:00.000Z',
  verified: false,
  approved: false,
  helpful: 0,
};

const APPROVED = {
  id: 'r2',
  name: 'Bob',
  rating: 4,
  title: 'Good',
  comment: 'Pretty useful',
  date: '2026-07-02T00:00:00.000Z',
  verified: true,
  approved: true,
  helpful: 1,
};

describe('ReviewsModeration', () => {
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('initial load: fetches /api/reviews with NO approved param (loads all reviews)', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ reviews: [PENDING, APPROVED] }) });
    global.fetch = fetchMock as unknown as typeof fetch;

    render(<ReviewsModeration />);

    // Wait for data to load
    expect(await screen.findByText('Alice')).toBeInTheDocument();

    // First fetch must NOT include ?approved param
    const firstCall = fetchMock.mock.calls[0][0] as string;
    expect(firstCall).toBe('/api/reviews');
    expect(firstCall).not.toContain('approved=');
  });

  it('Pending tab: shows only unapproved reviews (client-side filter)', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ reviews: [PENDING, APPROVED] }) });
    global.fetch = fetchMock as unknown as typeof fetch;

    render(<ReviewsModeration />);

    // Default tab is Pending — only Alice (unapproved)
    expect(await screen.findByText('Alice')).toBeInTheDocument();
    expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    // Only one fetch (no per-tab fetches)
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('switching to Approved tab filters client-side without extra fetch', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ reviews: [PENDING, APPROVED] }) });
    global.fetch = fetchMock as unknown as typeof fetch;

    render(<ReviewsModeration />);
    await screen.findByText('Alice'); // wait for load

    // Switch to Approved tab
    fireEvent.click(screen.getByRole('button', { name: 'Approved' }));

    expect(screen.queryByText('Alice')).not.toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();

    // No additional fetches triggered
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('stats tiles reflect the full dataset regardless of active tab', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ reviews: [PENDING, APPROVED] }) });
    global.fetch = fetchMock as unknown as typeof fetch;

    render(<ReviewsModeration />);
    await screen.findByText('Alice');

    // Total = 2, Pending = 1, Approved = 1
    expect(screen.getByText('2')).toBeInTheDocument(); // total
    // Both pending and approved are 1 — there should be two "1" tiles
    expect(screen.getAllByText('1')).toHaveLength(2);
  });

  it('failed load (ok: false) shows role=alert banner and no "No reviews" text', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'Unauthorized' }) });
    global.fetch = fetchMock as unknown as typeof fetch;

    render(<ReviewsModeration />);

    const alert = await screen.findByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(screen.queryByText(/No reviews/i)).not.toBeInTheDocument();
  });

  it('filter buttons use aria-pressed (not role=radio)', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ reviews: [] }) });
    global.fetch = fetchMock as unknown as typeof fetch;

    render(<ReviewsModeration />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    const pendingBtn = screen.getByRole('button', { name: 'Pending' });
    expect(pendingBtn).toHaveAttribute('aria-pressed', 'true');
    expect(pendingBtn).not.toHaveAttribute('role', 'radio');
  });

  it('approves a review and reloads from the server', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ reviews: [PENDING] }) }) // initial load
      .mockResolvedValueOnce({ ok: true, json: async () => ({ review: { ...PENDING, approved: true } }) }) // PATCH
      .mockResolvedValueOnce({ ok: true, json: async () => ({ reviews: [] }) }); // reload after action
    global.fetch = fetchMock as unknown as typeof fetch;

    render(<ReviewsModeration />);

    expect(await screen.findByText('Alice')).toBeInTheDocument();

    // Find the Approve button within the review card (not the tab buttons)
    fireEvent.click(screen.getByRole('button', { name: /^approve$/i }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/reviews/r1',
        expect.objectContaining({ method: 'PATCH' })
      )
    );
  });

  it('shows inline error banner when an action fails', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ reviews: [PENDING] }) })
      .mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'Unauthorized' }) });
    global.fetch = fetchMock as unknown as typeof fetch;

    render(<ReviewsModeration />);
    fireEvent.click(await screen.findByRole('button', { name: /^approve$/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/unauthorized|failed/i);
  });
});
