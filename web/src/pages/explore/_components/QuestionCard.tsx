import React, { isValidElement, ReactNode, useContext } from 'react';
import { alpha, ButtonBase, styled, useEventCallback } from '@mui/material';
import { ExploreContext } from '@site/src/pages/explore/_components/context';
import { HighlightBackground, HighlightContent } from '@site/src/pages/explore/_components/highlighted';
import { isNonemptyString } from '@site/src/utils/value';
import { QuestionTag } from '@site/src/api/explorer';
import { useGtag } from '@site/src/utils/ga';

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
  const { gtagEvent } = useGtag();
  const { handleSelect, handleSelectId } = useContext(ExploreContext);

  const handleClick = useEventCallback(() => {
    gtagEvent('click_template_question', {
      questionId: questionId ?? '',
      questionTitle: reactNodeToString(question),
    });
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
            <Image src={imageUrl} alt="preview image" />
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

const reactNodeToString = function (reactNode: React.ReactNode): string {
  if (reactNode == null) {
    return '';
  }
  let string = '';
  if (typeof reactNode === 'string') {
    string = reactNode;
  } else if (typeof reactNode === 'number') {
    string = reactNode.toString();
  } else if (typeof reactNode === 'object' && isIterable(reactNode)) {
    for (const child of reactNode) {
      string += reactNodeToString(child);
    }
  } else if (isValidElement(reactNode)) {
    string += reactNodeToString(reactNode.props.children);
  }
  return string;
};

function isIterable (value: object): value is Iterable<any> {
  return Symbol.iterator in value;
}
