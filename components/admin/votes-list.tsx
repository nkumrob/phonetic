const BUCKET_LABELS: Record<string, string> = {
  '<1': 'Under a minute',
  '1-5': '1–5 minutes',
  '5-15': '5–15 minutes',
  '15+': '15+ minutes',
};

const BUCKET_ORDER = ['<1', '1-5', '5-15', '15+'];

export function VotesList({ data }: { data: Array<{ bucket: string; votes: number }> }) {
  const max = Math.max(1, ...data.map((d) => d.votes));
  const ordered = BUCKET_ORDER.map((bucket) => ({
    bucket,
    votes: data.find((d) => d.bucket === bucket)?.votes ?? 0,
  }));

  return (
    <ul className="space-y-2">
      {ordered.map(({ bucket, votes }) => (
        <li key={bucket} className="flex items-center gap-3 text-sm">
          <span className="w-32 shrink-0 text-gray-600 dark:text-warmNeutral-200">
            {BUCKET_LABELS[bucket]}
          </span>
          <span
            className="h-2 rounded-full bg-coolBlue-500"
            style={{ width: `${(votes / max) * 100}%` }}
            aria-hidden
          />
          <span className="font-mono text-xs font-bold">{votes}</span>
        </li>
      ))}
    </ul>
  );
}
