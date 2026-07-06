import { render, fireEvent, act } from '@testing-library/react';
import { InlineTextConverter } from '../inline-text-converter';

describe('InlineTextConverter tracking', () => {
  const originalSendBeacon = navigator.sendBeacon;

  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    jest.useRealTimers();
    Object.defineProperty(navigator, 'sendBeacon', { value: originalSendBeacon, configurable: true });
  });

  it('fires one converter_use per typing burst', () => {
    const sendBeacon = jest.fn().mockReturnValue(true);
    Object.defineProperty(navigator, 'sendBeacon', { value: sendBeacon, configurable: true });
    const { getByRole } = render(<InlineTextConverter />);
    const input = getByRole('textbox');

    fireEvent.change(input, { target: { value: 'h' } });
    fireEvent.change(input, { target: { value: 'he' } });
    fireEvent.change(input, { target: { value: 'hello' } });
    act(() => { jest.advanceTimersByTime(2000); });

    expect(sendBeacon).toHaveBeenCalledTimes(1);
  });

  it('does not fire for empty input', () => {
    const sendBeacon = jest.fn().mockReturnValue(true);
    Object.defineProperty(navigator, 'sendBeacon', { value: sendBeacon, configurable: true });
    render(<InlineTextConverter />);

    act(() => { jest.advanceTimersByTime(3000); });

    expect(sendBeacon).not.toHaveBeenCalled();
  });
});
