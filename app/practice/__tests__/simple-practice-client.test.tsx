/**
 * @jest-environment jsdom
 *
 * Tests for the usePracticeSession hook extracted from simple-practice-client.tsx.
 *
 * Strategy: We test the hook directly (via renderHook) rather than rendering
 * the full SimplePracticeClient component, because the component relies on
 * Next.js `dynamic()` lazy-loaded children that do not resolve in the jsdom
 * environment. The hook is where all business logic (tracking + state
 * transitions) lives, so this gives us maximum coverage at the right seam
 * without needing jest.mock.
 *
 * sendBeacon is stubbed via Object.defineProperty (same idiom as
 * components/phonetic/__tests__/inline-text-converter.test.tsx) so the
 * track() function's primary transport path is exercised.
 */
import { renderHook, act } from '@testing-library/react';
import { usePracticeSession } from '../simple-practice-client';

describe('usePracticeSession', () => {
  const originalSendBeacon = navigator.sendBeacon;

  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    jest.useRealTimers();
    Object.defineProperty(navigator, 'sendBeacon', {
      value: originalSendBeacon,
      configurable: true,
    });
  });

  // -------------------------------------------------------------------------
  // Mode selection — fires practice_session beacon
  // -------------------------------------------------------------------------

  it('starts in hub mode', () => {
    const { result } = renderHook(() => usePracticeSession());
    expect(result.current.currentMode).toBe('hub');
  });

  it('fires a practice_session beacon when selecting "practice" mode', () => {
    const sendBeacon = jest.fn().mockReturnValue(true);
    Object.defineProperty(navigator, 'sendBeacon', { value: sendBeacon, configurable: true });

    const { result } = renderHook(() => usePracticeSession());

    act(() => { result.current.handleModeSelect('practice'); });

    expect(sendBeacon).toHaveBeenCalledTimes(1);
    expect(sendBeacon.mock.calls[0][0]).toBe('/api/events');
    expect(result.current.currentMode).toBe('practice');
  });

  it('fires a practice_session beacon when selecting "learn" mode', () => {
    const sendBeacon = jest.fn().mockReturnValue(true);
    Object.defineProperty(navigator, 'sendBeacon', { value: sendBeacon, configurable: true });

    const { result } = renderHook(() => usePracticeSession());

    act(() => { result.current.handleModeSelect('learn'); });

    expect(sendBeacon).toHaveBeenCalledTimes(1);
    expect(result.current.currentMode).toBe('learn');
  });

  it('fires a practice_session beacon when selecting "challenge" mode', () => {
    const sendBeacon = jest.fn().mockReturnValue(true);
    Object.defineProperty(navigator, 'sendBeacon', { value: sendBeacon, configurable: true });

    const { result } = renderHook(() => usePracticeSession());

    act(() => { result.current.handleModeSelect('challenge'); });

    expect(sendBeacon).toHaveBeenCalledTimes(1);
    expect(result.current.currentMode).toBe('challenge');
  });

  // -------------------------------------------------------------------------
  // Session completion — fires practice_complete beacon
  // -------------------------------------------------------------------------

  it('fires practice_complete beacon and returns to hub immediately for "learn" mode', () => {
    const sendBeacon = jest.fn().mockReturnValue(true);
    Object.defineProperty(navigator, 'sendBeacon', { value: sendBeacon, configurable: true });

    const { result } = renderHook(() => usePracticeSession());

    act(() => { result.current.handleModeSelect('learn'); });
    act(() => { result.current.completeSession('learn'); });

    // Two beacons: practice_session + practice_complete.
    expect(sendBeacon).toHaveBeenCalledTimes(2);
    // For "learn" mode, the transition to hub is immediate (no timeout).
    expect(result.current.currentMode).toBe('hub');
  });

  it('fires practice_complete beacon and returns to hub after 100 ms for "practice" mode', () => {
    const sendBeacon = jest.fn().mockReturnValue(true);
    Object.defineProperty(navigator, 'sendBeacon', { value: sendBeacon, configurable: true });

    const { result } = renderHook(() => usePracticeSession());

    act(() => { result.current.handleModeSelect('practice'); });
    act(() => { result.current.completeSession('practice'); });

    // Beacon fires immediately, but mode stays until the setTimeout fires.
    expect(sendBeacon).toHaveBeenCalledTimes(2);
    expect(result.current.currentMode).toBe('practice');

    // Advance past the 100 ms delay.
    act(() => { jest.advanceTimersByTime(100); });
    expect(result.current.currentMode).toBe('hub');
  });

  it('fires practice_complete beacon and returns to hub after 100 ms for "challenge" mode', () => {
    const sendBeacon = jest.fn().mockReturnValue(true);
    Object.defineProperty(navigator, 'sendBeacon', { value: sendBeacon, configurable: true });

    const { result } = renderHook(() => usePracticeSession());

    act(() => { result.current.handleModeSelect('challenge'); });
    act(() => { result.current.completeSession('challenge'); });

    expect(sendBeacon).toHaveBeenCalledTimes(2);
    expect(result.current.currentMode).toBe('challenge');

    act(() => { jest.advanceTimersByTime(100); });
    expect(result.current.currentMode).toBe('hub');
  });

  // -------------------------------------------------------------------------
  // Back navigation
  // -------------------------------------------------------------------------

  it('returns to hub when handleBack is called', () => {
    const { result } = renderHook(() => usePracticeSession());

    act(() => { result.current.handleModeSelect('practice'); });
    expect(result.current.currentMode).toBe('practice');

    act(() => { result.current.handleBack(); });
    expect(result.current.currentMode).toBe('hub');
  });
});
