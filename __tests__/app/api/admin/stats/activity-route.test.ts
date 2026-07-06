/**
 * @jest-environment node
 */
import { parseActivityLimit } from '@/app/api/admin/stats/activity/parse-limit';

describe('parseActivityLimit — silent clamping', () => {
  it('defaults to 50 for a missing param', () => {
    expect(parseActivityLimit(null)).toBe(50);
  });

  it('defaults to 50 for a non-numeric value', () => {
    expect(parseActivityLimit('abc')).toBe(50);
  });

  it('clamps values above the max down to 200', () => {
    expect(parseActivityLimit('999')).toBe(200);
  });

  it('clamps values below the min up to 1', () => {
    expect(parseActivityLimit('-5')).toBe(1);
  });

  it('floors non-integer values', () => {
    expect(parseActivityLimit('12.9')).toBe(12);
  });

  it('passes valid in-range integers through', () => {
    expect(parseActivityLimit('75')).toBe(75);
  });
});
