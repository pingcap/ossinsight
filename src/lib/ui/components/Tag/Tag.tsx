import clsx from 'clsx';
import { HTMLAttributes } from 'react';
import { getVariantClasses } from '../../utils/variants';

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  colorKey?: string;
  color?: string;
  selected?: boolean;
  onSelected?: () => void;
  shape?: 'capsule' | 'contained';
  size?: 'lg';
}

export function Tag ({ selected, style, className, onSelected, shape = 'capsule', size, ...props }: TagProps) {
  return (
    <span
      className={clsx(
        'Tag',
        getVariantClasses('Tag', [shape, size, selected && 'selected', onSelected && 'interactive']),
        className,
      )}
      style={style}
      tabIndex={onSelected && 0}
      data-selected={selected}
      onClick={onSelected}
      {...props}
    />
  );
}
