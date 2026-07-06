import { render, screen } from '@testing-library/react';
import { TopList } from '../top-list';

describe('TopList', () => {
  it('renders the default empty state when data is empty', () => {
    render(<TopList data={[]} />);
    expect(screen.getByText('No data.')).toBeInTheDocument();
  });

  it('renders a custom empty state text', () => {
    render(<TopList data={[]} emptyText="No pages yet." />);
    expect(screen.getByText('No pages yet.')).toBeInTheDocument();
  });

  it('renders each label', () => {
    render(
      <TopList
        data={[
          { label: '/phonetic', count: 120 },
          { label: '/practice', count: 80 },
        ]}
      />
    );
    expect(screen.getByText('/phonetic')).toBeInTheDocument();
    expect(screen.getByText('/practice')).toBeInTheDocument();
  });

  it('renders each count formatted with en-US locale', () => {
    render(
      <TopList
        data={[
          { label: '/phonetic', count: 1200 },
          { label: '/practice', count: 800 },
        ]}
      />
    );
    expect(screen.getByText('1,200')).toBeInTheDocument();
    expect(screen.getByText('800')).toBeInTheDocument();
  });

  it('renders the top item with 100% bar width and smaller proportional widths', () => {
    const { container } = render(
      <TopList
        data={[
          { label: 'top', count: 100 },
          { label: 'half', count: 50 },
        ]}
      />
    );
    const bars = container.querySelectorAll('[style*="width"]');
    // Top bar = 100%, second bar = 50%
    expect(bars[0]).toHaveStyle({ width: '100%' });
    expect(bars[1]).toHaveStyle({ width: '50%' });
  });
});
