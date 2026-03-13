type CommonChartProps = {
  chart?: string;
  category?: string;
  field?: string;
  n?: number;
};

export function CommonChart({
  chart,
  category,
  field,
  n,
}: CommonChartProps) {
  return (
    <div className="my-8 border-y border-white/8 py-5">
      <div className="text-[11px] uppercase tracking-[0.24em] text-[#ffe895]">
        Archived Interactive Chart
      </div>
      <p className="mt-3 text-sm leading-7 text-slate-300">
        This legacy article referenced an interactive chart component from the original site.
        The article content is preserved here, while the embedded chart is kept as an archived placeholder during the docs migration.
      </p>
      <div className="mt-4 grid gap-2 text-xs text-slate-400 sm:grid-cols-2">
        <div>Chart: {chart ?? 'unknown'}</div>
        <div>Category: {category ?? 'unknown'}</div>
        <div>Field: {field ?? 'n/a'}</div>
        <div>Rows: {n ?? 'default'}</div>
      </div>
    </div>
  );
}
