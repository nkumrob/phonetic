import { render, screen, fireEvent, act } from '@testing-library/react';
import { ReviewAskPopup, VISITED_KEY, ASKED_KEY } from '../review-ask-popup';

describe('ReviewAskPopup', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('first visit: marks the visitor and shows nothing', () => {
    render(<ReviewAskPopup pathname="/" />);

    act(() => jest.advanceTimersByTime(20000));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(window.localStorage.getItem(VISITED_KEY)).toBe('1');
  });

  it('returning visitor: shows the ask after a delay with review link', () => {
    window.localStorage.setItem(VISITED_KEY, '1');

    render(<ReviewAskPopup pathname="/" />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    act(() => jest.advanceTimersByTime(12000));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /leave a review/i })).toHaveAttribute('href', '/reviews');
  });

  it('dismissing it never asks again', () => {
    window.localStorage.setItem(VISITED_KEY, '1');
    const { unmount } = render(<ReviewAskPopup pathname="/" />);
    act(() => jest.advanceTimersByTime(12000));

    fireEvent.click(screen.getByRole('button', { name: /maybe later/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(window.localStorage.getItem(ASKED_KEY)).toBe('1');
    unmount();

    render(<ReviewAskPopup pathname="/" />);
    act(() => jest.advanceTimersByTime(20000));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('never shows on admin or reviews pages', () => {
    window.localStorage.setItem(VISITED_KEY, '1');

    const { unmount } = render(<ReviewAskPopup pathname="/admin" />);
    act(() => jest.advanceTimersByTime(20000));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    unmount();

    render(<ReviewAskPopup pathname="/reviews" />);
    act(() => jest.advanceTimersByTime(20000));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
