import { AlertTriangle } from 'lucide-react';
import { STAR_DATA_INCIDENT } from '@/lib/data-quality';

/**
 * Shown in place of a ranking we know is wrong (`variant="block"`), or above
 * a surface where only some columns are affected (`variant="inline"`).
 */
export function DataQualityNotice({
  variant = 'block',
  className = '',
}: {
  variant?: 'block' | 'inline';
  className?: string;
}) {
  if (variant === 'inline') {
    return (
      <div
        role="status"
        className={`flex items-start gap-2.5 rounded-md border border-[#FFE895]/25 bg-[#FFE895]/[0.06] px-3.5 py-2.5 text-sm text-[#d8d8d8] ${className}`}
      >
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#FFE895]" aria-hidden="true" />
        <p>
          Growth figures below are derived from GitHub&apos;s public events feed, which has been
          incomplete since {STAR_DATA_INCIDENT.severelyDegradedSince}. Treat them as lower bounds.
          Total star counts come directly from GitHub and are accurate.
        </p>
      </div>
    );
  }

  return (
    <div
      role="status"
      className={`rounded-lg border border-dashed border-[#3c3c3c] bg-[#212122] px-6 py-8 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/10 bg-[#2a2a2b] text-[#FFE895]">
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="max-w-2xl">
          <h3 className="text-base font-semibold text-[#f4f4f5]">
            {STAR_DATA_INCIDENT.headline}
          </h3>
          <p className="mt-2 text-sm leading-6 text-[#b4b4b4]">{STAR_DATA_INCIDENT.body}</p>
        </div>
      </div>
    </div>
  );
}
