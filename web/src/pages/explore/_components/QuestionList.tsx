import { Suggestions, useRecommended } from '@site/src/pages/explore/_components/Suggestions';
import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight } from '@mui/icons-material';
import { Button, Divider } from '@mui/material';

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

  return (
    <>
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
          <Button variant="text" color='inherit' onClick={() => setExpand(true)}>See More</Button>
        </Divider>
      )}
    </>
  );
}
