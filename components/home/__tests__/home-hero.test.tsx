import { render, screen } from '@testing-library/react';
import { HomeHero } from '../home-hero';

describe('HomeHero', () => {
  it('leads with the mission-critical positioning', () => {
    render(<HomeHero />);
    expect(
      screen.getByRole('heading', { level: 1, name: /AI productivity for mission-critical work/i })
    ).toBeInTheDocument();
  });

  it('routes the primary CTA to the tools and secondary to learn', () => {
    render(<HomeHero />);
    expect(screen.getByRole('link', { name: /open the tools/i })).toHaveAttribute('href', '/tools');
    expect(screen.getByRole('link', { name: /learn the alphabet/i })).toHaveAttribute('href', '/learn');
  });

  it('keeps the professional trust indicators', () => {
    render(<HomeHero />);
    expect(screen.getByText(/aviation/i)).toBeInTheDocument();
    expect(screen.getByText(/military/i)).toBeInTheDocument();
  });
});
