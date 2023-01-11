import { keyframes, styled, Theme } from '@mui/material';
import rippleDotClasses, { RippleDotColor } from './rippleDotClasses';
import { SxProps } from '@mui/system';
import React from 'react';
import clsx from 'clsx';

interface RippleDotProps {
  active?: boolean;
  color?: RippleDotColor;
  size?: number;
  sx?: SxProps<Theme>;
}

export default function RippleDot ({ active = true, color = 'info', size = 8 }: RippleDotProps) {
  return (
    <DotRoot
      size={size}
      className={clsx({
        [rippleDotClasses.root]: true,
        [rippleDotClasses.active]: active,
        [rippleDotClasses[color]]: true,
      })}
    />
  );
}

const rippleKeyframes = keyframes`
  0% {
    opacity: 1;
    transform: initial;
  }
  100% {
    opacity: 0;
    transform: scale3d(2, 2, 0);
    transform-origin: center center;
    animation-timing-function: ease-in;
  }
`;

const DotRoot = styled('span', { name: 'RippleDot', shouldForwardProp: name => name !== 'size' })<{ size: number }>`
  display: inline-block;
  position: relative;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  border-radius: 50%;

  &.${rippleDotClasses.error} {
    background-color: ${({ theme }) => theme.palette.error.main};
    &:before {
      background-color: ${({ theme }) => theme.palette.error.main};
    }
  }

  &.${rippleDotClasses.success} {
    background-color: ${({ theme }) => theme.palette.success.main};
    &:before {
      background-color: ${({ theme }) => theme.palette.success.main};
    }
  }

  &.${rippleDotClasses.info} {
    background-color: ${({ theme }) => theme.palette.info.main};
    &:before {
      background-color: ${({ theme }) => theme.palette.info.main};
    }
  }

  &.${rippleDotClasses.warning} {
    background-color: ${({ theme }) => theme.palette.warning.main};
    &:before {
      background-color: ${({ theme }) => theme.palette.warning.main};
    }
  }

  &.${rippleDotClasses.active}:before {
    animation-play-state: running;
  }
  
  &:before {
    display: block;
    position: absolute;
    left: 0;
    top: 0;
    content: ' ';
    width: 100%;
    height: 100%;
    border-radius: 50%;
    animation: ${rippleKeyframes} 1.2s infinite;
    animation-play-state: paused;
  }
`;
