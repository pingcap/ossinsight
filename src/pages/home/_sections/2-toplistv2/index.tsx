import React  from 'react';
import Section from '../../_components/Section';
import { TopListV2 } from "./TopListV2";
import { Body, H2 } from "../../_components/typography";

export function TopListV2Section() {

  return (
    <Section id="trending-repos" maxWidth={false}>
      <a href="#trending-repos">
      <H2 sx={{ fontSize: 24, mb: 2, color:'white' }} >🔥 Trending Repos</H2></a>
      <Body sx={{ mb: 4, mt: 2, fontSize: 14 }}>Active repositories are ranked by the number of stars. Because bots make a massive number of commits, this query was filtered. </Body>
      <TopListV2 />
    </Section>
  );
}
