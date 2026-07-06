/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { readGeo } from '../geo';

function makeRequest(headers: Record<string, string> = {}): NextRequest {
  return new NextRequest('http://localhost/', { headers });
}

describe('readGeo', () => {
  it('returns valid 2-letter country and decoded city', () => {
    const req = makeRequest({
      'x-vercel-ip-country': 'US',
      'x-vercel-ip-city': 'New%20York',
    });
    expect(readGeo(req)).toEqual({ country: 'US', city: 'New York' });
  });

  it('returns nulls when headers are absent', () => {
    expect(readGeo(makeRequest())).toEqual({ country: null, city: null });
  });

  it('returns null country for junk value', () => {
    const req = makeRequest({ 'x-vercel-ip-country': '<script>' });
    expect(readGeo(req).country).toBeNull();
  });

  it('returns null country for 1-letter value', () => {
    const req = makeRequest({ 'x-vercel-ip-country': 'U' });
    expect(readGeo(req).country).toBeNull();
  });

  it('returns null country for 3-letter value', () => {
    const req = makeRequest({ 'x-vercel-ip-country': 'USA' });
    expect(readGeo(req).country).toBeNull();
  });

  it('returns null country for lowercase 2-letter value', () => {
    const req = makeRequest({ 'x-vercel-ip-country': 'us' });
    expect(readGeo(req).country).toBeNull();
  });

  it('returns null country for mixed-case 2-letter value', () => {
    const req = makeRequest({ 'x-vercel-ip-country': 'Us' });
    expect(readGeo(req).country).toBeNull();
  });

  it('decodes a URL-encoded city', () => {
    const req = makeRequest({ 'x-vercel-ip-city': 'San%20Francisco' });
    expect(readGeo(req).city).toBe('San Francisco');
  });

  it('trims whitespace from city', () => {
    const req = makeRequest({ 'x-vercel-ip-city': '  Austin  ' });
    expect(readGeo(req).city).toBe('Austin');
  });

  it('returns null city for values over 80 chars after decoding', () => {
    const req = makeRequest({ 'x-vercel-ip-city': 'A'.repeat(81) });
    expect(readGeo(req).city).toBeNull();
  });

  it('accepts a city of exactly 80 chars', () => {
    const req = makeRequest({ 'x-vercel-ip-city': 'B'.repeat(80) });
    expect(readGeo(req).city).toBe('B'.repeat(80));
  });

  it('returns null city on decode failure (malformed percent-encoding)', () => {
    const req = makeRequest({ 'x-vercel-ip-city': '%invalid%' });
    expect(readGeo(req).city).toBeNull();
  });

  it('returns valid country when city is absent', () => {
    const req = makeRequest({ 'x-vercel-ip-country': 'GB' });
    expect(readGeo(req)).toEqual({ country: 'GB', city: null });
  });

  it('returns valid city when country is absent', () => {
    const req = makeRequest({ 'x-vercel-ip-city': 'Paris' });
    expect(readGeo(req)).toEqual({ country: null, city: 'Paris' });
  });

  it('returns null city for empty string header', () => {
    const req = makeRequest({ 'x-vercel-ip-city': '' });
    expect(readGeo(req).city).toBeNull();
  });

  it('returns null city for whitespace-only header (e.g. decoded %20%20)', () => {
    const req = makeRequest({ 'x-vercel-ip-city': '%20%20' });
    expect(readGeo(req).city).toBeNull();
  });
});
