import React, { ReactElement, useEffect, useRef, useState } from 'react';
import { Transition } from 'react-transition-group';
import { styled, useEventCallback } from '@mui/material';
import { isNullish, notNullish } from '@site/src/utils/value';

interface SwitchLayoutProps {
  state: string;
  transitionDuration?: number;
  transitionDelay?: number;
  offset?: number;
  direction?: 'up' | 'down';
  revert?: boolean;
  children: [ReactElement, ReactElement];
}

function getHeight (el: HTMLElement) {
  const { marginTop, marginBottom } = getComputedStyle(el);
  return el.offsetHeight + parseFloat(marginTop) + parseFloat(marginBottom);
}

export default function SwitchLayout ({ state, transitionDelay = 0, transitionDuration = 400, offset = 120, direction = 'up', revert = false, children }: SwitchLayoutProps) {
  const firstRef = useRef<HTMLDivElement>(null);
  const secondRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>();

  useEffect(() => {
    if (children.length !== 2) {
      throw new Error('SwitchLayout should have exactly two children');
    }
    if (isNullish(children[0].key) || isNullish(children[1].key)) {
      throw new Error('SwitchLayout\'s children must have keys');
    }
  }, []);

  const handleFirstExit = useEventCallback(() => {
    if (notNullish(firstRef.current)) {
      setHeight(getHeight(firstRef.current));
    }
  });

  const handleFirstExiting = useEventCallback(() => {
    if (notNullish(secondRef.current)) {
      setHeight(getHeight(secondRef.current));
    }
  });

  const handleFirstExited = useEventCallback(() => {
    setHeight(undefined);
  });

  const handleSecondExit = useEventCallback(() => {
    if (notNullish(secondRef.current)) {
      setHeight(getHeight(secondRef.current));
    }
  });

  const handleSecondExiting = useEventCallback(() => {
    if (notNullish(firstRef.current)) {
      setHeight(getHeight(firstRef.current));
    }
  });

  const handleSecondExited = useEventCallback(() => {
    setHeight(undefined);
  });

  const timeout = transitionDelay + transitionDuration;

  return (
    <SwitchLayoutContainer offset={offset} style={{ height }} duration={transitionDuration} delay={transitionDelay}>
      <Transition key={children[0].key} in={state === children[0].key} timeout={timeout} unmountOnExit onExit={handleFirstExit} onExiting={handleFirstExiting} onExited={handleFirstExited}>
        {(status) => (
          <SwitchItem
            ref={firstRef}
            className={`SwitchItem-${direction} SwitchItem-${status}`}
            duration={transitionDuration}
            delay={transitionDelay}
            offset={offset}
          >
            {children[0]}
          </SwitchItem>
        )}
      </Transition>
      <Transition key={children[1].key} in={state === children[1].key} timeout={timeout} unmountOnExit onExit={handleSecondExit} onExiting={handleSecondExiting} onExited={handleSecondExited}>
        {(status) => (
          <SwitchItem
            ref={secondRef}
            className={`SwitchItem-${revert ? direction === 'up' ? 'down' : 'up' : direction} SwitchItem-${status}`}
            duration={transitionDuration}
            delay={transitionDelay}
            offset={offset}
          >
            {children[1]}
          </SwitchItem>
        )}
      </Transition>
    </SwitchLayoutContainer>
  );
}

interface SwitchLayoutContainerProps {
  duration: number;
  delay: number;
  offset: number;
}

const SwitchLayoutContainer = styled('div', { name: 'SwitchLayoutContainer', shouldForwardProp: propName => !['duration', 'delay', 'offset'].includes(String(propName)) })<SwitchLayoutContainerProps>`
  position: relative;
  transition: ${({ theme, duration, delay }) => theme.transitions.create('height', { duration, delay })};
`;

const SwitchItem = styled('div', { name: 'SwitchItem', shouldForwardProp: propName => !['offset', 'duration', 'delay'].includes(String(propName)) })<SwitchLayoutContainerProps>`
  transition: ${({ theme, duration, delay }) => theme.transitions.create(['opacity', 'transform'], { duration, delay })};
  opacity: 0;
  padding: 0.1px;

  &.SwitchItem-exiting, &.SwitchItem-entering {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
  }

  &.SwitchItem-enter, &.SwitchItem-exiting, &.SwitchItem-exited {
    opacity: 0;
  }

  &.SwitchItem-up {
    &.SwitchItem-enter {
      transform: translate3d(0, ${({ offset }) => offset}px, 0);
    }

    &.SwitchItem-exiting, &.SwitchItem-exited {
      transform: translate3d(0, -${({ offset }) => offset}px, 0);
    }
  }

  &.SwitchItem-down {
    &.SwitchItem-enter {
      transform: translate3d(0, -${({ offset }) => offset}px, 0);
    }

    &.SwitchItem-exiting, &.SwitchItem-exited {
      transform: translate3d(0, ${({ offset }) => offset}px, 0);
    }
  }

  &.SwitchItem-exit, &.SwitchItem-entering, &.SwitchItem-entered {
    opacity: 1;
    transform: initial;
  }
`;
