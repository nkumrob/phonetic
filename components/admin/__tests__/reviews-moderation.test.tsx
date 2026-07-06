import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReviewsModeration } from '../reviews-moderation';

const REVIEW = {
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

describe('ReviewsModeration', () => {
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('loads pending reviews by default and approves one', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ reviews: [REVIEW] }) }) // initial list
      .mockResolvedValueOnce({ ok: true, json: async () => ({ review: { ...REVIEW, approved: true } }) }) // PATCH
      .mockResolvedValueOnce({ ok: true, json: async () => ({ reviews: [] }) }); // reload
    global.fetch = fetchMock as unknown as typeof fetch;

    render(<ReviewsModeration />);

    expect(await screen.findByText('Alice')).toBeInTheDocument();
    expect(fetchMock.mock.calls[0][0]).toContain('approved=false');

    fireEvent.click(screen.getByRole('button', { name: /approve/i }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith('/api/reviews/r1', expect.objectContaining({ method: 'PATCH' }))
    );
  });

  it('shows an inline error banner when an action fails (no alert)', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ reviews: [REVIEW] }) })
      .mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'Unauthorized' }) });
    global.fetch = fetchMock as unknown as typeof fetch;

    render(<ReviewsModeration />);
    fireEvent.click(await screen.findByRole('button', { name: /approve/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/unauthorized|failed/i);
  });
});
