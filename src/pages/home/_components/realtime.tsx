import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
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
      </Subtitle>
      <Events show={visible && inView} />
    </div>
  )
}