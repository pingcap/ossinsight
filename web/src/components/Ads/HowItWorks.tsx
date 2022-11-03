import { Close } from '@mui/icons-material';
import ConstructionIcon from '@mui/icons-material/Construction';
import { useEventCallback, Button, IconButton, Paper, Typography } from '@mui/material';
import { SxProps } from '@mui/system';
import React, { MouseEventHandler, useEffect, useMemo, useState } from 'react';

function getInitialDisplay () {
  if (typeof window === 'undefined') {
    return false;
  } else {
    return [
      window.location.search.includes('utm_medium=promotion'),
      /\/([od])/.test(window.location.pathname),
    ].map(Boolean).includes(true);
  }
}

const url = 'https://share.hsforms.com/1E-qtGQWrTVmctP8kBT34gw2npzm';

let _display = getInitialDisplay();
const delay = 80000;

export default function HowItWorks () {
  const [display, setDisplay] = useState(false);

  useEffect(() => {
    if (_display) {
      setTimeout(() => {
        setDisplay(true);
      }, delay);
    }
  }, []);

  const _sx: SxProps = useMemo(() => {
    return [
      {
        position: 'fixed',
        zIndex: 'var(--ifm-z-index-fixed-mui)',
        bottom: 16,
        right: 16,
        py: 1,
        px: 2,
        pl: 1,
      },
    ];
  }, []);

  const handleClickClose: MouseEventHandler<any> = useEventCallback((event) => {
    setDisplay(false);
    _display = false;
    event.stopPropagation();
    event.preventDefault();
  });

  if (!display) {
    return <></>;
  }

  return (
    <Paper
      sx={_sx}
      className="bounceInRight animated"
    >
      <Typography variant="body2" sx={{ pr: 1.5, fontSize: 14 }}>
        Wonder how OSSInsight works?
      </Typography>
      <Button
        href={url}
        component="a"
        target="_blank"
        sx={{ mt: 0.5 }}
      >
        <Typography variant="body2" sx={{ pr: 1.5, fontSize: 14 }}>
          {'>>>'} Join workshop
          &nbsp;
          <ConstructionIcon fontSize="inherit" sx={{ verticalAlign: 'text-bottom' }} />
        </Typography>
      </Button>
      <IconButton
        size="small"
        sx={{ position: 'absolute', right: 4, top: 4 }}
        onClick={handleClickClose}
      >
        <Close sx={{ fontSize: 16 }} />
      </IconButton>
    </Paper>
  );
}
