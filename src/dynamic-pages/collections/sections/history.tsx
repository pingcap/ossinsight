import { LineChart, Title } from '@djagger/echartsx';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import React, { useContext } from 'react';
import { withInViewContainer } from '../../../components/InViewContainer';
import Watermark from '../components/Watermark';
import CollectionsContext from '../context';
import { useCollectionHistory } from '../hooks/data';
import { useDimensionTabs } from '../hooks/useTabs';
import { withRemote } from '../hooks/withRemote';
import { H2, P1 } from './typograpy';

use(CanvasRenderer);

const df = new Intl.DateTimeFormat(['en-US'], {
  month: 'short',
  year: 'numeric',
});
const formatTime = (name: string): string => df.format(new Date(name));

export default withInViewContainer(function HistorySection() {
  const { collection } = useContext(CollectionsContext);

  const { dimension, tabs } = useDimensionTabs();
  const asyncData = useCollectionHistory(collection?.id, dimension.key);

  return (
    <section>
      <H2>Historical Trending</H2>
      <P1>Historical trending since 2011.</P1>
      {tabs}
      <br />
      {withRemote(
        asyncData,
        data => (
          <LineChart
            theme="dark"
            renderer="canvas"
            data={data.data}
            height={480}
            fields={{ name: 'repo_name', time: 'event_month', value: 'total' }}
            formatTime={formatTime}
          >
            <Title id='title' text={`${collection.name} ${dimension.title} historical trending`}/>
            <Watermark left='10%' top='10%' />
          </LineChart>
        ),
        () => (
          <Box height={480}>
            <Skeleton variant="text" width="70%" sx={{ mt: 1 }} />
            <Skeleton variant="text" width="60%" sx={{ mt: 1 }} />
            <Skeleton variant="text" width="90%" sx={{ my: 1 }} />
          </Box>
        ),
      )}
    </section>
  );
});
