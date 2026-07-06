export function KpiCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-warmNeutral-200 bg-white p-5 dark:border-warmNeutral-700 dark:bg-warmNeutral-800">
      <p className="text-xs font-bold uppercase tracking-widest text-tertiary">{label}</p>
      <p className="mt-2 font-mono text-3xl font-bold tracking-tight">
        {typeof value === 'number' ? value.toLocaleString('en-US') : value}
      </p>
      {hint && <p className="mt-1 text-xs text-tertiary">{hint}</p>}
    </div>
  );
}
