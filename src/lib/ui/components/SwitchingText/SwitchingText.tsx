'use client';

import { ReactElement, useEffect, useState } from 'react';
import { useLatestRef } from '../../hooks/useLatestRef';
import { Transition } from '../Transition';
import './style.scss';

export interface SwitchingTextProps {
  children: ReactElement[];
}

export function SwitchingText ({ children }: SwitchingTextProps) {
  const [currentIndex, setIndex] = useState(-1);
  const latestChildrenLength = useLatestRef(children.length);

  useEffect(() => {
    setIndex(0);
    const interval = setInterval(() => {
      setIndex(index => (index + 1) % latestChildrenLength.current);
    }, 2000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    setIndex(index => Math.min(index, children.length - 1));
  }, [children.length]);

  return (
    <>
      <span className="inline-flex w-[4em] h-[1em] items-center justify-center align-bottom relative">
        {children.map((child, index) => (
          <Transition
            key={index}
            show={currentIndex === index}
            timeout={200}
            className="absolute bottom-0 transition translate-y-0 opacity-100"
            entering="-translate-y-2 opacity-0"
            entered="translate-y-0 opacity-100"
            exiting="translate-y-2 opacity-0"
          >
            {child}
          </Transition>
        ))}
      </span>
      <span className="sr-only">
        {children}
      </span>
    </>
  );
}