import { RankChart, Title } from '@djagger/echartsx';
import { Container } from '@mui/material';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import React, { useContext } from 'react';
import { withInViewContainer } from '../../../components/InViewContainer';
import CollectionsContext from '../context';
import { CollectionHistoryRankData, useCollectionHistoryRank } from '../hooks/data';
import { useDimensionTabs } from '../hooks/useTabs';
import { withRemote } from '../hooks/withRemote';

use(CanvasRenderer);

function countNames (data: CollectionHistoryRankData[]): number {
  const set = new Set()
  data.forEach(item => set.add(item.repo_name))
  return set.size
}

export default withInViewContainer(function HistoryRankSection() {
  const { collection } = useContext(CollectionsContext);

  const { dimension, tabs } = useDimensionTabs();
  const asyncData = useCollectionHistoryRank(collection?.id, dimension.key);

  return (
    <Container>
      {tabs}
      <br />
      {withRemote(
        asyncData,
        data => (
          <RankChart
            theme="dark"
            renderer="canvas"
            data={data.data}
            height={countNames(data.data) * 48 + 128}

            fields={{ name: 'repo_name', time: 'event_year', value: 'total', rank: 'rank' }}
          >
            <Title text='Title'/>
          </RankChart>
        ),
        () => (
          <Box height={600}>
            <Skeleton variant='text' width='70%' sx={{mt: 1 }} />
            <Skeleton variant='text' width='60%' sx={{mt: 1 }} />
            <Skeleton variant='text' width='90%' sx={{my: 1 }} />
          </Box>
        )
      )}
    </Container>
  );
})
