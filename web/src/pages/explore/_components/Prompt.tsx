import React, { ReactElement, ReactNode, useState } from 'react';
import { useInterval } from 'ahooks';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import BotIcon from '@site/src/pages/explore/_components/BotIcon';
import { styled } from '@mui/material';

export interface PromptsProps {
  source: ReactNode[];
  interval: number;
  prefix?: ReactElement;
  className?: string;
}

export const Prompts = ({ source, interval, prefix = <BotIcon animated={false} />, ...props }: PromptsProps) => {
  const [index, setIndex] = useState(0);

  useInterval(() => {
    setIndex(index => (index + 1) % source.length);
  }, interval);

  return (
    <TransitionGroup component={PromptTitleContainer} {...props}>
      {prefix ?? undefined}
      <CSSTransition key={index} timeout={400} classNames="item">
        <Prompt>
          {source[index]}
        </Prompt>
      </CSSTransition>
    </TransitionGroup>
  );
};

const PromptTitleContainer = styled('span')`
  position: relative;
  display: block;
`;

const Prompt = styled('span')`
  display: inline-block;
  width: max-content;
  padding-left: 8px;
  transition: ${({ theme }) => theme.transitions.create(['opacity', 'transform'], { duration: 400 })};

  &.item-enter {
    opacity: 0;
    transform: translate3d(-10%, 0, 0) scale(0.85);
  }

  &.item-enter-active {
    position: absolute;
    opacity: 1;
    transform: none;
  }

  &.item-exit {
    opacity: 1;
    transform: none;
  }

  &.item-exit-active {
    position: absolute;
    opacity: 0;
    transform: translate3d(10%, 0, 0) scale(0.85);
  }
`;
