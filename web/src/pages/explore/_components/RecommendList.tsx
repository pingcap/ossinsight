import React, { useState } from 'react';
import TagSelector from '@site/src/pages/explore/_components/TagSelector';
import { Box, Grid, Typography, useEventCallback } from '@mui/material';
import { QuestionTag } from '@site/src/api/explorer';
import QuestionList from '@site/src/pages/explore/_components/QuestionList';
import QuestionCard from '@site/src/pages/explore/_components/QuestionCard';
import Ads from '@site/src/pages/explore/_components/Ads';

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
    <Grid container spacing={4}>
      <Grid item xs={12} md={5} lg={4}>
        <Typography variant="h3" fontSize={16} mb={2}>
          💡 Popular questions
        </Typography>
        {presetQuestions.map((props, index) => <QuestionCard key={index} {...props} />)}
        <Ads sx={{ mt: 2 }} utmContent='home_left' />
      </Grid>
      <Grid item xs={12} md={7} lg={8}>
        <TagSelector value={tag} onChange={handleTagChange} />
        <Box>
          <QuestionList n={100} tagId={tag?.id ?? undefined} />
        </Box>
      </Grid>
    </Grid>
  );
}
