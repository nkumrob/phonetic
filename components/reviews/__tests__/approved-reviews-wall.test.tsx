import { render, screen } from '@testing-library/react';
import { ApprovedReviewsWall } from '../approved-reviews-wall';

const REVIEWS = [
  {
    id: 'r1',
    name: 'Test Reviewer',
    rating: 5,
    title: 'Saved my briefing prep',
    comment: 'The summarizer turned a 30-page report into action items before my shift.',
    date: '2026-07-01T00:00:00.000Z',
    verified: true,
    approved: true,
    helpful: 0,
  },
];

describe('ApprovedReviewsWall', () => {
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('fetches approved reviews and renders them with a write-review CTA', async () => {
    const fetchMock = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ reviews: REVIEWS }) });
    global.fetch = fetchMock as unknown as typeof fetch;

    render(<ApprovedReviewsWall />);

    expect(await screen.findByText('Test Reviewer')).toBeInTheDocument();
    expect(screen.getByText(/saved my briefing prep/i)).toBeInTheDocument();
    expect(fetchMock.mock.calls[0][0]).toContain('/api/reviews');
    expect(screen.getByRole('link', { name: /write a review/i })).toHaveAttribute('href', '/reviews');
  });

  it('shows an honest empty state when no reviews are approved yet', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ reviews: [] }) }) as unknown as typeof fetch;

    render(<ApprovedReviewsWall />);

    expect(await screen.findByText(/be the first/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /write a review/i })).toHaveAttribute('href', '/reviews');
  });

  it('renders nothing misleading when the fetch fails', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('offline')) as unknown as typeof fetch;

    render(<ApprovedReviewsWall />);

    expect(await screen.findByText(/be the first/i)).toBeInTheDocument();
  });
});
