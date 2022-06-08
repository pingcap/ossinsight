import { ErrorOutlined } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { InfoIcon } from '@primer/octicons-react';
import React from 'react'
import { useInView } from 'react-intersection-observer';
import useVisibility from '../../../hooks/visibility';
import Events from './events';
import { EventsChart } from './events-chart';

const Strong = styled('strong')({
  color: '#47D9A1'
})

const Subtitle = styled('p')({
  fontSize: '14px',
  color: '#C4C4C4',
  fontWeight: 'bold',
  marginBottom: '8px',
  marginTop: '16px',
})

export function Realtime () {
  const visible = useVisibility();
  const { ref: inViewRef, inView } = useInView();

  return (
    <div ref={inViewRef}>
      <Subtitle sx={{ mt: 0 }}>
        Events per 5 seconds
      </Subtitle>
      <EventsChart show={visible && inView} />
      <Subtitle>
        What is happening on GitHub <Strong>NOW!</Strong>
        &nbsp;
        <Tooltip title='Random pick from all realtime events'>
          <ErrorOutlined fontSize='inherit' sx={{ verticalAlign: 'text-bottom' }} />
        </Tooltip>
      </Subtitle>
      <Events show={visible && inView} />
    </div>
  )
}