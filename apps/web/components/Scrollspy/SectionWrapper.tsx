'use client';

import { HTMLAttributes, useEffect, useRef } from 'react';
import { useScrollspyContext } from './ScrollspyContext';

export function ScrollspySectionWrapper ({ anchor, children, ...props }: HTMLAttributes<HTMLDivElement> & { anchor?: string }) {
  const spy = useScrollspyContext();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (anchor != null && ref.current) {
      spy.register(anchor, ref.current);
      return () => {
        spy.unregister(anchor);
      };
    }
  }, [anchor, spy]);

  return (
    <section ref={ref} {...props}>
      {children}
    </section>
  );
}
