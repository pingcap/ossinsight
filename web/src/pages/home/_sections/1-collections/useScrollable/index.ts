import { RefCallback, useCallback, useEffect, useState } from 'react';
import { useEventCallback } from '@mui/material';

interface UserScrollableProps {
  direction: 'x' | 'y';
}

type Scrollable = true | 'forward' | 'backward' | false;

interface UserScrollableResult {
  ref: RefCallback<HTMLElement | null>;
  scrollable: Scrollable;
  scroll: (offset: number) => void;
  recompute: () => void;
}

export function useScrollable ({ direction = 'x' }: UserScrollableProps): UserScrollableResult {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [scrollable, setScrollable] = useState<Scrollable>(false);

  const ref = useEventCallback((element: HTMLElement | null) => {
    setElement(element);
  });

  const recompute = useCallback(() => {
    if (!element) {
      setScrollable(false);
      return;
    }
    let size: number, scrollableSize: number, scrollOffset: number;
    if (direction === 'x') {
      size = element.getBoundingClientRect().width;
      scrollableSize = element.scrollWidth;
      scrollOffset = element.scrollLeft;
    } else {
      size = element.getBoundingClientRect().height;
      scrollableSize = element.scrollHeight;
      scrollOffset = element.scrollTop;
    }
    if (scrollableSize === size) {
      setScrollable(false);
    } else if (scrollOffset < 1) {
      setScrollable('forward');
    } else if (Math.abs(scrollOffset + size - scrollableSize) < 1) {
      setScrollable('backward');
    } else {
      setScrollable(true);
    }
  }, [element, direction]);

  useEffect(() => {
    if (!element) {
      return;
    }

    element.addEventListener('scroll', recompute);
    window.addEventListener('resize', recompute);

    recompute();

    return () => {
      element.removeEventListener('scroll', recompute);
      window.removeEventListener('resize', recompute);
    };
  }, [element, direction, recompute]);

  const scroll = useCallback((offset: number = 100) => {
    if (!element) {
      return;
    }
    const { width, height } = element.getBoundingClientRect();
    element.scrollBy({
      [direction === 'x' ? 'left' : 'top']: offset * (direction === 'x' ? width : height),
      behavior: 'smooth',
    });
  }, [element]);

  return { ref, scroll, scrollable, recompute };
}
