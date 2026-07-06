/**
 * KpiCard — single-metric tile for admin dashboards.
 *
 * When `delta` is provided, a trend indicator is rendered below the value:
 *   ↑X%   (text-success) — current is higher than previous
 *   ↓X%   (text-error)   — current is lower than previous
 *   — 0%  (text-tertiary) — no change (or both zero)
 *   new   (text-success)  — previous was 0 but current is positive
 */

interface DeltaProps {
  current: number;
  previous: number;
}

function formatDelta(current: number, previous: number): { text: string; cls: string } {
  if (previous === 0 && current > 0) {
    return { text: 'new', cls: 'text-success' };
  }
  if (previous === 0) {
    return { text: '— 0%', cls: 'text-tertiary' };
  }
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct > 0) return { text: `↑${pct}%`, cls: 'text-success' };
  if (pct < 0) return { text: `↓${Math.abs(pct)}%`, cls: 'text-error' };
  return { text: '— 0%', cls: 'text-tertiary' };
}

export function KpiCard({
  label,
  value,
  hint,
  delta,
}: {
  label: string;
  value: number | string;
  hint?: string;
  delta?: DeltaProps;
}) {
  const deltaInfo = delta !== undefined ? formatDelta(delta.current, delta.previous) : null;

  return (
    <div className="rounded-xl border border-warmNeutral-200 bg-white p-5 dark:border-warmNeutral-700 dark:bg-warmNeutral-800">
      <p className="text-xs font-bold uppercase tracking-widest text-tertiary">{label}</p>
      <p className="mt-2 font-mono text-3xl font-bold tracking-tight">
        {typeof value === 'number' ? value.toLocaleString('en-US') : value}
      </p>
      {deltaInfo && (
        <span className={`mt-1 inline-block text-xs font-semibold ${deltaInfo.cls}`}>
          {deltaInfo.text}
        </span>
      )}
      {hint && <p className="mt-1 text-xs text-tertiary">{hint}</p>}
    </div>
  );
}
