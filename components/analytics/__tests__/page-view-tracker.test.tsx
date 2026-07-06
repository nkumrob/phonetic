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

import { render } from '@testing-library/react';
import { PageViewTracker } from '../page-view-tracker';

describe('PageViewTracker', () => {
  const originalSendBeacon = navigator.sendBeacon;

  afterEach(() => {
    Object.defineProperty(navigator, 'sendBeacon', { value: originalSendBeacon, configurable: true });
  });

  it('tracks a page_view for the current pathname', async () => {
    const sendBeacon = jest.fn().mockReturnValue(true);
    Object.defineProperty(navigator, 'sendBeacon', { value: sendBeacon, configurable: true });

    render(<PageViewTracker pathname="/learn" />);

    expect(sendBeacon).toHaveBeenCalledTimes(1);
    const blob = sendBeacon.mock.calls[0][1] as Blob;
    expect(await blob.text()).toContain('"tool":"/learn"');
  });

  it('re-tracks when the pathname changes but not on re-render', () => {
    const sendBeacon = jest.fn().mockReturnValue(true);
    Object.defineProperty(navigator, 'sendBeacon', { value: sendBeacon, configurable: true });

    const { rerender } = render(<PageViewTracker pathname="/learn" />);
    rerender(<PageViewTracker pathname="/learn" />);
    rerender(<PageViewTracker pathname="/tools" />);

    expect(sendBeacon).toHaveBeenCalledTimes(2);
  });
});
