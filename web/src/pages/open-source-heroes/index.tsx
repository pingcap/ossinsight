import { HeadingSection } from '@site/src/pages/open-source-heroes/_sections/0-heading';
import { HowItWorks } from '@site/src/pages/open-source-heroes/_sections/1-how-it-works';
import { IntroductionsSection } from '@site/src/pages/open-source-heroes/_sections/2-introduction';
import { ReviewsSection } from '@site/src/pages/open-source-heroes/_sections/3-reviews';
import { ContributionsSection } from '@site/src/pages/open-source-heroes/_sections/4-contributions';
import { FaqSection } from '@site/src/pages/open-source-heroes/_sections/5-faq';
import { LegalSection } from '@site/src/pages/open-source-heroes/_sections/6-legal';
import CustomPage from '@site/src/theme/CustomPage';
import React from 'react';

export default function Page () {
  return (
    <CustomPage
      title={'Open Source Heroes Claim FREE TiDB Cloud Serverless Credits!'}
      description={'TiDB Cloud Serverless rewards your contributions with up to $1,000 in FREE credits to build modern, scalable, AI-powered applications. Power your next big idea with a powerful serverless database. Learn more & qualify!'}
      keywords={['opensource', 'database', 'cloud', 'developer', 'tidbserverless']}
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
