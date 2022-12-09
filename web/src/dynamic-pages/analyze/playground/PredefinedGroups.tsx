import { PredefinedQuestion, predefinedQuestions } from './predefined';
import { MenuItem, Select, SelectChangeEvent } from '@mui/material';
import React, { useCallback } from 'react';
import { notNullish } from '@site/src/utils/value';

interface PredefinedGroupsProps {
  onSelectQuestion?: (question: PredefinedQuestion) => void;
}

export default function PredefinedGroups ({ onSelectQuestion }: PredefinedGroupsProps) {
  const handleSelectChange = useCallback((event: SelectChangeEvent) => {
    const question = predefinedQuestions.find(q => q.id === event.target.value);
    if (notNullish(question)) {
      onSelectQuestion?.(question);
    }
  }, [onSelectQuestion]);

  return (
    <Select sx={{ minWidth: 120, fontSize: 12, '.MuiSelect-select': { py: 0.5 } }} displayEmpty size="small" value="" onChange={handleSelectChange}>
      <MenuItem key="" value="">
        🔥 Choose an FAQ …
      </MenuItem>
      {predefinedQuestions.map((question) => (
        <MenuItem key={question.id} value={question.id}>
          {question.title}
        </MenuItem>
      ))}
    </Select>
  );
}
