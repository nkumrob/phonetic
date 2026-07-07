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

  it('has no redundant brand eyebrow (logo already carries the brand)', () => {
    render(<HomeHero />);
    expect(screen.queryByText(/natophonetic/i)).not.toBeInTheDocument();
  });

  it('routes the primary action to the AI tools and the secondary to mastering NATO comms', () => {
    render(<HomeHero />);
    expect(screen.getByRole('link', { name: /open the ai tools/i })).toHaveAttribute(
      'href',
      '/tools'
    );
    expect(screen.getByRole('link', { name: /master nato comms/i })).toHaveAttribute(
      'href',
      '/learn'
    );
  });
});
