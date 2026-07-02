import { render, screen } from '@testing-library/react';
import { BenefitsSection } from '../benefits-section';

describe('BenefitsSection', () => {
  it('renders all three benefit CTAs with correct hrefs', () => {
    render(<BenefitsSection />);
    expect(screen.getByRole('link', { name: /Draft an update/i })).toHaveAttribute(
      'href',
      '/tools/email-drafter'
    );
    expect(screen.getByRole('link', { name: /Build a brief/i })).toHaveAttribute(
      'href',
      '/tools/summarizer'
    );
    expect(screen.getByRole('link', { name: /Check an AI answer/i })).toHaveAttribute(
      'href',
      '/tools/output-checker'
    );
  });
});
