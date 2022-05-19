import { SortingBarChart } from '@djagger/echartsx';
import { Container } from '@mui/material';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import React, { useContext } from 'react';
import { withInViewContainer } from '../../../components/InViewContainer';
import CollectionsContext from '../context';
import { useCollectionHistory } from '../hooks/data';
import { useDimensionTabs } from '../hooks/useTabs';
import { withRemote } from '../hooks/withRemote';

use(CanvasRenderer);

const df = new Intl.DateTimeFormat(['en-US'], {
  month: 'short',
  year: 'numeric',
});
const formatTime = (name: string): string => df.format(new Date(name));

export default withInViewContainer(function HistorySortSection() {
  const { collection } = useContext(CollectionsContext);

  const { dimension, tabs } = useDimensionTabs();
  const asyncData = useCollectionHistory(collection?.id, dimension.key);

  return (
    <Container>
      {tabs}
      <br />
      {withRemote(
        asyncData,
        data => (
          <SortingBarChart
            theme="dark"
            renderer="canvas"
            data={data.data}
            height={480}
            formatTime={formatTime}
            fields={{ name: 'repo_name', time: 'event_month', value: 'total' }}
            interval={400}
          />
        ),
        () => (
          <Box height={480}>
            <Skeleton variant='text' width='70%' sx={{mt: 1 }} />
            <Skeleton variant='text' width='60%' sx={{mt: 1 }} />
            <Skeleton variant='text' width='90%' sx={{my: 1 }} />
          </Box>
        )
      )}
    </Container>
  );
})
