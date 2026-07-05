import { render, screen } from '@testing-library/react';
import { HomeHero } from '../home-hero';

describe('HomeHero', () => {
  it('leads with the outcome positioning', () => {
    render(<HomeHero />);
    expect(
      screen.getByRole('heading', { level: 1, name: /productivity for mission-critical work/i })
    ).toBeInTheDocument();
  });

  it('sells split-second decisions in the subhead', () => {
    render(<HomeHero />);
    expect(
      screen.getByText(/split-second decisions, precise communication, and dependable/i)
    ).toBeInTheDocument();
  });

  it('shows the brand eyebrow', () => {
    render(<HomeHero />);
    expect(screen.getByText(/natophonetic/i)).toBeInTheDocument();
  });

  it('has no CTA links; the doors below are the CTAs', () => {
    render(<HomeHero />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
