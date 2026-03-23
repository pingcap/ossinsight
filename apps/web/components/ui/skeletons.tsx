import { cn } from '@/lib/utils';
import { Skeleton } from './skeleton';

/** A single shimmer bar with sensible defaults for dark backgrounds. */
function Bar({ className, ...props }: React.ComponentProps<typeof Skeleton>) {
  return <Skeleton className={cn('bg-white/[0.06]', className)} {...props} />;
}

/* ------------------------------------------------------------------ */
/*  Chart skeleton                                                     */
/* ------------------------------------------------------------------ */

export function ChartSkeleton({
  className,
  height = 320,
}: {
  className?: string;
  height?: number;
}) {
  return (
    <div className={cn('flex h-full w-full flex-col gap-3', className)} style={{ minHeight: height }}>
      {/* Y-axis + chart area */}
      <div className="flex flex-1 items-end gap-2 px-4 pb-6 pt-4">
        {/* Y-axis labels */}
        <div className="flex h-full flex-col justify-between py-1">
          <Bar className="h-3 w-6" />
          <Bar className="h-3 w-8" />
          <Bar className="h-3 w-5" />
          <Bar className="h-3 w-7" />
        </div>

        {/* Bars / lines area */}
        <div className="flex flex-1 items-end justify-around gap-2">
          {[40, 65, 50, 80, 55, 70, 45, 75, 60, 85, 50, 68].map((h, i) => (
            <Bar
              key={i}
              className="w-full max-w-[32px] rounded-t-sm"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>

      {/* X-axis labels */}
      <div className="flex justify-around px-10">
        {Array.from({ length: 6 }).map((_, i) => (
          <Bar key={i} className="h-3 w-10" />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Table skeleton                                                     */
/* ------------------------------------------------------------------ */

export function TableSkeleton({
  rows = 6,
  columns = 3,
  className,
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div className={cn('w-full', className)}>
      {/* Header */}
      <div className="flex gap-4 border-b border-[#2a2a2c] py-3">
        {Array.from({ length: columns }).map((_, i) => (
          <Bar key={i} className={cn('h-4', i === 0 ? 'w-12' : 'flex-1')} />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex items-center gap-4 border-b border-[#1f1f20] py-3">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <Bar
              key={colIdx}
              className={cn(
                'h-4',
                colIdx === 0 ? 'w-8' : 'flex-1',
              )}
              style={colIdx !== 0 ? { maxWidth: `${70 + ((rowIdx + colIdx) % 3) * 10}%` } : undefined}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
