import { useRouteMatch } from '@docusaurus/router';
import React from 'react';
import { registerThemeDark } from '../../components/BasicCharts';
import type { Collection } from '@ossinsight/api';
import CollectionsPageLayout from './layout';
import HistorySection from './sections/history';
import HistorySortSection from './sections/history-sort';

registerThemeDark();

const getTitle = (collection?: Collection) => collection?.name ? `${collection.name} - Popularity Trends` : 'Loading - Popularity Trends';
const description = 'Dynamic charts describe the trends of GitHub repositories in a collection with four metrics (Star, Pull Request, Pull Request Creators, Issue).'
const keywords = 'Dynamic charts,github,rankings,trends,animated bar chart,pipeline chart,line chart,gitHub repositories,github collection,github metrics'.split(',')

function CollectionsTrendsPage() {
  return (
    <CollectionsPageLayout title={getTitle} description={description} keywords={keywords}>
      <HistorySortSection />
      <HistorySection />
    </CollectionsPageLayout>
  );
}

export default CollectionsTrendsPage;
