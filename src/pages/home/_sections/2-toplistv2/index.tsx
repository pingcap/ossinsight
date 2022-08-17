import React  from 'react';
import Section from '../../_components/Section';
import { TopListV2 } from "./TopListV2";
import { Body, H2 } from "../../_components/typography";

export function TopListV2Section() {

  return (
    <Section maxWidth={false}>
      <a href="#trending-repos">
      <H2 id="trending-repos" sx={{ fontSize: 24, mb: 2, color:'white' }} >🔥 Trending Repos</H2></a>
      <Body sx={{ mb: 4, mt: 2, fontSize: 14 }}>Active repositories ranked by star numbers. Query was filtered due to massive bots’ commits. </Body>
      <TopListV2 />
    </Section>
  );
}
