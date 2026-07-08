import { render, screen, fireEvent } from '@testing-library/react';
import { TimeSavedFeedback } from '../time-saved-feedback';

describe('TimeSavedFeedback', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) }) as unknown as typeof fetch;
  });
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('shows the vote buttons and no review ask before voting', () => {
    render(<TimeSavedFeedback usageId="u-1" />);
    expect(screen.getByText(/how much time did this save you/i)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /review/i })).not.toBeInTheDocument();
  });

  it('after a vote, thanks the user and asks for a review linking to /reviews', () => {
    render(<TimeSavedFeedback usageId="u-1" />);

    fireEvent.click(screen.getByRole('button', { name: '5-15 min' }));

    expect(screen.getByText(/thanks/i)).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /review/i });
    expect(link).toHaveAttribute('href', '/reviews');
  });
});
