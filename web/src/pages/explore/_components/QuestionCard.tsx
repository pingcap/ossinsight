import React, { HTMLAttributes, ReactNode, useContext } from 'react';
import { ButtonBase, styled, useEventCallback } from '@mui/material';
import { Cached } from '@mui/icons-material';
import { SuggestionsContext } from '@site/src/pages/explore/_components/context';

export type QuestionCardVariant = 'recommended-card' | 'card' | 'text';

export interface QuestionCardProps {
  disabled?: boolean;
  variant?: QuestionCardVariant;
  question: ReactNode;
}

export default function QuestionCard ({ question, variant = 'card', disabled }: QuestionCardProps) {
  const { handleSelect } = useContext(SuggestionsContext);

  const handleClick = useEventCallback(() => {
    if (typeof question === 'string') {
      handleSelect(question);
    }
  });

  switch (variant) {
    case 'recommended-card':
      return (
        <HighlightBackground>
          <Content onClick={handleClick} disabled={disabled}>
            {question}
          </Content>
          <Marker>✨</Marker>
        </HighlightBackground>
      );
    case 'card':
      return (
        <Content onClick={handleClick} disabled={disabled}>
          {question}
        </Content>
      );
    default:
      return <Link disableRipple disableTouchRipple onClick={handleClick} disabled={disabled}>{question}</Link>;
  }
}

export function HighlightCard (props: Exclude<HTMLAttributes<HTMLDivElement>, 'children'>) {
  return (
    <HighlightBackground {...props} sx={{ borderRadius: '17px', maxWidth: 'max-content', mt: 2 }}>
      <Content sx={{ display: 'flex', p: 1, borderRadius: '16px', maxWidth: 'max-content', alignItems: 'center' }}>
        🤖️ Stuck for ideas? Let AI generate 3 questions for you.
        <Cached fontSize="inherit" sx={{ ml: 1 }} />
      </Content>
    </HighlightBackground>
  );
}

const HighlightBackground = styled('div', { name: 'QuestionCard-HighlightBackground' })`
  position: relative;
  background: linear-gradient(116.45deg, #595FEC 0%, rgba(200, 182, 252, 0.2) 96.73%);
  padding: 1px;
  border-radius: 7px;
  width: 100%;
`;

const Content = styled(ButtonBase, { name: 'QuestionCard-Content' })`
  display: block;
  font-size: 14px;
  line-height: 1.25;
  background-color: rgba(44, 44, 44, 0.8);
  border-radius: 6px;
  transition: ${({ theme }) => theme.transitions.create('background-color')};
  padding: 18px;
  text-align: left;
  width: 100%;
  height: 100%;
  vertical-align: top;

  &:hover {
    background-color: rgba(44, 44, 44, 0.5);
  }
`;

const Link = styled(ButtonBase, { name: 'QuestionCard-Link' })`
  display: block;
  text-align: left;
  padding: 8px 0;
  font-size: 14px;
  line-height: 1.5;
  color: #c1c1c1;
  transition: ${({ theme }) => theme.transitions.create('color')};

  &:hover {
    color: white;
  }
`;

const Marker = styled('span')`
  position: absolute;
  right: 5px;
  bottom: 5px;
  font-size: 12px;
`;
