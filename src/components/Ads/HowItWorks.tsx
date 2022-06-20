import { useLocation } from '@docusaurus/router';
import { Close } from '@mui/icons-material';
import ConstructionIcon from '@mui/icons-material/Construction';
import { useEventCallback } from '@mui/material';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { SxProps } from '@mui/system';
import React, { MouseEventHandler, useMemo, useState } from 'react';
import { responsiveSx } from '../../pages/home/_components/responsive';

export interface HowItWorksProps {
}

function getInitialDisplay () {
  if (typeof window === 'undefined') {
    return false
  } else {
    return /utm_medium=promotion/.test(window.location.search)
  }
}

const url = 'https://share.hsforms.com/1E-qtGQWrTVmctP8kBT34gw2npzm';

let _display = getInitialDisplay();

export default function HowItWorks({}: HowItWorksProps) {
  const [display, setDisplay] = useState(_display);

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
      }
    ];
  }, []);

  const handleClickClose: MouseEventHandler<any> = useEventCallback((event) => {
    setDisplay(false);
    _display = false
    event.stopPropagation();
    event.preventDefault();
  })

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
          <ConstructionIcon fontSize='inherit' sx={{ verticalAlign: 'text-bottom' }} />
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