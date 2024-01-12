import React, { cloneElement, forwardRef, MutableRefObject, ReactElement, Ref, RefAttributes, RefCallback, useCallback, useEffect, useMemo, useRef } from 'react';
import { isNullish } from '@site/src/utils/value';

export interface ScrollSpyProps {
  offset?: number;
  scrollTarget?: Element | Window;
  onVisibleElementChange?: (index: number, element: HTMLElement) => void;
  children: Array<ReactElement & RefAttributes<HTMLElement>>;
}

export interface ScrollSpyInstance {
  scrollTo: (index: number, behavior?: ScrollBehavior) => void;
}

export default forwardRef<ScrollSpyInstance, ScrollSpyProps>(function ScrollSpy ({ offset = 40, scrollTarget, onVisibleElementChange, children }, ref) {
  const refs = useRef<Array<HTMLElement | null>>([]);
  const io = useRef<IntersectionObserver>();
  const instance: ScrollSpyInstance = useMemo(() => {
    return {
      scrollTo (index: number, behavior?: ScrollBehavior) {
        const el = refs.current[index];
        const target = scrollTarget ?? window;
        if (el) {
          const top = getElOffsetTop(el, target);
          target.scrollTo({
            top: top - offset + 10,
            behavior,
          });
          if (behavior !== 'smooth') {
            setTimeout(() => {
              update.current?.();
            }, 10);
          }
        }
      },
    };
  }, [scrollTarget, offset]);
  const update = useRef<() => void>();

  applyRef(ref, instance);

  useEffect(() => {
    refs.current = refs.current.slice(0, children.length);
  }, [children.length]);

  useEffect(() => {
    let listened = false;
    const visibleSet = new Set<HTMLElement>();
    const observer = io.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          visibleSet.add(entry.target as any);
        } else {
          visibleSet.delete(entry.target as any);
        }
      });

      if (listened) {
        if (visibleSet.size === 0) {
          target.removeEventListener('scroll', handleScroll);
          listened = false;
        }
      } else {
        if (visibleSet.size > 0) {
          target.addEventListener('scroll', handleScroll, { passive: true });
          listened = true;
        }
      }
    });

    const target = scrollTarget ?? window;

    const handleScroll = () => {
      let negMax = Number.MIN_VALUE;
      let posMin = Number.MAX_VALUE;
      let negEl: HTMLElement | undefined;
      let posEl: HTMLElement | undefined;

      for (const el of visibleSet.values()) {
        if (isNullish(el)) {
          continue;
        }
        // get el scroll top
        const top = getElOffsetTop(el, target);

        // check el is the appreciated el
        const res = top - window.scrollY - offset + el.offsetHeight;
        if (res < 0) {
          if (res > negMax) {
            negMax = res;
            negEl = el;
          }
        } else {
          if (res < posMin) {
            posMin = res;
            posEl = el;
          }
        }
      }

      const resEl = posEl ?? negEl;
      if (resEl) {
        const index = mapRef(resEl);
        if (typeof index === 'number') {
          onVisibleElementChange?.(index, resEl);
        }
      }
    };

    update.current = handleScroll;

    refs.current.forEach(el => {
      if (el) {
        observer.observe(el);
      }
    });

    return () => {
      update.current = undefined;
      io.current?.disconnect();
      target.removeEventListener('scroll', handleScroll);
    };
  }, [scrollTarget]);

  const mapRef = useMemo(() => {
    const map = new WeakMap<HTMLElement, number>();

    function mapRef (el: HTMLElement, index: number | null): void;
    function mapRef (el: HTMLElement): number | undefined;
    function mapRef (el: HTMLElement, index?: number | null) {
      if (typeof index === 'number') {
        map.set(el, index);
      } else if (index === null) {
        map.delete(el);
      } else {
        return map.get(el);
      }
    }

    return mapRef;
  }, []);

  const makeRef = useCallback((i: number) => {
    return (el: HTMLElement | null) => {
      const currentEl = refs.current[i];
      refs.current[i] = el;
      const observer = io.current;
      if (el) {
        mapRef(el, i);
      }
      if (!observer) {
        return;
      }
      if (currentEl) {
        observer.unobserve(currentEl);
      }
      if (el) {
        observer.observe(el);
      }
    };
  }, []);

  const referencedChildren = useMemo(() => {
    return children.map((child, i) => {
      return cloneElement(child, {
        ref: mergeRef(makeRef(i), child.ref),
      });
    });
  }, [children]);

  return <>{referencedChildren}</>;
});

type MutableRef<T> = RefCallback<T> | MutableRefObject<T> | null;

function mergeRef<T> (ref: MutableRef<T>, ref2: MutableRef<T> | undefined): Ref<T> {
  return (target) => {
    applyRef(ref, target);
    applyRef(ref2, target);
  };
}

function applyRef<T> (ref: MutableRef<T> | undefined, value: T) {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}

function getElOffsetTop (el: HTMLElement, scrollTarget: Element | Window) {
  let top = 0;
  let p = el;
  while (p !== scrollTarget) {
    top += p.offsetTop;
    p = p.offsetParent as any;
    if (isNullish(p)) {
      break;
    }
  }
  return top;
}
