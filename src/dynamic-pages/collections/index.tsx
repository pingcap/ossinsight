import React from 'react';
import { Collection } from './hooks/useCollection';
import CollectionsPageLayout from './layout';
import MonthRankSection from './sections/month-rank';
import { P1 } from './sections/typograpy';

const getTitle = (collection?: Collection) => collection?.name ? `${collection.name} - Monthly Ranking` : 'Loading - Monthly Ranking';
const description = 'Table chart describes the monthly ranking of GitHub repositories in a collection with three metrics（Star, Pull Request, Issue）.'
const keywords = 'github,ossinsight,rankings,monthly,month-on-month'.split(',')

function CollectionsPage() {
  return (
    <CollectionsPageLayout title={getTitle} description={description} keywords={keywords}>
      <P1>{description}</P1>
      <MonthRankSection />
    </CollectionsPageLayout>
  );
}

export default CollectionsPage;
