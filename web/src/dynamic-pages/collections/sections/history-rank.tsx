import { RankChart } from '@site/src/components/ECharts';
import { Title, Toolbox } from '@djagger/echartsx';
import React, { useContext } from 'react';
import { withInViewContainer } from '../../../components/InViewContainer';
import Watermark from '../components/Watermark';
import CollectionsContext from '../context';
import { useCollectionHistoryRank } from '../hooks/data';
import { useDimensionTabs } from '../hooks/useTabs';
import { withRemote } from '../hooks/withRemote';
import { H2, P2 } from './typograpy';
import { countNames } from './utils';

import { Box, Skeleton } from '@mui/material';

export default withInViewContainer(function HistoryRankSection () {
  const { collection } = useContext(CollectionsContext);

  const { dimension, tabs } = useDimensionTabs('historical-rankings');
  const asyncData = useCollectionHistoryRank(collection?.id, dimension.key);

  return (
    <section>
      <H2 id="historical-rankings">Year-to-year Ranking</H2>
      <P2>The following pipeline chart shows how repo rankings have changed year to year since 2011. Repos are ranked by stars, pull requests, pull request creators, and issues.</P2>
      {tabs}
      <br />
      {withRemote(
        asyncData,
        data => (
          <RankChart
            theme="dark"
            renderer="canvas"
            data={data.data}
            height={countNames(data.data) * 36 + 128}

            fields={{ name: 'repo_name', time: 'event_year', value: 'total', rank: 'rank' }}
          >
            <Title id="title" text={`${collection?.name ?? 'undefined'} - ${dimension.title}`} />
            <Watermark left="5%" bottom="15%" />
            <Toolbox feature={{ saveAsImage: { title: '' } }} />
          </RankChart>
        ),
        () => (
          <Box height={600}>
            <Skeleton variant="text" width="70%" sx={{ mt: 1 }} />
            <Skeleton variant="text" width="60%" sx={{ mt: 1 }} />
            <Skeleton variant="text" width="90%" sx={{ my: 1 }} />
          </Box>
        ),
      )}
    </section>
  );
});
