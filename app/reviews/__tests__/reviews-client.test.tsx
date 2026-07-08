import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReviewsClient from '../reviews-client';

describe('ReviewsClient', () => {
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('renders the in-page review form and no Google link', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ reviews: [] }) }) as unknown as typeof fetch;

    render(<ReviewsClient />);

    expect(screen.getByLabelText(/your name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/review title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/your review/i)).toBeInTheDocument();
    expect(screen.queryByText(/google/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/coming soon/i)).not.toBeInTheDocument();
  });

  it('submits the form to POST /api/reviews', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ reviews: [] }) }) // initial approved list
      .mockResolvedValueOnce({ ok: true, status: 201, json: async () => ({ review: { id: 'r9' } }) }); // POST
    global.fetch = fetchMock as unknown as typeof fetch;

    render(<ReviewsClient />);

    fireEvent.click(screen.getByRole('button', { name: /rate 5 out of 5/i }));
    fireEvent.change(screen.getByLabelText(/your name/i), { target: { value: 'Real Person' } });
    fireEvent.change(screen.getByLabelText(/review title/i), { target: { value: 'Solid tools' } });
    fireEvent.change(screen.getByLabelText(/your review/i), {
      target: { value: 'The output checker caught two claims before my report went out.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /submit review/i }));

    await waitFor(() => {
      const post = fetchMock.mock.calls.find((c) => c[1]?.method === 'POST');
      expect(post).toBeDefined();
      expect(post![0]).toBe('/api/reviews');
      expect(JSON.parse(post![1].body)).toMatchObject({ name: 'Real Person', rating: 5, title: 'Solid tools' });
    });
  });

  it('lists approved reviews when any exist', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        reviews: [
          { id: 'a1', name: 'Approved Person', rating: 5, title: 'Works', comment: 'Great', date: '2026-07-01T00:00:00.000Z', helpful: 0 },
        ],
      }),
    }) as unknown as typeof fetch;

    render(<ReviewsClient />);

    expect(await screen.findByText('Approved Person')).toBeInTheDocument();
  });
});
