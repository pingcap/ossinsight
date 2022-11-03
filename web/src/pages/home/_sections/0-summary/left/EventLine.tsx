import React from 'react';
import { Headline } from '../../../_components/typography';
import TotalNumber from './TotalNumber';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const EventLine = () => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('md'));
  const isMedium = useMediaQuery(theme.breakpoints.down('lg'));

  return (
    <Headline>
      SELECT insights FROM
      <TotalNumber fontSize={isSmall ? 14 : isMedium ? 18 : 24} />
      GitHub events
    </Headline>
  );
};

export default EventLine;
