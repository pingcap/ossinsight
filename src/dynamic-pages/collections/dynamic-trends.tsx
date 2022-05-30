import { useRouteMatch } from '@docusaurus/router';
import React from 'react';
import { registerThemeDark } from '../../components/BasicCharts';
import { Collection, useCollection } from './hooks/useCollection';
import CollectionsPageLayout from './layout';
import HistorySection from './sections/history';
import HistoryRankSection from './sections/history-rank';
import HistorySortSection from './sections/history-sort';
import { P1 } from './sections/typograpy';

registerThemeDark();

const getTitle = (collection?: Collection) => collection?.name ? `${collection.name} - Monthly Ranking` : 'Loading - Dynamic Trends';
const description = 'Dynamic charts describe the trends of GitHub repositories in a collection with four metrics（Star, Pull Request, Pull Request Creators, Issue）.'
const keywords = 'github,ossinsight,ranking,trends,animated bar chart,pipeline chart,line chart'.split(',')

function CollectionsTrendsPage() {
  return (
    <CollectionsPageLayout title={getTitle} description={description} keywords={keywords}>
      <P1>{description}</P1>
      <HistorySortSection />
      <HistoryRankSection />
      <HistorySection />
    </CollectionsPageLayout>
  );
}

export default CollectionsTrendsPage;
