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
}

export default function QuestionField ({ value, loading, error, onAction, onChange }: QuestionFieldProps) {
  const handleCustomQuestion: KeyboardEventHandler = useCallback((e) => {
    if (isHotkey('Enter', e)) {
      onAction();
    }
  }, [onAction]);

  return (
    <Container>
      <Title>
        Your Question
      </Title>
      <TextField
        multiline
        minRows={3}
        label="Question"
        size="small"
        fullWidth
        disabled={loading}
        value={value}
        onChange={useEventCallback(e => onChange(e.target.value))}
        onKeyDown={handleCustomQuestion}
        placeholder="How many watch events in this repository?"
        helperText={getOptionalErrorMessage(error)}
        error={notFalsy(error)}
        InputLabelProps={{ shrink: true }}
      />
      <BottomLine>
        <Counter>
          {value.length}/200
        </Counter>
        <LoadingButton loading={loading} onClick={onAction}>
          Generate SQL
        </LoadingButton>
      </BottomLine>
    </Container>
  );
}

const Container = styled('div', { name: 'QuestionField' })`
`;

const Title = styled('div', { name: 'QuestionField-Title' })`

`;

const BottomLine = styled('div', { name: 'QuestionField-BottomLine' })`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Counter = styled('span', { name: 'QuestionField-Counter' })`
  color: #565656;
`;
