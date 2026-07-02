import { render, screen } from '@testing-library/react';
import { NatoBand } from '../nato-band';

describe('NatoBand', () => {
  it('renders the three NATO entry-point links', () => {
    render(<NatoBand />);
    expect(screen.getByRole('link', { name: /Try the Converter/i })).toHaveAttribute(
      'href',
      '/tools/phonetic-converter'
    );
    expect(screen.getByRole('link', { name: /Learn the Alphabet/i })).toHaveAttribute(
      'href',
      '/learn'
    );
    const downloadLink = screen.getByRole('link', { name: /Download the Chart/i });
    expect(downloadLink).toHaveAttribute('href', '/api/pdf');
    expect(downloadLink).toHaveAttribute('download');
  });
});
