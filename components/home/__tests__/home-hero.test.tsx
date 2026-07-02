import { render, screen } from '@testing-library/react';
import { HomeHero } from '../home-hero';

describe('HomeHero', () => {
  it('leads with the mission-critical positioning', () => {
    render(<HomeHero />);
    expect(
      screen.getByRole('heading', { level: 1, name: /AI productivity for mission-critical work/i })
    ).toBeInTheDocument();
  });

  it('routes the primary CTA to the tools and secondary to the converter', () => {
    render(<HomeHero />);
    expect(screen.getByRole('link', { name: /open productivity tools/i })).toHaveAttribute('href', '/tools');
    expect(screen.getByRole('link', { name: /try the NATO converter/i })).toHaveAttribute('href', '/tools/phonetic-converter');
  });

  it('names the audience and shows the proof row', () => {
    render(<HomeHero />);
    expect(screen.getByText(/aviation, maritime, dispatch, emergency/i)).toBeInTheDocument();
    expect(screen.getByText(/built for high-stakes work/i)).toBeInTheDocument();
    expect(screen.getByText(/verify before you rely/i)).toBeInTheDocument();
    expect(screen.getByText(/zero-ambiguity discipline/i)).toBeInTheDocument();
  });
});
