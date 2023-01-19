import React, { useState } from 'react';
import TagSelector from '@site/src/pages/explore/_components/TagSelector';
import { Box, Grid, styled, Typography, useEventCallback } from '@mui/material';
import { QuestionTag } from '@site/src/api/explorer';
import QuestionList from '@site/src/pages/explore/_components/QuestionList';
import QuestionCard from '@site/src/pages/explore/_components/QuestionCard';
import { SaveAlt } from '@mui/icons-material';
import TiDBCloudLink from '@site/src/components/TiDBCloudLink';

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
        <Ads />
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

const Ads = () => {
  return (
    <AdsContainer>
      <AdsDashedContainer>
        <AdsContent>
          <Typography variant="body2" fontSize={12} color="#A0A0A0">
            GitHub data is not your focus?
          </Typography>
          <TiDBCloudLink as={AdsButton}>
            <IconContainer>
              <SaveAlt />
            </IconContainer>
            Import any dataset
          </TiDBCloudLink>
          <img width="228" src={require('./img/ads-prompts.png').default} alt="image" />
        </AdsContent>
      </AdsDashedContainer>
    </AdsContainer>
  );
};

const AdsContainer = styled('div')`
  background: linear-gradient(90deg, #FFBCA7 2.21%, #DAA3D8 30.93%, #B587FF 67.95%, #6B7AFF 103.3%);
  border-radius: 6px;
  margin-top: 16px;
`;

const AdsDashedContainer = styled('div')`
  border-radius: 6px;
  border: dashed 1px var(--ifm-background-color);
  box-sizing: border-box;
`;

const AdsContent = styled('div')`
  background: var(--ifm-background-color);
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 0;
`;

const AdsButton = styled('a')`
  background: linear-gradient(90deg, #5667FF 0%, #A168FF 106.06%);
  box-shadow: ${({ theme }) => theme.shadows[4]};
  border-radius: 29px;
  display: flex;
  align-items: center;
  padding: 8px !important;
  font-weight: 600;
  font-size: 16px;
  color: white !important;
  text-decoration: none !important;
  opacity: 1;
  cursor: pointer;
  user-select: none;
  margin-top: 8px;
  transition: ${({ theme }) => theme.transitions.create(['box-shadow', 'transform'])};

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows[10]};
    transform: scale3d(1.02, 1.02, 1.02);
  }
`;

const IconContainer = styled('span')`
  display: inline-flex;
  width: 32px;
  height: 32px;
  border-radius: 16px;
  align-items: center;
  justify-content: center;
  background: white;
  color: #5667FF;
  margin-right: 16px;
`;
