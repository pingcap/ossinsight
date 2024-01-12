import { Suggestions, useRecommended } from '@site/src/pages/explore/_components/Suggestions';
import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ExpandLess } from '@mui/icons-material';
import { Button, Divider, IconButton, styled, useEventCallback } from '@mui/material';
import { gotoAnchor } from '@site/src/utils/dom';

interface QuestionListProps {
  n?: number;
  tagId?: number;
}

export default function QuestionList ({ n, tagId }: QuestionListProps) {
  const { data = [], loading } = useRecommended(false, n, tagId);
  const [expand, setExpand] = useState(false);
  const [canExpand, setCanExpand] = useState(false);

  useEffect(() => {
    setCanExpand(data.length > 20);
  }, [data]);

  const list = useMemo(() => {
    if (expand) {
      return data;
    } else {
      return data.slice(0, 20);
    }
  }, [data, expand]);

  const handleExpandMore = useEventCallback(() => {
    setExpand(true);
  });

  const handleExpandLess = useEventCallback(() => {
    gotoAnchor('explore-questions-list', false)();
    setExpand(false);
  });

  return (
    <QuestionListRoot id="explore-questions-list">
      <Suggestions
        n={n}
        disabled={loading}
        questions={list}
        variant="text"
        questionPrefix={
          <ArrowRight sx={{ color: '#959595', verticalAlign: 'text-bottom' }} color="inherit" fontSize="inherit" />
        }
        showTags
      />
      {!expand && canExpand && (
        <Divider>
          <Button variant="text" color="inherit" onClick={handleExpandMore}>See More</Button>
        </Divider>
      )}
      {
        expand && canExpand && (
          <Divider>
            <IconButton color="inherit" onClick={handleExpandLess}>
              <ExpandLess />
            </IconButton>
          </Divider>
        )
      }
    </QuestionListRoot>
  );
}

const QuestionListRoot = styled('div')`
  scroll-margin: 140px;
`;
