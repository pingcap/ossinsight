import { RefCallback, useCallback, useEffect, useState } from "react";
import { useEventCallback } from "@mui/material";

interface UserScrollableProps {
  direction: 'x' | 'y';
}

type Scrollable = true | 'forward' | 'backward' | false

interface UserScrollableResult {
  ref: RefCallback<HTMLElement | null>;
  scrollable: Scrollable;
  scroll: (offset: number) => void;
}

export function useScrollable({ direction = 'x' }: UserScrollableProps): UserScrollableResult {
  const [element, setElement] = useState<HTMLElement>(null);
  const [scrollable, setScrollable] = useState<Scrollable>(false);

  const ref = useEventCallback((element: HTMLElement | null) => {
    setElement(element);
  });

  useEffect(() => {
    if (!element) {
      return
    }
    const handleScroll = () => {
      let size: number, scrollableSize: number, scrollOffset: number
      if (direction === 'x') {
        size = element.getBoundingClientRect().width
        scrollableSize = element.scrollWidth
        scrollOffset = element.scrollLeft
      } else {
        size = element.getBoundingClientRect().height
        scrollableSize = element.scrollHeight
        scrollOffset = element.scrollTop
      }
      if (scrollableSize === size) {
        setScrollable(false)
      } else if (scrollOffset === 0) {
        setScrollable('forward')
      } else if (scrollOffset + size === scrollableSize) {
        setScrollable('backward')
      } else {
        setScrollable(true)
      }
    }

    element.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleScroll)

    handleScroll()

    return () => {
      element.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [element, direction]);

  const scroll = useCallback((offset: number = 100) => {
    const { width, height } = element.getBoundingClientRect()
    element.scrollBy({
      [direction === 'x' ? 'left' : 'top']: offset * (direction === 'x' ? width : height),
      behavior: 'smooth',
    })
  }, [element])

  return { ref, scroll, scrollable };
}
