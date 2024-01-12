import { ErrorOutlined } from '@mui/icons-material';
import React from 'react';
import InViewContainer from '@site/src/components/InViewContainer';
import { Item } from '../../../_components/StackItem';
import { fontSizes } from '../../../_components/typography';
import Events from './Events';
import EventsChart from './EventsChart';
import { styled, Tooltip, Button, Link, Box } from '@mui/material';

const Subtitle = styled('p')({
  fontSize: '14px',
  color: '#C4C4C4',
  fontWeight: 'bold',
  marginBottom: '8px',
  marginTop: '16px',
});

const Strong = styled('strong')({
  color: '#47D9A1',
});

const Right = () => {
  return (
    <Item sx={[{ flex: 0.618 }, fontSizes.h1]}>
      <Subtitle sx={{ mt: 0 }}>
        Events per 5 seconds
      </Subtitle>
      <InViewContainer>
        {show => <EventsChart show={show} />}
      </InViewContainer>
      <Subtitle>
        What is happening on GitHub <Strong>NOW!</Strong>
        &nbsp;
        <Tooltip title='Random pick from all realtime events'>
          <ErrorOutlined fontSize='inherit' sx={{ verticalAlign: 'text-bottom' }} />
        </Tooltip>
      </Subtitle>
      <InViewContainer>
        {show => <Events show={show} />}
      </InViewContainer>
      <Box fontSize={12} mt={3}>
        <Button sx={{ fontSize: 12, fontWeight: 'regular', verticalAlign: 'baseline', textDecoration: 'underline', color: '#7c7c7c' }} component={Link} href='/blog/why-we-choose-tidb-to-support-ossinsight'>
          🤖️ How do we create this real-time effect?
        </Button>
      </Box>
    </Item>
  );
};

export default Right;
