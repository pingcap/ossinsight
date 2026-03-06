import clsx from 'clsx';
import { CSSProperties, useMemo } from 'react';
import './style.scss';

export interface TextSkeletonProps {
  className?: string;
  visualCharacter?: string;
  characters?: number;
  style?: CSSProperties;
  color?: CSSProperties['backgroundColor'];
  children?: string;
}

export function TextSkeleton ({ className, color, visualCharacter = '\u2003', characters = 1000, style, children }: TextSkeletonProps) {
  const content = useMemo(() => visualCharacter.repeat(characters), [visualCharacter, characters]);
  return (
    <span className={clsx('inline-block', className)} style={style}>
      <span className="inline skeleton rounded select-none" style={{ backgroundColor: color ?? 'currentcolor' }}>
        {children ?? content}
      </span>
    </span>
  );
}
