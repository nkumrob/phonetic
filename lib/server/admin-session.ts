/**
 * HMAC-signed admin session tokens: "<expiryMs>.<hexHmac(expiryMs)>".
 * WebCrypto only — verifySessionToken runs in middleware on the Edge
 * runtime, where node:crypto is unavailable.
 */

export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
export const ADMIN_COOKIE = 'np_admin';

async function hmacHex(payload: string, secret: string): Promise<string> {
  const key = await globalThis.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await globalThis.crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function createSessionToken(secret: string): Promise<string> {
  const expiry = String(Date.now() + SESSION_TTL_MS);
  return `${expiry}.${await hmacHex(expiry, secret)}`;
}

export async function verifySessionToken(token: string | undefined, secret: string): Promise<boolean> {
  if (!token) return false;
  const dot = token.indexOf('.');
  if (dot <= 0) return false;
  const expiry = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  if (!/^\d+$/.test(expiry) || Number(expiry) <= Date.now()) return false;

  const expected = await hmacHex(expiry, secret);
  // HMAC output is unforgeable without the secret, so a plain compare here
  // does not leak anything an attacker can use (they cannot generate
  // candidate signatures to time against).
  return signature === expected;
}
