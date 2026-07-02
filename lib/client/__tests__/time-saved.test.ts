/**
 * time-saved tests run in the default jsdom environment (no @jest-environment node docblock).
 * window.localStorage here is jsdom's real Storage — the jest.setup.js mock is a no-op on this getter.
 */
import { getTimeSavedMinutes, recordLocalTimeSaved, formatTimeSaved } from '../time-saved';

beforeEach(() => {
  window.localStorage.clear();
});

describe('getTimeSavedMinutes', () => {
  it('returns 0 when nothing is stored', () => {
    expect(getTimeSavedMinutes()).toBe(0);
  });

  it('returns 0 when stored value is corrupt', () => {
    window.localStorage.setItem('time-saved-minutes', 'abc');
    expect(getTimeSavedMinutes()).toBe(0);
  });
});

describe('recordLocalTimeSaved', () => {
  it('bucket <1 maps to 0.5 minutes', () => {
    recordLocalTimeSaved('<1');
    expect(getTimeSavedMinutes()).toBe(0.5);
  });

  it('bucket 1-5 maps to 3 minutes', () => {
    recordLocalTimeSaved('1-5');
    expect(getTimeSavedMinutes()).toBe(3);
  });

  it('bucket 5-15 maps to 10 minutes', () => {
    recordLocalTimeSaved('5-15');
    expect(getTimeSavedMinutes()).toBe(10);
  });

  it('bucket 15+ maps to 20 minutes', () => {
    recordLocalTimeSaved('15+');
    expect(getTimeSavedMinutes()).toBe(20);
  });

  it('accumulates across multiple calls (1-5 + 5-15 = 13)', () => {
    recordLocalTimeSaved('1-5');
    recordLocalTimeSaved('5-15');
    expect(getTimeSavedMinutes()).toBe(13);
  });
});

describe('formatTimeSaved', () => {
  it('formats sub-minute as ~1 minute (round up)', () => {
    expect(formatTimeSaved(0.5)).toBe('~1 minute');
  });

  it('formats 30 minutes', () => {
    expect(formatTimeSaved(30)).toBe('~30 minutes');
  });

  it('formats 59 minutes', () => {
    expect(formatTimeSaved(59)).toBe('~59 minutes');
  });

  it('formats exactly 60 minutes as ~1 hour', () => {
    expect(formatTimeSaved(60)).toBe('~1 hour');
  });

  it('formats 192 minutes as ~3.2 hours', () => {
    expect(formatTimeSaved(192)).toBe('~3.2 hours');
  });
});
