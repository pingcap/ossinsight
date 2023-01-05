import { Grid } from '@mui/material';
import React from 'react';
import QuestionCard from '@site/src/pages/explore/_components/QuestionCard';

// 【🎆 Annual review】My year in review 2022【使用关键词 annual report/github year/year in review/repo _name 2022 触发】
// { type: '🎆 Annual review', content: 'The annual report of @pingcap/tidb 【使用关键词 annual report/github year/year in review/repo _name 2022 触发】' },

const types = {
  hotTopics: {
    title: '🔥 Hot topics',
    color: '#E78F34',
  },
  programmingLanguage: {
    title: '👾 Programming Language',
    color: '#8253F6',
  },
  trends: {
    title: '🚀 OSS trends',
    color: '#E78F34',
  },
  contributors: {
    title: '🧑‍💻 Contributors',
    color: '#C9B4FF',
  },
  stars: {
    title: '🌟 Stars',
    color: '#519AEB',
  },
  similarProjects: {
    title: '🔍 Similar projects',
    color: '#34A352',
  },
  location: {
    title: '🌍 Location',
    color: '#FFD7AD',
  },
  company: {
    title: '🏢 Company',
    color: '#BCDAFF',
  },
};

const questions = [
  { type: types.location, content: 'Where are @kubernetes/kubernetes contributors come from' },
  { type: types.hotTopics, content: 'Popular repos related to ChatGPT' },
  { type: types.hotTopics, content: 'The most watched Web3 projects' },
  { type: types.programmingLanguage, content: 'Top python projects 2022' },
  { type: types.programmingLanguage, content: 'What is the distribution of primary language used in repositories' },
  { type: types.trends, content: 'The closed PR monthly history of GitHub' },
  { type: types.trends, content: 'The star history of GitHub all the time' },
  { type: types.contributors, content: 'Contributor list of @pingcap/tidb' },
  { type: types.stars, content: 'Star history of @carbon-language/carbon-lang' },
  { type: types.similarProjects, content: 'Projects similar to @facebook/react' },
  { type: types.trends, content: 'Top trending TypeScript repositories of the past month' },
  { type: types.location, content: 'The most watched projects by India developers' },
  { type: types.company, content: 'What projects Microsoft developers like to contribute to' },
];

export interface SuggestionsProps {
  dense?: boolean;
  disabled?: boolean;
  onSelect: (question: string) => void;
}

export default function Suggestions ({ onSelect, disabled = false, dense = false }: SuggestionsProps) {
  if (dense) {
    return (
      <ul>
        {questions.map((question, index) => (
          <QuestionCard key={index} variant="text" question={question.content} onClick={onSelect} disabled={disabled} />
        ))}
      </ul>
    );
  } else {
    return (
      <Grid container spacing={2} mt={2}>
        {questions.map((question, index) => (
          <Grid item xs={12} sm={6} lg={4} xl={3} key={index} display="flex" alignItems="stretch" justifyContent="stretch">
            <QuestionCard variant="recommended-card" key={index} question={question.content} onClick={onSelect} disabled={disabled} />
          </Grid>
        ))}
      </Grid>
    );
  }
}
