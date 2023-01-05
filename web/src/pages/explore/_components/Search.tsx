import { IconButton, InputBase, Stack, styled, useEventCallback } from '@mui/material';
import React, { ChangeEventHandler, Dispatch, KeyboardEventHandler, MutableRefObject, SetStateAction, useEffect, useRef, useState } from 'react';
import { useUserInfoContext } from '@site/src/context/user';
import { Close, KeyboardReturn, Pause } from '@mui/icons-material';

export function useStateRef<T> (initial: T | (() => T)): [T, Dispatch<SetStateAction<T>>, Readonly<MutableRefObject<T>>] {
  const [state, setState] = useState(initial);
  const ref = useRef<T>(state);
  useEffect(() => {
    ref.current = state;
  }, [state]);
  return [state, setState, ref];
}

export interface ExploreSearchProps {
  value: string;
  onChange: (value: string) => void;
  onAction?: () => void;
  onClear?: () => void;
  disableInput?: boolean;
  disableAction?: boolean;
  disableClear?: boolean;
  clearState?: 'stop' | undefined;
}

export default function ExploreSearch ({ value, onChange, onAction, onClear, disableInput = false, disableAction = false, disableClear = false, clearState }: ExploreSearchProps) {
  const elRef = useRef<HTMLInputElement>(null);
  const { validating, validated } = useUserInfoContext();

  const handleChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = useEventCallback((ev) => {
    onChange(ev.target.value);
  });

  const handleKeydown: KeyboardEventHandler = useEventCallback((ev) => {
    if (ev.key === 'Enter') {
      if (!disableAction) {
        onAction?.();
      }
    }
  });

  return (
    <>
      <StyledInput
        fullWidth
        disabled={(validating && !validated) || disableInput}
        ref={elRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeydown}
        placeholder="Type any question here, or choose one below"
        endAdornment={
          <Stack direction="row" gap={1}>
            {!disableAction && <IconButton color="primary" onClick={onAction} disabled={disableAction}>
              <KeyboardReturn />
            </IconButton>}
            <IconButton color={clearState === 'stop' ? 'error' : 'default'} onClick={onClear} disabled={disableClear}>
              {clearState === 'stop'
                ? <Pause />
                : <Close />}
            </IconButton>
          </Stack>
        }
      />
    </>
  );
}

const StyledInput = styled(InputBase)`
  background-color: #3c3c3c;
  color: white;
  border-radius: 6px;
  font-size: 20px;
  padding: 14px;
  line-height: 1;
`;
