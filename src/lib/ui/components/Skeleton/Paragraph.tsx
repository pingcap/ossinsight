import clsx from 'clsx';
import { CSSProperties } from 'react';
import { TextSkeleton } from './Text';
import './style.scss';

export interface ParagraphSkeletonProps {
  className?: string
  style?: CSSProperties;
  characters: number;
}

export function ParagraphSkeleton ({ characters = 120, className, style }: ParagraphSkeletonProps) {
  return (
    <p className={clsx('break-all', className)} style={style}>
      <TextSkeleton characters={characters} />
    </p>
  );
}