import { List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import React from 'react';

const questions = [
  'Similar projects like @facebook/react',
  'MySQL alternative projects',
  'Top 10 TypeScript projects this month',
  'The trending open source projects recently',
  'The most popular web3 projects',
  'Star history of @supabase/supabase',
  'Contributors in @pingcap/tidb',
  'The most popular programming languages 2022',
  'Top forked front-end projects',
  'The most popular repos about ChatGPT',
  'The most watched projects by Chinese developers',
  'Geographic distribution of @kubernetes/kubernetes contributors',
];

export interface SuggestionsProps {
  onSelect: (question: string) => void;
}

export default function Suggestions ({ onSelect }: SuggestionsProps) {
  return (
    <List dense disablePadding sx={{ mx: 'auto', width: 'max-content' }}>
      {questions.map((question, index) => (
        <ListItem key={index}>
          <ListItemButton onClick={() => onSelect(question)}>
            <ListItemText>
              {question}
            </ListItemText>
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
}
