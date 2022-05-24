import { useRouteMatch } from '@docusaurus/router';
import React from 'react';
import { registerThemeDark } from '../../components/BasicCharts';
import { Collection, useCollection } from './hooks/useCollection';
import CollectionsPageLayout from './layout';
import HistorySection from './sections/history';
import HistoryRankSection from './sections/history-rank';
import HistorySortSection from './sections/history-sort';

registerThemeDark();

const getTitle = (collection?: Collection) => collection ? collection.name + ' Trends' : '';

function CollectionsTrendsPage() {
  return (
    <CollectionsPageLayout title={getTitle}>
      <HistorySortSection />
      <HistoryRankSection />
      <HistorySection />
    </CollectionsPageLayout>
  );
}

export default CollectionsTrendsPage;
