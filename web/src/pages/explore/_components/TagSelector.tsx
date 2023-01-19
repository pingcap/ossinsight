import useSWR from 'swr';
import { getTags, QuestionTag } from '@site/src/api/explorer';
import { alpha, darken, Divider, generateUtilityClasses, Stack, styled } from '@mui/material';
import React, { MouseEvent } from 'react';
import clsx from 'clsx';

interface TagSelectorProps {
  value: QuestionTag | null;
  onChange?: (ev: MouseEvent<HTMLSpanElement>, tag: QuestionTag | null) => void;
}

export default function TagSelector ({ onChange, value }: TagSelectorProps) {
  const { data: tags = [] } = useSWR('explore-tags', {
    fetcher: getTags,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return (
    <TagsContainer>
      <Stack direction="row" spacing={1} flexWrap="nowrap" width='max-content'>
        <TagItem
          color="#ccc"
          className={clsx({
            [tagClasses.active]: value == null,
          })}
          onClick={(event) => {
            onChange?.(event, null);
          }}
        >
          All
        </TagItem>
        <Divider orientation="vertical" flexItem />
        {tags.map((tag) => (
          <TagItem
            key={tag.id}
            color={tag.color}
            className={clsx({
              [tagClasses.active]: tag.id === value?.id,
            })}
            onClick={(event) => {
              onChange?.(event, tag);
            }}
          >
            {tag.label}
          </TagItem>
        ))}
      </Stack>
    </TagsContainer>
  );
}

const tagClasses = generateUtilityClasses('TagItem', ['active']);

const TagItem = styled('span', { shouldForwardProp: propName => propName !== 'color' })<{ color: string }>`
  display: inline-block;
  color: ${({ color }) => color};
  background-color: ${({ color }) => alpha(color, 0.1)};
  border: 1px solid ${({ color }) => alpha(color, 0.3)};
  padding: 4px 12px;
  border-radius: 24px;
  font-size: 12px;
  user-select: none;
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.create(['color', 'background-color', 'border-color', 'font-weight'])};
  min-width: 60px;
  text-align: center;
  white-space: nowrap;
  justify-self: stretch;

  &:hover {
    color: ${({ color }) => darken(color, 0.6)};
    background-color: ${({ color }) => alpha(color, 0.8)};
    border-color: ${({ color }) => alpha(color, 0.8)};
  }

  &.${tagClasses.active} {
    color: ${({ color }) => darken(color, 0.6)};
    background-color: ${({ color }) => color};
    border-color: ${({ color }) => color};
    font-weight: bold;
  }
`;

const TagsContainer = styled('div')`
  overflow-x: auto;
  padding-bottom: 12px;
`;
