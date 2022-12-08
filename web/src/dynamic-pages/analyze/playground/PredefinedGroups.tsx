import { PredefinedQuestion, predefinedQuestions } from './predefined';
import { List, ListItem, ListItemButton, ListItemText, styled } from '@mui/material';
import React from 'react';

interface PredefinedGroupsProps {
  question: PredefinedQuestion | undefined;
  onSelectQuestion?: (question: PredefinedQuestion) => void;
}

export default function PredefinedGroups ({ question: currentQuestion, onSelectQuestion }: PredefinedGroupsProps) {
  return (
    <>
      <PredefinedGroupsContainer dense>
        {predefinedQuestions.map((question) => (
          <ListItem key={question.id}>
            <ListItemButton selected={question === currentQuestion} onClick={() => onSelectQuestion?.(question)}>
              <ListItemText>
                {question.title}
              </ListItemText>
            </ListItemButton>
          </ListItem>
        ))}
      </PredefinedGroupsContainer>
    </>
  );
}

const PredefinedGroupsContainer = styled(List, { name: 'PredefinedGroupsContainer' })`
  margin-top: 16px;
  flex: 1;
  overflow-y: scroll;
`;
