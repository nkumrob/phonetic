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
});
