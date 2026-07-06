// jsdom's Blob implementation does not include .text() (it's a newer addition).
// Polyfill it so the sendBeacon payload assertion can read the blob back.
if (typeof Blob !== 'undefined' && typeof Blob.prototype.text !== 'function') {
  Blob.prototype.text = function (): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(this);
    });
  };
}

import { track } from '../track';

describe('track', () => {
  const originalFetch = global.fetch;
  const originalSendBeacon = navigator.sendBeacon;

  afterEach(() => {
    global.fetch = originalFetch;
    Object.defineProperty(navigator, 'sendBeacon', { value: originalSendBeacon, configurable: true });
  });

  it('prefers navigator.sendBeacon with a JSON blob', async () => {
    const sendBeacon = jest.fn().mockReturnValue(true);
    Object.defineProperty(navigator, 'sendBeacon', { value: sendBeacon, configurable: true });

    track('converter_use', 'phonetic-converter', { chars: 12 });

    expect(sendBeacon).toHaveBeenCalledTimes(1);
    const [url, blob] = sendBeacon.mock.calls[0];
    expect(url).toBe('/api/events');
    expect(await (blob as Blob).text()).toBe(
      JSON.stringify({ name: 'converter_use', tool: 'phonetic-converter', metadata: { chars: 12 } })
    );
  });

  it('falls back to fetch keepalive when sendBeacon is unavailable', () => {
    Object.defineProperty(navigator, 'sendBeacon', { value: undefined, configurable: true });
    const fetchMock = jest.fn().mockResolvedValue({ ok: true });
    global.fetch = fetchMock as unknown as typeof fetch;

    track('page_view', '/learn');

    expect(fetchMock).toHaveBeenCalledWith('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'page_view', tool: '/learn' }),
      keepalive: true,
    });
  });

  it('never throws, even when both transports fail', () => {
    Object.defineProperty(navigator, 'sendBeacon', {
      value: jest.fn(() => {
        throw new Error('beacon boom');
      }),
      configurable: true,
    });

    expect(() => track('page_view')).not.toThrow();
  });
});
