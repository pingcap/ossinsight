import * as React from 'react';
import { MouseEventHandler, useEffect, useState } from 'react';
import { Button, createTheme, Grow, useEventCallback } from '@mui/material';
import { useTimeout } from 'ahooks';
import { PlaygroundButton as StyledPlaygroundButton, PlaygroundButtonContainer, PlaygroundPopoverContent } from '@site/src/dynamic-pages/analyze/playground/styled';
import { Experimental } from '@site/src/components/Experimental';
import ThemeProvider from '@mui/system/ThemeProvider';
import { useWhenMounted } from '@site/src/hooks/mounted';

const DISPLAY_POPPER_TIMEOUT = 10000;

interface PlaygroundButtonProps {
  open: boolean;
  onToggleOpen: () => void;
}

export default function PlaygroundButton ({ open, onToggleOpen }: PlaygroundButtonProps) {
  const whenMounted = useWhenMounted();

  const [popoverIn, setPopoverIn] = useState(() => localStorage.getItem('ossinsight.playground.tooltip-closed') !== 'true');

  const handleClickTerminalBtn = useEventCallback(whenMounted((event: React.MouseEvent<HTMLElement>) => {
    onToggleOpen();
    setPopoverIn(false);
    localStorage.setItem('ossinsight.playground.tooltip-closed', 'true');
  }));

  useTimeout(whenMounted(() => {
    setPopoverIn(false);
  }), DISPLAY_POPPER_TIMEOUT);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toUpperCase() === 'K' && (event.ctrlKey || event.metaKey)) {
        // it was Ctrl + K (Cmd + K)
        onToggleOpen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <PlaygroundButtonContainer className={open ? 'opened' : ''}>
      <Experimental feature="ai-playground">
        <Grow in={popoverIn}>
          <div>
            <PlaygroundPopover onClickButton={handleClickTerminalBtn} />
          </div>
        </Grow>
      </Experimental>
      <StyledPlaygroundButton
        className={`${open ? '' : 'tada animated'}`}
        aria-label="Open SQL Playground"
        onClick={handleClickTerminalBtn}
        disableRipple
        disableTouchRipple
      >
        <img src={require('./icon.png').default} width="66" height="73" alt="Playground icon" />
      </StyledPlaygroundButton>
    </PlaygroundButtonContainer>
  );
}

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#FFE895',
      contrastText: '#1C1E21',
    },
  },
});

function PlaygroundPopover ({ onClickButton }: { onClickButton: MouseEventHandler }) {
  return (
    <ThemeProvider theme={theme}>
      <PlaygroundPopoverContent>
        <h2>👀 Want to know more about this repo?</h2>
        <p>Chat with GitHub data directly and gain your own insights here!</p>
        <Button fullWidth size="small" variant="contained" onClick={onClickButton}>Ask me a question</Button>
      </PlaygroundPopoverContent>
    </ThemeProvider>
  );
}
