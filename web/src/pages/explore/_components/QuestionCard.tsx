import React from 'react';
import { ButtonBase, styled, useEventCallback } from '@mui/material';

export type QuestionCardVariant = 'recommended-card' | 'card' | 'text';

export interface QuestionCardProps {
  disabled?: boolean;
  variant?: QuestionCardVariant;
  question: string;
  onClick?: (question: string) => void;
}

export default function QuestionCard ({ question, onClick, variant = 'card', disabled }: QuestionCardProps) {
  const handleClick = useEventCallback(() => {
    onClick?.(question);
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
  font-size: 16px;
  line-height: 1.5;
`;

const Marker = styled('span')`
  position: absolute;
  right: 5px;
  bottom: 5px;
  font-size: 12px;
`;
