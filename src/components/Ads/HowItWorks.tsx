import { useLocation } from '@docusaurus/router';
import { Close } from '@mui/icons-material';
import ConstructionIcon from '@mui/icons-material/Construction';
import { useEventCallback } from '@mui/material';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { SxProps } from '@mui/system';
import React, { MouseEventHandler, useMemo, useState } from 'react';
import { responsiveSx } from '../../pages/home/_components/responsive';

export interface HowItWorksProps {
}

const url = 'https://share.hsforms.com/1E-qtGQWrTVmctP8kBT34gw2npzm';

let _display = true

const useInitialDisplay = () => {
  const { search } = useLocation()

  return useMemo(() => {
    return _display && (/utm_medium=paid_ads/.test(search))
  }, [])
}

export default function HowItWorks({}: HowItWorksProps) {
  const [display, setDisplay] = useState(useInitialDisplay());

  const _sx: SxProps = useMemo(() => {
    return [
      {
        position: 'fixed',
        right: 2,
        zIndex: 'var(--ifm-z-index-fixed-mui)',
        bottom: `calc(4.3em + 16px)`,
      },
      responsiveSx(
        {
          right: '1.3em',
        },
        {
          right: '1.3em',
        },
        {
          right: '32px',
        },
      ),
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
    >
      <ButtonBase
        sx={{
          position: 'relative',
          display: 'block',
          ':hover': {
            textDecoration: 'none',
            color: 'unset',
          },
          p: 2,
          backgroundColor: '#2c2c2c',
        }}
        href={url}
        component="a"
        target="_blank"
      >
        <Typography variant="body2" sx={{ pr: 2 }}>
          Wonder how OSSInsight works？
          <ConstructionIcon fontSize='inherit' />
        </Typography>
        <IconButton
          size="small"
          sx={{ position: 'absolute', right: 8, top: 8 }}
          onClick={handleClickClose}
        >
          <Close sx={{ fontSize: 16 }} />
        </IconButton>
      </ButtonBase>
    </Paper>
  );
}