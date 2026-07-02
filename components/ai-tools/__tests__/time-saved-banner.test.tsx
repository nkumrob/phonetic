/**
 * TimeSavedBanner tests — jsdom environment (default).
 * window.localStorage here is jsdom's real Storage.
 */
import { render, screen } from '@testing-library/react';
import { TimeSavedBanner } from '../time-saved-banner';

beforeEach(() => {
  window.localStorage.clear();
});

describe('TimeSavedBanner', () => {
  it('renders nothing when the tally is 0', () => {
    const { container } = render(<TimeSavedBanner />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the formatted stat when localStorage has a tally', async () => {
    window.localStorage.setItem('time-saved-minutes', '192');
    render(<TimeSavedBanner />);
    // useEffect runs after mount — findByText waits for the async state update
    const el = await screen.findByText(/3\.2 hours/);
    expect(el).toBeInTheDocument();
  });
});
