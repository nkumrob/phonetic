import { render, screen } from '@testing-library/react';
import { TwoDoors } from '../two-doors';

describe('TwoDoors', () => {
  it('renders both outcome headings', () => {
    render(<TwoDoors />);
    expect(
      screen.getByRole('heading', { level: 2, name: /split-second clarity/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /decisions, faster/i })
    ).toBeInTheDocument();
  });

  it('keeps the NATO door first in the DOM (mobile stacking order)', () => {
    render(<TwoDoors />);
    const nato = screen.getByRole('heading', { level: 2, name: /split-second clarity/i });
    const ai = screen.getByRole('heading', { level: 2, name: /decisions, faster/i });
    expect(nato.compareDocumentPosition(ai) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('frames the NATO door as a comms standard, not just an alphabet', () => {
    render(<TwoDoors />);
    expect(screen.getByText('Clear Comms · NATO Standard')).toBeInTheDocument();
    expect(screen.getByText(/precision to your everyday work/i)).toBeInTheDocument();
  });

  it('routes all NATO entry points correctly', () => {
    render(<TwoDoors />);
    expect(screen.getByRole('link', { name: /convert text/i })).toHaveAttribute(
      'href',
      '/tools/phonetic-converter'
    );
    const chart = screen.getByRole('link', { name: /chart pdf/i });
    expect(chart).toHaveAttribute('href', '/api/pdf');
    expect(chart).toHaveAttribute('download');
    expect(screen.getByRole('link', { name: /master nato comms/i })).toHaveAttribute('href', '/learn');
  });

  it('routes the AI door to the tools hub', () => {
    render(<TwoDoors />);
    expect(screen.getByRole('link', { name: /open the ai tools/i })).toHaveAttribute(
      'href',
      '/tools'
    );
  });
});
