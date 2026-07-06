/**
 * @jest-environment node
 */
import { createSessionToken, verifySessionToken, SESSION_TTL_MS } from '../admin-session';

const SECRET = 'test-secret';

describe('admin session tokens', () => {
  it('round-trips a valid token', async () => {
    const token = await createSessionToken(SECRET);
    expect(await verifySessionToken(token, SECRET)).toBe(true);
  });

  it('embeds an expiry roughly TTL from now', async () => {
    const token = await createSessionToken(SECRET);
    const expiry = Number(token.split('.')[0]);
    expect(expiry).toBeGreaterThan(Date.now());
    expect(expiry).toBeLessThanOrEqual(Date.now() + SESSION_TTL_MS);
  });

  it('rejects tampered signatures and payloads', async () => {
    const token = await createSessionToken(SECRET);
    const [exp, sig] = token.split('.');
    expect(await verifySessionToken(`${exp}.${'0'.repeat(sig.length)}`, SECRET)).toBe(false);
    expect(await verifySessionToken(`${Number(exp) + 9999}.${sig}`, SECRET)).toBe(false);
  });

  it('rejects expired tokens even with a valid signature', async () => {
    const past = Date.now() - 1000;
    const forged = `${past}.${await signForTest(String(past), SECRET)}`;
    expect(await verifySessionToken(forged, SECRET)).toBe(false);
  });

  it('rejects garbage and wrong secrets', async () => {
    expect(await verifySessionToken('garbage', SECRET)).toBe(false);
    expect(await verifySessionToken('', SECRET)).toBe(false);
    const token = await createSessionToken(SECRET);
    expect(await verifySessionToken(token, 'other-secret')).toBe(false);
  });

  it('rejects empty secret (fail-closed, no exception)', async () => {
    const token = await createSessionToken(SECRET);
    expect(await verifySessionToken(token, '')).toBe(false);
  });

  it('rejects non-hex signature before calling verify', async () => {
    const future = String(Date.now() + 100000);
    expect(await verifySessionToken(`${future}.zzzz`, SECRET)).toBe(false);
  });
});

// Test helper mirroring the module's HMAC so we can forge an expired-but-signed token.
async function signForTest(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, '0')).join('');
}
