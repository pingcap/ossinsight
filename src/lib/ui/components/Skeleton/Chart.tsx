import clsx from 'clsx';
import { CSSProperties } from 'react';
import './style.scss';

export function ChartSkeleton ({ className, style }: { className?: string, style?: CSSProperties }) {
  return (
    <div className={clsx('skeleton', className)} style={style}>
      <svg className="w-full h-full stroke-current fill-none" viewBox="0 0 1 1">
        <g strokeLinecap="round" strokeLinejoin="round">
          <path d="M0.2 0.8 L0.4 0.6 L 0.6 0.7 L0.8 0.2" vectorEffect="non-scaling-stroke" strokeWidth="3" />
        </g>
      </svg>
    </div>
  );
}
