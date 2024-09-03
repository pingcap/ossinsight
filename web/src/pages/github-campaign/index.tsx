import { HeadingSection } from '@site/src/pages/github-campaign/_sections/0-heading';
import { HowItWorks } from '@site/src/pages/github-campaign/_sections/1-how-it-works';
import { IntroductionsSection } from '@site/src/pages/github-campaign/_sections/2-introduction';
import { ReviewsSection } from '@site/src/pages/github-campaign/_sections/3-reviews';
import { ContributionsSection } from '@site/src/pages/github-campaign/_sections/4-contributions';
import { FaqSection } from '@site/src/pages/github-campaign/_sections/5-faq';
import { LegalSection } from '@site/src/pages/github-campaign/_sections/6-legal';
import CustomPage from '@site/src/theme/CustomPage';
import React from 'react';

export default function Page () {
  return (
    <CustomPage
      description={'The comprehensive Open Source Software insight tool by analyzing massive events from GitHub, powered by TiDB, the best insight building database of data agility.'}
      dark
      footer={false}
    >
      <HeadingSection />
      <HowItWorks />
      <IntroductionsSection />
      <ReviewsSection />
      <ContributionsSection />
      <FaqSection />
      <LegalSection />
    </CustomPage>
  );
}
