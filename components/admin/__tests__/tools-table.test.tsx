import { render, screen } from '@testing-library/react';
import { ToolsTable } from '../tools-table';

describe('ToolsTable', () => {
  it('renders AI rows with metrics and event rows with em-dashes', () => {
    render(
      <ToolsTable
        rows={[
          { tool: 'summarizer', uses: 12, uniqueUsers: 4, inputTokens: 1000, outputTokens: 500, avgLatencyMs: 900, timeSavedVotes: 3 },
          { tool: 'phonetic-converter', uses: 7, uniqueUsers: 5, inputTokens: null, outputTokens: null, avgLatencyMs: null, timeSavedVotes: null },
        ]}
      />
    );

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('summarizer')).toBeInTheDocument();
    expect(screen.getByText('1,000')).toBeInTheDocument();
    const converterRow = screen.getByText('phonetic-converter').closest('tr')!;
    expect(converterRow.textContent).toContain('—');
  });
});
