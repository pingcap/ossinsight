import { styled, TextField, useEventCallback } from '@mui/material';
import * as React from 'react';
import { KeyboardEventHandler, useCallback } from 'react';
import isHotkey from 'is-hotkey';
import { getOptionalErrorMessage } from '@site/src/utils/error';
import { LoadingButton } from '@mui/lab';
import { notFalsy } from '@site/src/utils/value';
import { GitHub } from '@mui/icons-material';
import { useUserInfoContext } from '@site/src/context/user';
import { BaseInputBottomLine, BaseInputContainer } from '@site/src/dynamic-pages/analyze/playground/styled';

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
  const { validated } = useUserInfoContext();
  const handleCustomQuestion: KeyboardEventHandler = useCallback((e) => {
    if (isHotkey('Enter', e)) {
      e.preventDefault();
      onAction();
    }
  }, [onAction]);

  return (
    <Container>
      <TextField
        multiline
        minRows={3}
        size="small"
        variant="standard"
        fullWidth
        disabled={loading}
        value={value}
        onChange={useEventCallback(e => onChange(e.target.value))}
        onKeyDown={handleCustomQuestion}
        placeholder={defaultQuestion}
        helperText={getOptionalErrorMessage(error)}
        error={notFalsy(error)}
        InputLabelProps={{ shrink: true }}
        InputProps={{ disableUnderline: true }}
      />
      <BottomLine>
        <Counter>
          {value.length}/{maxLength}
        </Counter>
        <LoadingButton variant="contained" size="small" loading={loading} onClick={onAction}>
          {validated ? undefined : <>Login with <GitHub fontSize="inherit" sx={{ mx: 0.5 }} /> and </>}
          Generate SQL
        </LoadingButton>
      </BottomLine>
    </Container>
  );
}

const Container = styled(BaseInputContainer, { name: 'QuestionField-Container' })`
  padding: 16px 16px 64px;
  background: #141414;
`;

const BottomLine = styled(BaseInputBottomLine, { name: 'QuestionField-BottomLine' })`
  align-items: center;
  justify-content: space-between;
  width: calc(100% - 32px);
`;

const Counter = styled('span', { name: 'QuestionField-Counter' })`
  color: #565656;
`;
