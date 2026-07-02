/**
 * tool-history tests run in the default jsdom environment.
 * jest.setup.js calls localStorage.clear() in its global beforeEach, so
 * each test starts with a real empty in-memory Storage (jsdom's own).
 * We do NOT try to mockImplementation on localStorage — jest.setup.js's
 * `global.localStorage = localStorageMock` is silently ignored by jsdom's
 * non-writable Storage getter, so localStorage here is the real jsdom Storage.
 */
import { getHistory, addHistoryEntry, clearHistory } from '../tool-history';

// Guarantee a clean real jsdom Storage before every test (jest.setup.js may
// call a mock clear() that is a no-op, so we clear window.localStorage
// directly to be certain).
beforeEach(() => {
  window.localStorage.clear();
});

describe('getHistory', () => {
  it('returns [] when nothing is stored', () => {
    expect(getHistory('prompt-improver')).toEqual([]);
  });

  it('returns [] when localStorage contains corrupt JSON', () => {
    window.localStorage.setItem('tool-history:prompt-improver', '{not valid json}');
    expect(getHistory('prompt-improver')).toEqual([]);
  });
});

describe('addHistoryEntry', () => {
  it('stores inputPreview capped at 80 chars, full output, numeric timestamp', () => {
    const longInput = 'A'.repeat(120);
    const output = 'some AI output';
    const before = Date.now();
    const result = addHistoryEntry('prompt-improver', longInput, output);
    const after = Date.now();

    expect(result).toHaveLength(1);
    const entry = result[0];
    expect(entry.inputPreview).toHaveLength(80);
    expect(entry.inputPreview).toBe('A'.repeat(80));
    expect(entry.output).toBe(output);
    expect(typeof entry.timestamp).toBe('number');
    expect(entry.timestamp).toBeGreaterThanOrEqual(before);
    expect(entry.timestamp).toBeLessThanOrEqual(after);
  });

  it('returns list in newest-first order', () => {
    addHistoryEntry('prompt-improver', 'first input', 'first output');
    const result = addHistoryEntry('prompt-improver', 'second input', 'second output');

    expect(result).toHaveLength(2);
    expect(result[0].inputPreview).toBe('second input');
    expect(result[1].inputPreview).toBe('first input');
  });

  it('caps at 5 entries — oldest is dropped when a 6th is added', () => {
    for (let i = 1; i <= 5; i++) {
      addHistoryEntry('prompt-improver', `input ${i}`, `output ${i}`);
    }
    const result = addHistoryEntry('prompt-improver', 'newest input', 'newest output');

    expect(result).toHaveLength(5);
    expect(result[0].inputPreview).toBe('newest input');
    // "input 1" (the oldest) should have been evicted
    expect(result.map((e) => e.inputPreview)).not.toContain('input 1');
  });
});

describe('clearHistory', () => {
  it('empties the history for a tool', () => {
    addHistoryEntry('prompt-improver', 'something', 'result');
    expect(getHistory('prompt-improver')).toHaveLength(1);

    clearHistory('prompt-improver');
    expect(getHistory('prompt-improver')).toEqual([]);
  });
});
