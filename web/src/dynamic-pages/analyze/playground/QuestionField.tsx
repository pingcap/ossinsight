import { styled, TextField, useEventCallback } from '@mui/material';
import * as React from 'react';
import { KeyboardEventHandler, useCallback } from 'react';
import isHotkey from 'is-hotkey';
import { getOptionalErrorMessage } from '@site/src/utils/error';
import { LoadingButton } from '@mui/lab';
import { notFalsy } from '@site/src/utils/value';

export interface QuestionFieldProps {
  loading: boolean;
  value: string;
  error: unknown;
  onChange: (value: string) => void;
  onAction: () => void;
  defaultQuestion: string;
  maxLength: number;
}

export default function QuestionField ({ defaultQuestion, maxLength, value, loading, error, onAction, onChange }: QuestionFieldProps) {
  const handleCustomQuestion: KeyboardEventHandler = useCallback((e) => {
    if (isHotkey('Enter', e)) {
      onAction();
    }
  }, [onAction]);

  return (
    <Container>
      <TextField
        multiline
        minRows={3}
        label="Input"
        size="small"
        fullWidth
        disabled={loading}
        value={value}
        onChange={useEventCallback(e => onChange(e.target.value))}
        onKeyDown={handleCustomQuestion}
        placeholder={defaultQuestion}
        helperText={getOptionalErrorMessage(error)}
        error={notFalsy(error)}
        InputLabelProps={{ shrink: true }}
      />
      <BottomLine>
        <Counter>
          {value.length}/{maxLength}
        </Counter>
        <LoadingButton loading={loading} onClick={onAction}>
          Generate SQL
        </LoadingButton>
      </BottomLine>
    </Container>
  );
}

const Container = styled('div', { name: 'QuestionField' })`
  padding-top: 8px;
`;

const BottomLine = styled('div', { name: 'QuestionField-BottomLine' })`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Counter = styled('span', { name: 'QuestionField-Counter' })`
  color: #565656;
`;
