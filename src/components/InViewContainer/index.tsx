import React, { ComponentType, FC, PropsWithChildren } from 'react';
import { useInView } from 'react-intersection-observer';
import InViewContext from '../InViewContext';

export default function InViewContainer ({children}: PropsWithChildren<any>) {
  const { inView, ref } = useInView({ fallbackInView: true })

  return (
    <div ref={ref}>
      <InViewContext.Provider value={{ inView }}>
        {children}
      </InViewContext.Provider>
    </div>
  )
}

export function withInViewContainer<P>(Component: FC<P>): FC<P> {
  return (props: P) => (
    <InViewContainer>
      <Component {...props} />
    </InViewContainer>
  )
}
