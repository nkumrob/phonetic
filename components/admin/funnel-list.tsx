/**
 * FunnelList — practice session start vs completion bars, grouped by mode.
 *
 * Each row shows:
 *   - Mode name (capitalised)
 *   - Completion % (— when started === 0)
 *   - Proportional started bar (blue)
 *   - Proportional completed bar (green)
 */

interface FunnelRow {
  mode: string;
  started: number;
  completed: number;
}

export function FunnelList({ data }: { data: FunnelRow[] }) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-tertiary">No practice sessions in this range.</p>
    );
  }

  const maxStarted = Math.max(1, ...data.map((r) => r.started));

  return (
    <ul className="space-y-5">
      {data.map(({ mode, started, completed }) => {
        const pct = started === 0 ? null : Math.round((completed / started) * 100);

        return (
          <li key={mode}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-semibold capitalize text-gray-700 dark:text-warmNeutral-100">
                {mode}
              </span>
              <span className="font-mono text-xs text-tertiary">
                {pct === null ? '—' : `${pct}% complete`}
              </span>
            </div>

            <div className="space-y-1.5">
              {/* Started bar */}
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-warmNeutral-300">
                <span className="w-16 shrink-0">Started</span>
                <div className="flex-1 rounded-full bg-warmNeutral-100 dark:bg-warmNeutral-700" style={{ height: '6px' }}>
                  <div
                    className="h-full rounded-full bg-coolBlue-500"
                    style={{ width: `${(started / maxStarted) * 100}%` }}
                  />
                </div>
                <span className="w-10 shrink-0 text-right font-mono font-bold">
                  {started}
                </span>
              </div>

              {/* Completed bar */}
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-warmNeutral-300">
                <span className="w-16 shrink-0">Done</span>
                <div className="flex-1 rounded-full bg-warmNeutral-100 dark:bg-warmNeutral-700" style={{ height: '6px' }}>
                  <div
                    className="h-full rounded-full bg-success"
                    style={{ width: `${(completed / maxStarted) * 100}%` }}
                  />
                </div>
                <span className="w-10 shrink-0 text-right font-mono font-bold">
                  {completed}
                </span>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
