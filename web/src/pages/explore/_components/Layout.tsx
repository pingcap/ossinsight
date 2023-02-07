import React, { ReactNode, useMemo, useRef } from 'react';
import { Container as MuiContainer, NoSsr, styled } from '@mui/material';
import { Transition } from 'react-transition-group';
import { useSize } from 'ahooks';
import { reactNodeOrFunction } from '@site/src/utils/react';

const sideWidth = 250;
const headerMarginBottom = 32;
const transitionDuration = 400;

export interface LayoutProps {
  showHeader: boolean;
  showSide: boolean;
  header?: ReactNode;
  side?: ReactNode | ((headerHeight: number) => ReactNode);
  children?: ReactNode;
}

export default function Layout ({ children, header, side, showSide, showHeader }: LayoutProps) {
  const headerRef = useRef<HTMLDivElement>(null);

  const size = useSize(headerRef);

  const headerOffsetHeight = useMemo(() => {
    return (size?.height) ?? 0;
  }, [size?.height]);

  return (
    <Root maxWidth="xl">
      <Transition in={showHeader} timeout={transitionDuration}>
        {(status) => (
          <>
            <Header ref={headerRef} className={`Header-${status}`} height={headerOffsetHeight}>
              {header}
            </Header>
            <Body className={`Body-header-${status}`} headerHeight={headerOffsetHeight}>
              {
                // TODO: If remove <NoSsr>, SSG page style would crash.
                // While `in` props is true, but the transition state would not change.
              }
              <NoSsr>
                <Transition in={showSide} timeout={transitionDuration}>
                  {(status) => (
                    <Main className={`Main-side-${status}`}>
                      {children}
                    </Main>
                  )}
                </Transition>
              </NoSsr>
              <Transition in={showSide} timeout={transitionDuration} unmountOnExit>
                {(status) => (
                  <Side className={`Side-${status}`}>
                    {reactNodeOrFunction(side, size?.height ?? 0)}
                  </Side>
                )}
              </Transition>
            </Body>
          </>
        )}
      </Transition>
    </Root>
  );
}

const Root = styled(MuiContainer, { name: 'Layout-Root' })`
  padding-top: 64px;

  ${({ theme }) => theme.breakpoints.down('md')} {
    padding-top: 16px;
  }

  min-height: 600px;
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const Body = styled('div', { name: 'Layout-Body', shouldForwardProp: propName => propName !== 'headerHeight' })<{ headerHeight: number }>`
  --explore-layout-side-width: ${sideWidth}px;

  ${({ theme }) => theme.breakpoints.up('lg')} {
    --explore-layout-side-width: ${sideWidth + 25}px;
  }

  ${({ theme }) => theme.breakpoints.up('xl')} {
    --explore-layout-side-width: ${sideWidth + 50}px;
  }

  ${({ theme }) => theme.breakpoints.up('md')} {
    padding-right: var(--explore-layout-side-width);
  }

  position: relative;
  margin: 0 auto;
  width: 100%;

  ${({ theme }) => theme.breakpoints.up('xl')} {
    max-width: ${({ theme }) => `calc(${theme.breakpoints.values.lg}px + var(--explore-layout-side-width))`};
  }

  transform: translate3d(0, -${({ headerHeight }) => headerHeight + headerMarginBottom + 40}px, 0);
  transition: ${({ theme }) => theme.transitions.create('transform', { duration: transitionDuration })};

  ${({ theme }) => theme.breakpoints.down('md')} {
    transform: translate3d(0, -${({ headerHeight }) => headerHeight + headerMarginBottom - 8}px, 0);
  }

  ${classNames('Body-header', true)} {
    opacity: 1;
    transform: initial;
  }
`;

const Header = styled('div', { name: 'Layout-Header', shouldForwardProp: propName => propName !== 'height' })<{ height: number }>`
  opacity: 0.1;
  transform: translate3d(0, -${({ height }) => height + headerMarginBottom + 40}px, 0);
  margin-bottom: ${headerMarginBottom}px;
  transition: ${({ theme }) => theme.transitions.create(['transform', 'opacity'], { duration: transitionDuration })};

  ${({ theme }) => theme.breakpoints.down('md')} {
    transform: translate3d(0, -${({ height }) => height + headerMarginBottom}px, 0);
  }

  ${classNames('Header', true)} {
    opacity: 1;
    transform: initial;
  }
`;

const Main = styled('div', { name: 'Layout-Main' })`
  width: 100%;
  transition: ${({ theme }) => theme.transitions.create(['transform', 'opacity'], { duration: transitionDuration })};

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

const Side = styled('div', { name: 'Layout-Side' })`
  position: absolute;
  right: 0;
  top: 0;
  width: var(--explore-layout-side-width);
  height: 100%;
  opacity: 0;
  transform: translateX(calc(var(--explore-layout-side-width) / 2));
  transition: ${({ theme }) => theme.transitions.create(['transform', 'opacity'], { duration: transitionDuration })};
  padding: 0 24px;
  box-sizing: border-box;

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
