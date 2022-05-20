import { SortingBarChart, Title } from '@djagger/echartsx';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import { use } from 'echarts/core';
import { CanvasRenderer, SVGRenderer } from 'echarts/renderers';
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
use(SVGRenderer);

export default withInViewContainer(function HistorySortSection() {
  const { collection } = useContext(CollectionsContext);

  const { dimension, tabs } = useDimensionTabs();
  const asyncData = useCollectionHistory(collection?.id, dimension.key);

  return (
    <section>
      <H2 id='bar-chart-race'>Bar Chart Race!</H2>
      <P1>Bar Chart Race is a great and highly visual way to display data changing over time in the form of an animated bar chart.</P1>
      {tabs}
      <br />
      {withRemote(
        asyncData,
        data => (
          <SortingBarChart
            theme="dark"
            renderer="canvas"
            data={data.data}
            height={15 * 36 + 128}
            formatTime={formatTime}
            fields={{ name: 'repo_name', time: 'event_month', value: 'total' }}
            interval={400}
            max={15}
          >
            <Title id='title' text={`${collection.name} - ${dimension.title}`}/>
            <Watermark right='5%' bottom='10%' />
          </SortingBarChart>
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
