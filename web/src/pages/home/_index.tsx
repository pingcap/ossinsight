import React from 'react';
import CustomPage from '../../theme/CustomPage';
import { CollectionsSection, SummarySection, TopListV2Section, WorkshopSection } from './_sections';

export default function Home () {
  return (
    <CustomPage
      description={'The comprehensive Open Source Software insight tool by analyzing massive events from GitHub, powered by TiDB, the best insight building database of data agility.'}
      dark
      image="/img/screenshots/homepage.png"
    >
      <SummarySection />
      <TopListV2Section />
      <CollectionsSection />
      <WorkshopSection />
    </CustomPage>
  );
}
