'use client';
import { ScrollspySubscribeFn, useScrollspyContext } from '@/components/Scrollspy/ScrollspyContext';
import { useEffect, useState } from 'react';

export function useScrollspySubscribeCurrentSection (fn: ScrollspySubscribeFn) {
  const spy = useScrollspyContext();

  useEffect(() => {
    spy.subscribe(fn);
    return () => {
      spy.unsubscribe(fn);
    };
  }, [spy, fn]);
}

export function useScrollspyCurrentSection () {
  const spy = useScrollspyContext();
  const [current, setCurrent] = useState(spy.currentSection);

  useEffect(() => {
    spy.subscribe(setCurrent);
    return () => {
      spy.unsubscribe(setCurrent);
    };
  }, [spy]);
  return current;
}
