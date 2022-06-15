import { ErrorOutlined } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import React from 'react';
import { useInView } from 'react-intersection-observer';
import useVisibility from '../../../../../hooks/visibility';
import Events from './Events';
import EventsChart from './EventsChart';


export function Realtime () {
  const visible = useVisibility();
  const { ref: inViewRef, inView } = useInView();

  return (
    <div ref={inViewRef}>

    </div>
  )
}
