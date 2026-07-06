/**
 * @jest-environment node
 */
import { parseAnonId } from '../anon-id';

describe('parseAnonId', () => {
  it('accepts UUID-format values and normalizes to lowercase', () => {
    expect(parseAnonId('a1b2c3d4-e5f6-7890-abcd-ef1234567890')).toBe('a1b2c3d4-e5f6-7890-abcd-ef1234567890');
    expect(parseAnonId('A1B2C3D4-E5F6-7890-ABCD-EF1234567890')).toBe('a1b2c3d4-e5f6-7890-abcd-ef1234567890');
  });

  it('rejects junk, empty, and undefined', () => {
    expect(parseAnonId('anon-123')).toBeNull();
    expect(parseAnonId('')).toBeNull();
    expect(parseAnonId(undefined)).toBeNull();
    expect(parseAnonId('x'.repeat(4000))).toBeNull();
  });
});
