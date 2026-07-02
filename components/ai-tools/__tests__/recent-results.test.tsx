import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecentResults } from '../recent-results';
import type { ToolHistoryEntry } from '@/lib/client/tool-history';

const makeEntry = (inputPreview: string, output: string, timestamp: number): ToolHistoryEntry => ({
  inputPreview,
  output,
  timestamp,
});

describe('RecentResults', () => {
  it('renders null (no DOM node) when entries is empty', () => {
    const { container } = render(
      <RecentResults entries={[]} onRestore={jest.fn()} onClear={jest.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('lists the inputPreview for each entry', () => {
    const entries = [
      makeEntry('second prompt here', 'output 2', 2000),
      makeEntry('first prompt here', 'output 1', 1000),
    ];

    render(
      <RecentResults entries={entries} onRestore={jest.fn()} onClear={jest.fn()} />
    );

    expect(screen.getByText('second prompt here')).toBeInTheDocument();
    expect(screen.getByText('first prompt here')).toBeInTheDocument();
  });

  it('calls onRestore with the correct entry when Restore is clicked', async () => {
    const user = userEvent.setup();
    const onRestore = jest.fn();
    const entries = [
      makeEntry('first prompt', 'first output', 1000),
      makeEntry('second prompt', 'second output', 2000),
    ];

    render(
      <RecentResults entries={entries} onRestore={onRestore} onClear={jest.fn()} />
    );

    const restoreButtons = screen.getAllByRole('button', { name: /restore/i });
    await user.click(restoreButtons[0]);

    expect(onRestore).toHaveBeenCalledTimes(1);
    expect(onRestore).toHaveBeenCalledWith(entries[0]);
  });

  it('calls onClear when the Clear button is clicked', async () => {
    const user = userEvent.setup();
    const onClear = jest.fn();
    const entries = [makeEntry('some input', 'some output', 1000)];

    render(
      <RecentResults entries={entries} onRestore={jest.fn()} onClear={onClear} />
    );

    await user.click(screen.getByRole('button', { name: /clear/i }));

    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
