import { cloneElement, ReactElement, useEffect } from 'react';
import useTransition, { TransitionStatus } from 'react-transition-state';
import { twJoin, twMerge } from 'tailwind-merge';

export interface TransitionProps extends Partial<Record<TransitionStatus, string>> {
  show?: boolean;
  className?: string;
  timeout?: number | { enter?: number; exit?: number };
  children: ReactElement<{ className?: string }>;
}

export function Transition ({ children, show, timeout, className, ...props }: TransitionProps) {
  const [state, setState, toggle] = useTransition({
    preEnter: !!props.preEnter,
    preExit: !!props.preExit,
    mountOnEnter: true,
    unmountOnExit: true,
    initialEntered: show,
    timeout,
  });

  useEffect(() => {
    setState(show);
  }, [show]);

  if (state.status === 'unmounted') {
    return null;
  }

  return cloneElement(children, {
    className: twMerge(children.props.className, className, props[state.status]),
  });
}
