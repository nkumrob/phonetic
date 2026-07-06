import type { ToolStatsRow } from '@/lib/db/analytics-repo';

const COLUMNS = ['Tool', 'Uses', 'Unique users', 'Input tokens', 'Output tokens', 'Avg latency', 'Votes'];

function cell(value: number | null, suffix = ''): string {
  return value === null ? '—' : `${value.toLocaleString('en-US')}${suffix}`;
}

export function ToolsTable({ rows }: { rows: ToolStatsRow[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-warmNeutral-200 bg-white dark:border-warmNeutral-700 dark:bg-warmNeutral-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-warmNeutral-200 text-left dark:border-warmNeutral-700">
            {COLUMNS.map((col) => (
              <th key={col} className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-tertiary">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.tool} className="border-b border-warmNeutral-100 last:border-0 dark:border-warmNeutral-700/50">
              <td className="px-4 py-3 font-semibold">{row.tool}</td>
              <td className="px-4 py-3 font-mono">{row.uses.toLocaleString('en-US')}</td>
              <td className="px-4 py-3 font-mono">{row.uniqueUsers.toLocaleString('en-US')}</td>
              <td className="px-4 py-3 font-mono">{cell(row.inputTokens)}</td>
              <td className="px-4 py-3 font-mono">{cell(row.outputTokens)}</td>
              <td className="px-4 py-3 font-mono">{cell(row.avgLatencyMs, ' ms')}</td>
              <td className="px-4 py-3 font-mono">{cell(row.timeSavedVotes)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
