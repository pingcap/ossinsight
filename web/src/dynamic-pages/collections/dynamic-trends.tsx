import React from 'react';
import type { Collection } from '@ossinsight/api';
import CollectionsPageLayout from './layout';
import HistorySection from './sections/history';
import HistorySortSection from './sections/history-sort';

const getTitle = (collection?: Collection) => collection?.name ? `${collection.name} - Popularity Trends` : 'Loading - Popularity Trends';
const description = 'The following dynamic charts show the popularity trends of GitHub repositories in this collection. You can display the popularity of repositories based on the number of stars, pull requests, pull request creators, and issues.';
const keywords = 'Dynamic charts,github,rankings,trends,animated bar chart,pipeline chart,line chart,gitHub repositories,github collection,github metrics'.split(',');

function CollectionsTrendsPage () {
  return (
    <CollectionsPageLayout title={getTitle} description={description} keywords={keywords}>
      <HistorySortSection />
      <HistorySection />
    </CollectionsPageLayout>
  );
}

export default CollectionsTrendsPage;
