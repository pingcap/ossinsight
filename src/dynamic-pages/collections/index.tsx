import React from 'react';
import { Collection } from './hooks/useCollection';
import CollectionsPageLayout from './layout';
import MonthRankSection from './sections/month-rank';
import HistoryRankSection from './sections/history-rank';

const getTitle = (collection?: Collection) => collection?.name ? `${collection.name} - Ranking` : 'Loading - Ranking';
const description = 'Monthly ranking of repos in this collection by stars, pull requests, issues. Historical Ranking by Popularity.'
const keywords = 'github,ossinsight,rankings,monthly,month-on-month'.split(',')

function CollectionsPage() {
  return (
    <CollectionsPageLayout title={getTitle} description={description} keywords={keywords}>
      <MonthRankSection />
      <HistoryRankSection />
    </CollectionsPageLayout>
  );
}

export default CollectionsPage;
