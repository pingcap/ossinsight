import { keyframes, styled } from '@mui/material';
import React from 'react';

export default function BotIcon () {
  return (
    <Img size={16} />
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
  animation: ${animation} 0.8s infinite;
`;
