import React, { FC } from 'react';
import { useInView } from 'react-intersection-observer';
import useVisibility from '../../hooks/visibility';
import InViewContext from '../InViewContext';

interface InViewContainerProps {
  children: JSX.Element | ((show: boolean) => JSX.Element);
}

export default function InViewContainer ({ children }: InViewContainerProps) {
  const visible = useVisibility();
  const { inView, ref } = useInView({ fallbackInView: true });

  const show = visible && inView;

  let el: JSX.Element;
  if (typeof children === 'function') {
    el = children(show);
  } else {
    el = (
      <InViewContext.Provider value={{ inView: show }}>
        {children}
      </InViewContext.Provider>
    );
  }

  return (
    <div ref={ref}>
      {el}
    </div>
  );
}

export function withInViewContainer<P extends JSX.IntrinsicAttributes> (Component: FC<P>): FC<P> {
  const comp: FC<P> = (props: P) => (
    <InViewContainer>
      <Component {...props} />
    </InViewContainer>
  );
  comp.displayName = 'InViewContainerHOC';
  return comp;
}
