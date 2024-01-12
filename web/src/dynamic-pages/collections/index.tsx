import React from 'react';
import type { Collection } from '@ossinsight/api';
import CollectionsPageLayout from './layout';
import MonthRankSection from './sections/month-rank';
import HistoryRankSection from './sections/history-rank';

const getTitle = (collection?: Collection) => collection?.name ? `${collection.name} - Ranking` : 'Loading - Ranking';
const description = 'Last 28 days / Monthly ranking of repos in this collection by stars, pull requests, issues. Historical Ranking by Popularity.';
const keywords = 'monthly ranking,github,gitHub repositories,github collection,github metrics, Month-on-Month Ranking,Historical Ranking'.split(',');

function CollectionsPage () {
  return (
    <CollectionsPageLayout title={getTitle} description={description} keywords={keywords}>
      <MonthRankSection />
      <HistoryRankSection />
    </CollectionsPageLayout>
  );
}

export default CollectionsPage;
