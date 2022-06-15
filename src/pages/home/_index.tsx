import React from 'react';
import CustomPage from '../../theme/CustomPage';
import { CollectionsSection, CompareSection, SummarySection, TopListSection } from './_sections';

export default function Home() {
  return (
    <CustomPage
      title={'OSS Insight'}
      description={'The comprehensive Open Source Software insight tool by analyzing massive events from GitHub, powered by TiDB, the best insight building database of data agility.'}
      dark
    >
      <SummarySection />
      <CollectionsSection />
      <CompareSection />
      <TopListSection />
    </CustomPage>
  );
}
