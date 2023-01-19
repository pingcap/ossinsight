import React, { ReactNode, useContext } from 'react';
import { alpha, ButtonBase, styled, useEventCallback } from '@mui/material';
import { ExploreContext } from '@site/src/pages/explore/_components/context';
import { HighlightBackground, HighlightContent } from '@site/src/pages/explore/_components/highlighted';
import { isNonemptyString } from '@site/src/utils/value';
import { QuestionTag } from '@site/src/api/explorer';

export type QuestionCardVariant = 'recommended-card' | 'card' | 'text';

export interface QuestionCardProps {
  disabled?: boolean;
  variant?: QuestionCardVariant;
  question: ReactNode;
  questionId?: string | null;
  prefix?: ReactNode;
  tags?: QuestionTag[];
  imageUrl?: string;
}

export default function QuestionCard ({ question, questionId, variant = 'card', imageUrl, prefix, tags, disabled }: QuestionCardProps) {
  const { handleSelect, handleSelectId } = useContext(ExploreContext);

  const handleClick = useEventCallback(() => {
    if (isNonemptyString(questionId)) {
      handleSelectId(questionId);
    } else if (typeof question === 'string') {
      handleSelect(question);
    }
  });

  switch (variant) {
    case 'recommended-card':
      return (
        <HighlightBackground>
          <HighlightContent onClick={handleClick} disabled={disabled}>
            {question}
          </HighlightContent>
          <Marker>✨</Marker>
        </HighlightBackground>
      );
    case 'card':
      return (
        <HighlightContent onClick={handleClick} disabled={disabled}>
          {question}
          {tags?.map(tag => (
            <Tag key={tag.id} color={tag.color}>{tag.label}</Tag>
          ))}
          {imageUrl && (
            <Image src={imageUrl} alt='preview image' />
          )}
        </HighlightContent>
      );
    default:
      return (
        <Link disableRipple disableTouchRipple onClick={handleClick} disabled={disabled}>
          {prefix}
          {question}
          {tags?.map(tag => (
            <Tag key={tag.id} color={tag.color}>{tag.label}</Tag>
          ))}
        </Link>
      );
  }
}

const Link = styled(ButtonBase, { name: 'QuestionCard-Link' })`
  display: block;
  width: 100%;
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

const Tag = styled('span', { shouldForwardProp: propName => propName !== 'color' })<{ color: string }>`
  display: inline-block;
  color: ${({ color }) => color};
  background-color: ${({ color }) => alpha(color, 0.1)};
  border: 1px solid ${({ color }) => alpha(color, 0.3)};
  margin-left: 8px;
  padding: 4px 8px;
  border-radius: 24px;
  font-size: 12px;
  line-height: 1;
`;

const Image = styled('img')`
  width: 100%;
  margin-top: 12px;
`;
