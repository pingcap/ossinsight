import { IconButton, InputBase, List, Popper, Stack, styled, useEventCallback } from '@mui/material';
import React, { ChangeEventHandler, Dispatch, KeyboardEventHandler, RefObject, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';
import { isNullish } from '@site/src/utils/value';
import { useThrottle } from 'ahooks';
import { useGeneralSearchWithoutDefaults } from '@site/src/components/GeneralSearch/useGeneralSearch';
import { renderRepo, renderUser } from '@site/src/components/GeneralSearch';
import { useUserInfoContext } from '@site/src/context/user';
import { Close, KeyboardReturn, Pause } from '@mui/icons-material';

export function useStateRef<T> (initial: T | (() => T)): [T, Dispatch<SetStateAction<T>>, RefObject<T>] {
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
  const [state, setState, stateRef] = useStateRef(InputState.normal);
  const [anchor, setAnchor] = useState(-1);
  const [position, setPosition] = useState(-1);
  const [char, setChar] = useState('');
  const [name, setName] = useState('');
  const elRef = useRef<HTMLInputElement>(null);
  const { validating, validated } = useUserInfoContext();

  const handleChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = useEventCallback((ev) => {
    onChange(ev.target.value);
  });

  const handleKeydown: KeyboardEventHandler = useCallback((ev) => {
    setChar(ev.key);
    setPosition((ev.target as HTMLInputElement).selectionStart ?? -1);
    if (stateRef.current !== InputState.normal) {
      switch (ev.key) {
        case 'ArrowDown':
        case 'ArrowUp':
        case 'Tab':
        case 'Enter':
          ev.preventDefault();
      }
    } else {
      if (ev.key === 'Enter') {
        onAction?.();
      }
    }
  }, [onAction]);

  const reset = useEventCallback(() => {
    setState(InputState.normal);
    setAnchor(-1);
    setPosition(-1);
    setName('');
    setChar('');
  });

  useEffect(() => {
    switch (state) {
      case InputState.normal:
        // if (char === '@') {
        //   setAnchor(position);
        //   setState(InputState.user);
        //   setName('@');
        //   setChar('a');
        // }
        // if (char === '/') {
        //   const matched = /(?:\s|^)([a-z\d]+)$/.exec(value.substring(0, position));
        //   if (notNullish(matched)) {
        //     setAnchor(position - matched[1].length);
        //     setState(InputState.repo);
        //     setName(matched[1] + '/');
        //     setChar('a');
        //   }
        // }
        break;
      case InputState.user:
      case InputState.repo: {
        const name = value.substring(anchor, position + 1);
        if (/^[a-z\d]$/.test(char)) {
          setName(name);
        } else {
          switch (char) {
            case 'ArrowUp':
              setCurrent(current => (current - 1 + (data.length as number)) % (data.length as number));
              setChar('a');
              return;
            case 'ArrowDown':
              setCurrent(current => (current + 1) % data.length);
              setChar('a');
              return;
            case 'Tab':
            case 'Enter':
              replace();
              reset();
              return;
          }
          if (char === 'Backspace' && name.includes(state)) {
            setName(name);
          } else {
            reset();
          }
        }
      }
        break;
    }
  }, [state, char, value, anchor, position]);

  const throttleName = useThrottle(name, { wait: 200, trailing: true, leading: false });

  const { data } = usePrompts(state, throttleName);
  const [current, setCurrent] = useState(0);
  const replace = useCallback(() => {
    if (isNullish(data[current])) {
      return;
    }
    if (state === InputState.repo) {
      onChange(`${value.substring(0, anchor)}${data[current].fullName as string} ${value.substring(position + 1)}`);
    }
  }, [value, state, current, data, anchor, position]);

  useEffect(() => {
    if (current >= data.length) {
      setCurrent(data.length - 1);
    }
  }, [data]);

  return (
    <>
      <StyledInput
        fullWidth
        disabled={(validating && !validated) || disableInput}
        ref={elRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeydown}
        onBlur={reset}
        endAdornment={
          <Stack direction="row" gap={1}>
            <IconButton color="primary" onClick={onAction} disabled={disableAction}>
              <KeyboardReturn />
            </IconButton>
            <IconButton color="error" onClick={onClear} disabled={disableClear}>
              {clearState === 'stop'
                ? <Pause />
                : <Close />}
            </IconButton>
          </Stack>
        }
      />
      <Popper open={state !== InputState.normal} anchorEl={elRef.current}>
        <PopperContainer>
          <List>
            {data.map((item, index) => (
              state === InputState.repo
                ? renderRepo({}, item, current === index)
                : renderUser({}, item, current === index)
            ))}
          </List>
        </PopperContainer>
      </Popper>
    </>
  );
}

const usePrompts = function (inputState: InputState, name: string) {
  return useGeneralSearchWithoutDefaults(inputState === InputState.repo ? 'repo' : 'user', inputState === InputState.normal ? '' : name);
};

enum InputState {
  normal = '^',
  repo = '/',
  user = '@',
}

const StyledInput = styled(InputBase)`
  background-color: #3c3c3c;
  color: white;
  border-radius: 6px;
  font-size: 20px;
  padding: 14px;
  line-height: 1;
`;

const PopperContainer = styled('div')`
  background-color: #3c3c3c;
  border-radius: 6px;
`;
