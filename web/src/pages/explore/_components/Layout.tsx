import React, { ReactNode, useMemo, useRef } from 'react';
import { styled } from '@mui/material';
import { Transition } from 'react-transition-group';
import { useSize } from 'ahooks';

const sideWidth = 270;
const headerMarginBottom = 32;

export interface LayoutProps {
  showHeader: boolean;
  showSide: boolean;
  header?: ReactNode;
  side?: ReactNode;
  children?: ReactNode;
}

export default function Layout ({ children, header, side, showSide, showHeader }: LayoutProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const sideRef = useRef<HTMLDivElement>(null);

  const size = useSize(headerRef);

  const headerOffsetHeight = useMemo(() => {
    return (size?.height) ?? headerMarginBottom;
  }, [size?.height]);

  return (
    <>
      <Transition nodeRef={headerRef} in={showHeader} timeout={400}>
        {(status) => (
          <Header ref={headerRef} className={`Header-${status}`} height={headerOffsetHeight}>
            {header}
          </Header>
        )}
      </Transition>
      <Container>
        <Transition nodeRef={mainRef} in={showSide} timeout={400}>
          {(status) => (
            <Main ref={mainRef} className={`Main-side-${status}`}>
              {children}
            </Main>
          )}
        </Transition>
        <Transition nodeRef={sideRef} in={showSide} timeout={400}>
          {(status) => (
            <Side ref={sideRef} className={`Side-${status}`}>
              {side}
            </Side>
          )}
        </Transition>
      </Container>
    </>
  );
}

const Container = styled('div', { name: 'Container' })`
  position: relative;
  margin: auto;
  padding-left: ${sideWidth};
  max-width: 100%;

  ${({ theme }) => theme.breakpoints.up('lg')} {
    max-width: ${({ theme }) => theme.breakpoints.values.md + sideWidth}px;
  }

  ${({ theme }) => theme.breakpoints.up('xl')} {
    max-width: ${({ theme }) => theme.breakpoints.values.lg + sideWidth}px;
  }
`;

const Header = styled('div', { name: 'Header', shouldForwardProp: propName => propName !== 'height' })<{ height: number }>`
  opacity: 0;
  margin-top: -${({ height }) => height + headerMarginBottom}px;
  margin-bottom: ${headerMarginBottom}px;

  ${classNames('Header', true)} {
    transition: ${({ theme }) => theme.transitions.create(['margin', 'opacity'])};
  }

  ${classNames('Header', false)} {
    opacity: 1;
    margin-top: 0;
  }
`;

const Main = styled('div', { name: 'Main' })`
  min-height: 800px;
  width: 100%;

  ${({ theme }) => theme.breakpoints.up('md')} {
    transform: translateX(${sideWidth / 2}px);
  }

  ${({ theme }) => theme.breakpoints.up('md')} {
    max-width: calc(100% - ${sideWidth}px);
  }

  ${({ theme }) => theme.breakpoints.up('lg')} {
    max-width: ${({ theme }) => theme.breakpoints.values.md}px;
  }

  ${({ theme }) => theme.breakpoints.up('xl')} {
    max-width: ${({ theme }) => theme.breakpoints.values.lg}px;
  }

  ${classNames('Main-side', true)} {
    transition: ${({ theme }) => theme.transitions.create('transform')};
  }

  ${classNames('Main-side', false)} {
    transform: initial;
  }
`;

const Side = styled('div', { name: 'Side' })`
  position: absolute;
  right: 0;
  top: 0;
  width: ${sideWidth}px;
  opacity: 0;
  transform: translateX(${sideWidth / 2}px);

  ${({ theme }) => theme.breakpoints.down('md')} {
    display: none;
  }

  ${classNames('Side', true)} {
    transition: ${({ theme }) => theme.transitions.create(['transform', 'opacity'])};
  }

  ${classNames('Side', false)} {
    transform: initial;
    opacity: 1;
  }
`;

function classNames (prefix: string, enter: boolean) {
  if (enter) {
    return `&.${prefix}-entering, &.${prefix}-exiting`;
  } else {
    return `&.${prefix}-entered, &.${prefix}-entering`;
  }
}
