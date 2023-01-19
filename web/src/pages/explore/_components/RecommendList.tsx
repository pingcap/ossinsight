import React, { useState } from 'react';
import TagSelector from '@site/src/pages/explore/_components/TagSelector';
import { Box, Grid, useEventCallback } from '@mui/material';
import { QuestionTag } from '@site/src/api/explorer';
import QuestionList from '@site/src/pages/explore/_components/QuestionList';
import QuestionCard from '@site/src/pages/explore/_components/QuestionCard';

const presetQuestions = [
  {
    question: 'How diverse is django\'s community (by coders\' distribution)',
    questionId: 'd4ba4997-80a9-413e-bf01-ba3e513fc9e3',
    imageUrl: require('./img/img1.png').default,
    tags: [{
      id: 2,
      label: 'Repositories',
      color: '#a3fcc8',
      sort: 2,
      createdAt: '2023-01-19T02:36:34.000+00:00',
    }],
  },
  {
    question: 'Summary of @gvanrossum\'s contribution by event type in 2022',
    questionId: '293d799b-f480-4f8f-bf9d-20be52d95884',
    imageUrl: require('./img/img2.png').default,
    tags: [{
      id: 1,
      label: 'Developers',
      color: '#f2ac99',
      sort: 1,
      createdAt: '2023-01-19T02:36:34.000+00:00',
    }],
  },
];

export default function RecommendList () {
  const [tag, setTag] = useState<QuestionTag | null>(null);

  const handleTagChange = useEventCallback((_, tag: QuestionTag | null) => {
    setTag(tag);
  });

  return (
    <Grid container spacing={2}>
      <Grid item xs={4}>
        {presetQuestions.map((props, index) => <QuestionCard key={index} {...props} />)}
      </Grid>
      <Grid item xs={8}>
        <TagSelector value={tag} onChange={handleTagChange} />
        <Box>
          <QuestionList n={30} tagId={tag?.id ?? undefined} />
        </Box>
      </Grid>
    </Grid>
  );
}
