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
        <Transition nodeRef={sideRef} in={showSide} timeout={400} unmountOnExit>
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
  --explore-layout-side-width: ${sideWidth}px;

  ${({ theme }) => theme.breakpoints.up('lg')} {
    --explore-layout-side-width: ${sideWidth + 100}px;
  }

  ${({ theme }) => theme.breakpoints.up('xl')} {
    --explore-layout-side-width: ${sideWidth + 200}px;
  }

  ${({ theme }) => theme.breakpoints.up('md')} {
    padding-right: var(--explore-layout-side-width);
  }
  
  position: relative;
  margin: auto;
  max-width: 100%;

  ${({ theme }) => theme.breakpoints.up('xl')} {
    max-width: ${({ theme }) => `calc(${theme.breakpoints.values.lg}px + var(--explore-layout-side-width))`};
  }
`;

const Header = styled('div', { name: 'Header', shouldForwardProp: propName => propName !== 'height' })<{ height: number }>`
  opacity: 0;
  margin-top: -${({ height }) => height + headerMarginBottom}px;
  margin-bottom: ${headerMarginBottom}px;
  transition: ${({ theme }) => theme.transitions.create(['margin', 'opacity'])};

  ${classNames('Header', true)} {
    opacity: 1;
    margin-top: 0;
  }
`;

const Main = styled('div', { name: 'Main' })`
  min-height: 800px;
  width: 100%;
  transition: ${({ theme }) => theme.transitions.create('transform')};

  ${({ theme }) => theme.breakpoints.up('md')} {
    transform: translateX(calc(var(--explore-layout-side-width) / 2));
  }

  ${({ theme }) => theme.breakpoints.up('md')} {
    max-width: calc(100%);
  }

  ${({ theme }) => theme.breakpoints.up('xl')} {
    max-width: ${({ theme }) => theme.breakpoints.values.lg}px;
  }

  ${classNames('Main-side', true)} {
    transform: initial;
  }
`;

const Side = styled('div', { name: 'Side' })`
  position: absolute;
  right: 0;
  top: 0;
  width: var(--explore-layout-side-width);
  opacity: 0;
  transform: translateX(calc(var(--explore-layout-side-width) / 2));
  transition: ${({ theme }) => theme.transitions.create(['transform', 'opacity'])};

  ${classNames('Side', true)} {
    display: block;
    transform: initial;
    opacity: 1;
  }

  ${({ theme }) => theme.breakpoints.down('md')} {
    display: none !important;
  }
`;

function classNames (prefix: string, enter: boolean) {
  if (enter) {
    return `&.${prefix}-entering, &.${prefix}-entered`;
  } else {
    return `&.${prefix}-exiting, &.${prefix}-exited`;
  }
}
