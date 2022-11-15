import React, { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMap } from 'ahooks';
import { findPos } from './dom-utils';

export interface ScrollSpyProps<K extends string | number = string | number> {
  offset: number;
  children: (ctx: ScrollSpyContext<K>) => ReactNode;
}

export type ScrollSpyContext<K extends string | number = string | number> = {
  ref: (el: HTMLElement | null, key: K) => void;
  scrollTo: (key: K, behavior?: ScrollBehavior) => void;
  active: K | undefined;
  keys: K[];
};

export default function ScrollSpy<K extends string | number = string | number> ({ offset, children }: ScrollSpyProps<K>) {
  const [elMap, { get: elMapGet, set: elMapSet, remove: elMapDelete }] = useMap<K, HTMLElement>();
  const [, { get: keyMapGet, set: keyMapSet, remove: keyMapDelete }] = useMap<Element, K>();
  const observerRef = useRef<IntersectionObserver>();
  const [active, setActive] = useState<K>();

  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries) => {
      // filter out all intersections and sort from top to bottom
      const intersections = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => a.intersectionRect.top - b.intersectionRect.top);

      // get first matches offset or the top element
      const top = intersections.find(entry => entry.intersectionRect.top + offset > -1) ?? intersections.sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      setActive(keyMapGet(top?.target));
    });
  }, []);

  const ref: ScrollSpyContext<K>['ref'] = useCallback((el, key) => {
    if (el) {
      elMapSet(key, el);
      keyMapSet(el, key);
      observerRef.current?.observe(el);
    } else {
      const el = elMapGet(key);
      elMapDelete(key);
      if (el) {
        keyMapDelete(el);
        observerRef.current?.unobserve(el);
      }
    }
  }, []);

  const scrollTo: ScrollSpyContext<K>['scrollTo'] = useCallback((key, behavior = 'smooth') => {
    const el = elMapGet(key);
    if (el) {
      window.scrollTo({ top: findPos(el) + offset, behavior });
    }
  }, []);

  const keys = useMemo(() => {
    return Array.from(elMap.keys()).sort((a, b) => Number(b) - Number(a));
  }, [[...elMap.keys()].join('|')]);

  return useMemo(() => {
    return <>{children({ ref, active, scrollTo, keys })}</>;
  }, [keys, active]);
}
