import { Box, styled, TextField, Tooltip, useEventCallback } from '@mui/material';
import * as React from 'react';
import { KeyboardEventHandler, useCallback, useMemo } from 'react';
import isHotkey from 'is-hotkey';
import { getOptionalErrorMessage } from '@site/src/utils/error';
import { LoadingButton } from '@mui/lab';
import { isNullish, notFalsy, notNullish } from '@site/src/utils/value';
import { BaseInputBottomLine, BaseInputContainer } from '@site/src/dynamic-pages/analyze/playground/styled';
import PredefinedGroups, { PredefinedGroupsProps } from '@site/src/dynamic-pages/analyze/playground/PredefinedGroups';
import { AiQuestionResource } from '@site/src/api/core';
import AuthorizedContent from '@site/src/components/AuthorizedContent';

export interface QuestionFieldProps extends PredefinedGroupsProps {
  loading: boolean;
  value: string;
  error: unknown;
  onChange: (value: string) => void;
  onAction: () => void;
  defaultQuestion: string;
  maxLength: number;
  resource?: AiQuestionResource;
}

export default function QuestionField ({ defaultQuestion, maxLength, value, loading, error, onAction, onChange, question, onSelectQuestion, resource }: QuestionFieldProps) {
  const handleCustomQuestion: KeyboardEventHandler = useCallback((e) => {
    if (isHotkey('Enter', e)) {
      e.preventDefault();
      onAction();
    }
  }, [onAction]);

  const disabled = useMemo(() => {
    if (isNullish(resource)) {
      return false;
    }
    return resource.used >= resource.limit;
  }, [resource]);

  const quota = useMemo(() => {
    if (isNullish(resource) || !isFinite(resource.used) || !isFinite(resource.limit)) {
      return '';
    } else {
      return ` ${resource.used}/${resource.limit}`;
    }
  }, [resource]);

  const button = useMemo(() => (
    <LoadingButton variant="contained" size="small" loading={loading} onClick={onAction} disabled={disabled}>
      <AuthorizedContent fallback={<>Login and </>}>
        <>🤖️</>
      </AuthorizedContent>
      Generate SQL
      <AuthorizedContent>
        <>{quota}</>
      </AuthorizedContent>
    </LoadingButton>
  ), [loading, disabled, quota, onAction]);

  const buttonWithTooltip = useMemo(() => notNullish(resource)
    ? (
    <Tooltip arrow title={`${resource.limit ?? ''} requests per day`}>
      {button}
    </Tooltip>
      )
    : button, [resource, button]);

  return (
    <Container>
      <Control>
        <Prompt
          id="question-field-label"
          htmlFor="question-field-input"
        >
          In this repo:
        </Prompt>
        <TextField
          id="question-field-input"
          aria-labelledby="question-field-label"
          sx={{ fontSize: 16 }}
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
        </BottomLine>
      </Control>
      <PredefinedGroupsContainer>
        <PredefinedGroupsContainerTitle>or choose a 🔥 trending query here </PredefinedGroupsContainerTitle>
        <PredefinedGroups question={question} onSelectQuestion={onSelectQuestion} />
      </PredefinedGroupsContainer>
      <Box flex={1} />
      <AuthorizedContent fallback={button}>
        {buttonWithTooltip}
      </AuthorizedContent>
    </Container>
  );
}

const Container = styled(BaseInputContainer, { name: 'QuestionField-Container' })`
  background: #141414;
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const Control = styled('div', { name: 'QuestionField-Control' })`
  background: #222222;
  border: 1px solid #393939;
  padding: 8px;
  position: relative;
`;

const Prompt = styled('label', { name: 'QuestionField-Prompt' })`
  font-size: 16px;
  margin-bottom: 8px;
`;

const BottomLine = styled(BaseInputBottomLine, { name: 'QuestionField-BottomLine' })`
  align-items: center;
  justify-content: flex-end;
  right: 8px;
  bottom: 4px;
  width: calc(100% - 8px);
`;

const Counter = styled('span', { name: 'QuestionField-Counter' })`
  color: #565656;
`;

const PredefinedGroupsContainer = styled('div', { name: 'PredefinedGroupsContainer' })`
  max-height: 126px;
  margin-top: 8px;
  margin-bottom: 8px;
  background: #2c2c2c;
  position: relative;

  &:before {
    display: block;
    content: ' ';
    width: 0;
    height: 0;
    border-left: 18px solid transparent;
    border-right: 18px solid transparent;
    border-bottom: 18px solid #2c2c2c;

    position: absolute;
    top: -18px;
    left: 15%;

    transform: scaleX(0.7);
  }
`;

const PredefinedGroupsContainerTitle = styled('div', { name: 'PredefinedGroupsContainer-Title' })`
  color: #FFE895;
  font-size: 12px;
  margin: 8px 16px;
`;
