import { SortingBarChart } from '@site/src/components/ECharts';
import { Title } from '@djagger/echartsx';
import React, { useContext } from 'react';
import { withInViewContainer } from '../../../components/InViewContainer';
import Watermark from '../components/Watermark';
import CollectionsContext from '../context';
import { useCollectionHistory } from '../hooks/data';
import { useDimensionTabs } from '../hooks/useTabs';
import { withRemote } from '../hooks/withRemote';
import { H2, P2 } from './typograpy';
import { formatTime } from './utils';

import { Box, Skeleton } from '@mui/material';

export default withInViewContainer(function HistorySortSection () {
  const { collection } = useContext(CollectionsContext);

  const { dimension, tabs } = useDimensionTabs('bar-chart-race');
  const asyncData = useCollectionHistory(collection?.id, dimension.key);

  return (
    <section>
      <H2 id="bar-chart-race">Bar Chart Race</H2>
      <P2>An animated bar chart visualizes the annual total growth of each repository since 2011. You can display the growth of repositories based on the number of stars, pull requests, pul request creators, and issues. </P2>
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
            filename={collection?.slug}
          >
            <Title id="title" text={`${collection?.name ?? 'undefined'} - ${dimension.title}`} />
            <Watermark right="5%" bottom="10%" />
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
