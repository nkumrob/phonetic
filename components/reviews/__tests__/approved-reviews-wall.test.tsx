import { render, screen } from '@testing-library/react';
import { ApprovedReviewsWall } from '../approved-reviews-wall';

const review = (id: string, title: string) => ({
  id,
  name: `Reviewer ${id}`,
  rating: 5,
  title,
  comment: 'The summarizer turned a 30-page report into action items before my shift.',
  date: '2026-07-01T00:00:00.000Z',
  verified: true,
  approved: true,
  helpful: 0,
});

describe('ApprovedReviewsWall', () => {
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('renders the full section once at least two reviews are approved', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ reviews: [review('r1', 'Saved my briefing prep'), review('r2', 'Radio-clear in a week')] }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    render(<ApprovedReviewsWall />);

    expect(await screen.findByText('What Our Users Say')).toBeInTheDocument();
    expect(screen.getByText('Reviewer r1')).toBeInTheDocument();
    expect(screen.getByText('Reviewer r2')).toBeInTheDocument();
    expect(fetchMock.mock.calls[0][0]).toContain('/api/reviews');
    expect(screen.getByRole('link', { name: /write a review/i })).toHaveAttribute('href', '/reviews');
  });

  it('renders nothing with fewer than two reviews', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ reviews: [review('r1', 'Only one so far')] }),
    }) as unknown as typeof fetch;

    const { container } = render(<ApprovedReviewsWall />);

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when the fetch fails', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('offline')) as unknown as typeof fetch;

    const { container } = render(<ApprovedReviewsWall />);

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(container).toBeEmptyDOMElement();
  });
});
