import predefinedGroups, { PredefinedQuestion } from './predefined';
import { List, ListItem, ListItemButton, ListItemText, styled, Tab, Tabs, useEventCallback } from '@mui/material';
import React, { useState } from 'react';

interface PredefinedGroupsProps {
  question: PredefinedQuestion | undefined;
  onSelectQuestion?: (question: PredefinedQuestion) => void;
}

export default function PredefinedGroups ({ question: currentQuestion, onSelectQuestion }: PredefinedGroupsProps) {
  const [currentGroup, setCurrentGroup] = useState(predefinedGroups[0]);

  return (
    <>
      <Tabs value={currentGroup} onChange={useEventCallback((_, value) => setCurrentGroup(value))}>
        {predefinedGroups.map((group) => (
          <StyledTab key={group.id} label={group.title} value={group} />
        ))}
      </Tabs>
      <List sx={{ mt: 2 }} dense >
        {currentGroup.questions.map((question) => (
          <ListItem key={question.id}>
            <ListItemButton selected={question === currentQuestion} onClick={() => onSelectQuestion?.(question)}>
              <ListItemText>
                {question.title}
              </ListItemText>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </>
  );
}

const StyledTab = styled(Tab)`
  font-size: 12px;
  padding-left: 12px;
  padding-right: 12px;
`;
