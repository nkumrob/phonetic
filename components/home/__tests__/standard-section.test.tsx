import { render, screen } from '@testing-library/react';
import { StandardSection } from '../standard-section';

describe('StandardSection', () => {
  it('keeps the NATO keyword in the H2', () => {
    render(<StandardSection />);
    expect(
      screen.getByRole('heading', { level: 2, name: /NATO Phonetic Alphabet/i })
    ).toBeInTheDocument();
  });

  it('renders the six-letter chart preview', () => {
    render(<StandardSection />);
    for (const word of ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot']) {
      expect(screen.getByText(word)).toBeInTheDocument();
    }
  });

  it('renders the three entry links', () => {
    render(<StandardSection />);
    expect(screen.getByRole('link', { name: /convert text/i })).toHaveAttribute(
      'href',
      '/tools/phonetic-converter'
    );
    expect(screen.getByRole('link', { name: /download the chart/i })).toHaveAttribute(
      'href',
      '/api/pdf'
    );
    expect(screen.getByRole('link', { name: /learn the full alphabet/i })).toHaveAttribute(
      'href',
      '/learn'
    );
  });
});
