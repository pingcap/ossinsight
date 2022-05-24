import React from 'react';
import { Collection } from './hooks/useCollection';
import CollectionsPageLayout from './layout';
import MonthRankSection from './sections/month-rank';

const getTitle = (collection?: Collection) => collection?.name;

function CollectionsPage() {
  return (
    <CollectionsPageLayout title={getTitle}>
      <MonthRankSection />
    </CollectionsPageLayout>
  );
}

export default CollectionsPage;
