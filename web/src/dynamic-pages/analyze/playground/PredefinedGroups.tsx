import { PredefinedQuestion, predefinedQuestions } from './predefined';
import { List, ListItem, ListItemButton, ListItemText, styled, Tooltip } from '@mui/material';
import React from 'react';

export interface PredefinedGroupsProps {
  question: PredefinedQuestion | undefined;
  onSelectQuestion?: (question: PredefinedQuestion) => void;
}

export default function PredefinedGroups ({ question: currentQuestion, onSelectQuestion }: PredefinedGroupsProps) {
  return (
    <>
      <Tooltip title="Select it and generate SQL">
        <Container dense>
          {predefinedQuestions.map((question) => (
            <ListItem key={question.id}>
              <ListItemButton selected={question === currentQuestion} onClick={() => onSelectQuestion?.(question)}>
                <ListItemText>
                  {question.title}
                </ListItemText>
              </ListItemButton>
            </ListItem>
          ))}
        </Container>
      </Tooltip>
    </>
  );
}

const Container = styled(List, { name: 'PredefinedGroups' })`
  overflow-y: scroll;
  height: calc(100% - 36px);
  padding: 0;

  > li {
    padding: 0;
  }

  .MuiListItemButton-root {
    padding-top: 0;
    padding-bottom: 0;
  }
`;
