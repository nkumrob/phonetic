import { render, screen } from '@testing-library/react';
import { HomeHero } from '../home-hero';

describe('HomeHero', () => {
  it('leads with the task-focused positioning', () => {
    render(<HomeHero />);
    expect(
      screen.getByRole('heading', { level: 1, name: /use AI better at work/i })
    ).toBeInTheDocument();
  });

  it('routes the primary CTA to the tools and secondary to the converter', () => {
    render(<HomeHero />);
    expect(screen.getByRole('link', { name: /open productivity tools/i })).toHaveAttribute('href', '/tools');
    expect(screen.getByRole('link', { name: /try the NATO converter/i })).toHaveAttribute('href', '/tools/phonetic-converter');
  });

  it('shows the proof row', () => {
    render(<HomeHero />);
    expect(screen.getByText(/built for real work tasks/i)).toBeInTheDocument();
    expect(screen.getByText(/practical, hands-on AI use/i)).toBeInTheDocument();
  });
});
