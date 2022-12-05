import React from 'react';
import Section from '../../_components/Section';
import { TopListV2 } from './TopListV2';
import { Body, H2 } from '../../_components/typography';
import Link from '@docusaurus/Link';

export function TopListV2Section () {
  return (
    <Section id="trending-repos" maxWidth={false}>
      <a href="#trending-repos">
      <H2 sx={{ fontSize: 24, mb: 2, color: 'white' }} >🔥 Trending Repos</H2></a>
      <Body sx={{ mb: 4, mt: 2, fontSize: 14 }}>
        We ranked all repositories with score. <b>Total Score = Stars score + Forks score + Base score</b>. See <Link href='https://github.com/pingcap/ossinsight/issues/778' target='_blank'>details</Link>.
      </Body>
      <TopListV2 />
    </Section>
  );
}
