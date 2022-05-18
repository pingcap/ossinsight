import { RankChart } from '@djagger/echartsx';
import { useRouteMatch } from '@docusaurus/router';
import Skeleton from '@mui/material/Skeleton';
import React from 'react';
import { registerThemeDark } from '../../components/BasicCharts';
import CustomPage from '../../theme/CustomPage';
import CollectionsContext from './context';
import { useCollection } from './hooks/useCollection';
import HistorySection from './sections/history';
import HistoryRankSection from './sections/history-rank';
import HistorySortSection from './sections/history-sort';
import MonthRankSection from './sections/month-rank';

interface CollectionsPageParams {
  slug: string;
}
registerThemeDark()

function CollectionsPage() {
  let { params: { slug } } = useRouteMatch<CollectionsPageParams>();
  const collection = useCollection(slug);

  if (collection) {
    return (
      <CustomPage>
        <CollectionsContext.Provider value={{ collection }}>
          <MonthRankSection />
          <HistorySection />
          <HistorySortSection />
          <HistoryRankSection />
        </CollectionsContext.Provider>
      </CustomPage>
    )
  } else {
    return (
      <CustomPage>
        <Skeleton variant='text' />
      </CustomPage>
    )
  }
}

export default CollectionsPage
