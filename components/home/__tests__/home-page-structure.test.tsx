import { render, screen } from '@testing-library/react';
import HomeClient from '@/app/home-client';

// The dynamic widgets load async in jsdom and fire state updates outside act();
// this structural test only asserts static headings/links, so stub them.
jest.mock('@/components/famewall', () => ({ FamewallWidget: () => <div data-testid="famewall-stub" /> }));
jest.mock('@/components/testimonials', () => ({ TestimonialsGrid: () => <div data-testid="testimonials-stub" /> }));

describe('HomeClient structure', () => {
  it('renders the approved sections in order', () => {
    render(<HomeClient />);
    const headings = screen.getAllByRole('heading').map((h) => h.textContent ?? '');
    const expectedOrder = [
      'Productivity for mission-critical work',
      'Split-second clarity',
      'Decisions, faster',
      'Made for High-Stakes Work',
      'Hours of work in minutes',
      'Built on the NATO Phonetic Alphabet',
      'Precision in every deliverable',
    ];
    const positions = expectedOrder.map((t) =>
      headings.findIndex((h) => h.includes(t))
    );
    positions.forEach((p, i) => {
      expect(p).toBeGreaterThanOrEqual(0); // heading exists (i = expectedOrder index)
      if (i > 0) expect(p).toBeGreaterThan(positions[i - 1]); // and in order
    });
  });

  it('no longer renders the old NATO features grid', () => {
    render(<HomeClient />);
    expect(screen.queryByText(/What Is the NATO Phonetic Alphabet\?/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Interactive Learning/i)).not.toBeInTheDocument();
  });

  it('routes the closing CTA buttons', () => {
    render(<HomeClient />);
    // "Open the Tools" appears twice (HomeAiSection button + closing CTA) — both must hit /tools.
    const toolsLinks = screen.getAllByRole('link', { name: /open the tools/i });
    expect(toolsLinks.length).toBeGreaterThanOrEqual(1);
    toolsLinks.forEach((l) => expect(l).toHaveAttribute('href', '/tools'));
    expect(screen.getByRole('link', { name: /learn the alphabet/i })).toHaveAttribute(
      'href',
      '/learn'
    );
  });
});
