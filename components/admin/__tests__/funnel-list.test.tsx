import { render, screen } from '@testing-library/react';
import { FunnelList } from '../funnel-list';

describe('FunnelList', () => {
  it('renders "No practice sessions" empty state when data is empty', () => {
    render(<FunnelList data={[]} />);
    expect(screen.getByText(/No practice sessions/i)).toBeInTheDocument();
  });

  it('renders the mode name', () => {
    render(<FunnelList data={[{ mode: 'simple', started: 100, completed: 75 }]} />);
    expect(screen.getByText(/simple/i)).toBeInTheDocument();
  });

  it('renders the completion percentage', () => {
    // 75 / 100 = 75%
    render(<FunnelList data={[{ mode: 'simple', started: 100, completed: 75 }]} />);
    expect(screen.getByText(/75%/)).toBeInTheDocument();
  });

  it('renders — (zero-started guard) when started is 0', () => {
    render(<FunnelList data={[{ mode: 'challenge', started: 0, completed: 0 }]} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders started and completed counts', () => {
    render(<FunnelList data={[{ mode: 'simple', started: 50, completed: 30 }]} />);
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
  });

  it('rounds completion % to nearest integer', () => {
    // 1 / 3 = 33.33... → 33%
    render(<FunnelList data={[{ mode: 'learn', started: 3, completed: 1 }]} />);
    expect(screen.getByText(/33%/)).toBeInTheDocument();
  });

  it('renders multiple modes', () => {
    render(
      <FunnelList
        data={[
          { mode: 'simple', started: 40, completed: 30 },
          { mode: 'challenge', started: 20, completed: 10 },
        ]}
      />
    );
    expect(screen.getByText(/simple/i)).toBeInTheDocument();
    expect(screen.getByText(/challenge/i)).toBeInTheDocument();
  });
});
