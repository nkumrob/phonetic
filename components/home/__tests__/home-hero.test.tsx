import { render, screen } from '@testing-library/react';
import { HomeHero } from '../home-hero';

describe('HomeHero', () => {
  it('leads with the NATO phonetic alphabet', () => {
    render(<HomeHero />);
    expect(
      screen.getByRole('heading', { level: 1, name: /NATO Phonetic Alphabet: A to Z/i })
    ).toBeInTheDocument();
  });

  it('bridges to the AI tools in the subhead', () => {
    render(<HomeHero />);
    expect(
      screen.getByText(/AI tools for mission-critical communication/i)
    ).toBeInTheDocument();
  });

  it('routes the primary CTA to learn and secondary to the tools', () => {
    render(<HomeHero />);
    expect(screen.getByRole('link', { name: /start learning/i })).toHaveAttribute('href', '/learn');
    expect(screen.getByRole('link', { name: /explore AI tools/i })).toHaveAttribute('href', '/tools');
  });

  it('keeps the professional trust indicators', () => {
    render(<HomeHero />);
    expect(screen.getByText('✈️ Aviation')).toBeInTheDocument();
    expect(screen.getByText('🚢 Maritime')).toBeInTheDocument();
    expect(screen.getByText('🚔 Emergency')).toBeInTheDocument();
    expect(screen.getByText('📡 Military')).toBeInTheDocument();
  });
});
