import { keyframes, styled } from '@mui/material';
import React from 'react';
import { SxProps } from '@mui/system';

interface BotIconProps {
  animated?: boolean;
  sx?: SxProps;
}

export default function BotIcon ({ animated = true, sx }: BotIconProps) {
  return (
    <Img className={animated ? 'animated' : ''} size={16} sx={sx} />
  );
}

const animation = keyframes`
  0% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(0, -6px, 0);
    animation-timing-function: ease-in;
  }
  100% {
    transform: translate3d(0, 0, 0);
    animation-timing-function: ease-out;
  }
`;

const Img = styled('span')<{ size?: number }>`
  width: ${({ size }) => size ?? 24}px;
  height: ${({ size }) => size ?? 24}px;
  display: inline-block;
  background: url("/img/bot.png") no-repeat center center;
  background-size: contain;

  &.animated {
    animation: ${animation} 0.8s infinite;
  }
`;
