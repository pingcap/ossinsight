import { TextField, useEventCallback } from '@mui/material';
import * as React from 'react';
import { KeyboardEventHandler, useCallback } from 'react';
import isHotkey from 'is-hotkey';
import { getOptionalErrorMessage } from '@site/src/utils/error';
import { KeyboardReturn } from '@mui/icons-material';

export interface QuestionFieldProps {
  loading: boolean;
  value: string;
  error: unknown;
  onChange: (value: string) => void;
  onAction: () => void;
}

export default function QuestionField ({ value, loading, error, onAction, onChange }: QuestionFieldProps) {
  const handleCustomQuestion: KeyboardEventHandler = useCallback((e) => {
    if (isHotkey('Enter', e)) {
      onAction();
    }
  }, [onAction]);

  return (
    <TextField
      multiline
      label="Question"
      size="small"
      fullWidth
      disabled={loading}
      value={value}
      onChange={useEventCallback(e => onChange(e.target.value))}
      onKeyDown={handleCustomQuestion}
      placeholder="How many watch events in this repository?"
      helperText={getOptionalErrorMessage(error)}

      InputProps={{
        endAdornment: <KeyboardReturn />,
      }}
    />
  );
}
