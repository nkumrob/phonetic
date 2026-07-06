import { render, screen } from '@testing-library/react';
import { KpiCard } from '../kpi-card';

describe('KpiCard', () => {
  it('renders label, formatted value, and hint', () => {
    render(<KpiCard label="Tokens used" value={2100456} hint="input + output" />);
    expect(screen.getByText('Tokens used')).toBeInTheDocument();
    expect(screen.getByText('2,100,456')).toBeInTheDocument();
    expect(screen.getByText('input + output')).toBeInTheDocument();
  });

  it('renders string values verbatim', () => {
    render(<KpiCard label="Time saved" value="~48 hours" />);
    expect(screen.getByText('~48 hours')).toBeInTheDocument();
  });

  it('renders no delta element when delta prop is absent', () => {
    render(<KpiCard label="Visitors" value={42} />);
    expect(screen.queryByText(/↑|↓|new|— 0%/)).not.toBeInTheDocument();
  });

  describe('delta rendering', () => {
    it('renders ↑X% in text-success when current > previous', () => {
      // 60 vs 50 → 20% increase
      render(<KpiCard label="Visitors" value={60} delta={{ current: 60, previous: 50 }} />);
      const el = screen.getByText('↑20%');
      expect(el).toHaveClass('text-success');
    });

    it('renders ↓X% in text-error when current < previous', () => {
      // 30 vs 40 → 25% decrease
      render(<KpiCard label="Visitors" value={30} delta={{ current: 30, previous: 40 }} />);
      const el = screen.getByText('↓25%');
      expect(el).toHaveClass('text-error');
    });

    it('renders — 0% in text-tertiary when current === previous', () => {
      render(<KpiCard label="Visitors" value={30} delta={{ current: 30, previous: 30 }} />);
      const el = screen.getByText('— 0%');
      expect(el).toHaveClass('text-tertiary');
    });

    it('renders — 0% in text-tertiary when both are 0', () => {
      render(<KpiCard label="Visitors" value={0} delta={{ current: 0, previous: 0 }} />);
      const el = screen.getByText('— 0%');
      expect(el).toHaveClass('text-tertiary');
    });

    it('renders "new" in text-success when previous===0 and current>0', () => {
      render(<KpiCard label="Visitors" value={5} delta={{ current: 5, previous: 0 }} />);
      const el = screen.getByText('new');
      expect(el).toHaveClass('text-success');
    });
  });
});
