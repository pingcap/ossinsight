'use client';

import { CSSProperties, MouseEvent, ReactNode, useCallback } from 'react';

export interface ScrollAnchorProps extends ScrollIntoViewOptions {
  id: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  top?: number;
}

export function ScrollAnchor ({ id, className, style, behavior = 'smooth', inline, block, top, children }: ScrollAnchorProps) {
  const onClick = useCallback((ev: MouseEvent) => {
    const el = document.getElementById(id);
    if (el) {
      const last = el.style.scrollMarginTop;
      if (top) {
        el.style.scrollMarginTop = top + 'px';
      }
      el.scrollIntoView({ behavior, inline, block });
      if (top) {
        el.style.scrollMarginTop = last;
      }
      ev.preventDefault();
    }
  }, [id]);

  return (
    <a className={className} style={style} href={`#${encodeURIComponent(id)}`} onClick={onClick}>
      {children}
    </a>
  );
}