import React from 'react';
import Section from '../../_components/Section';
import Collections from './Collections';
import { H2, Body } from '../../_components/typography';

export function CollectionsSection () {
  return (
    <Section darker maxWidth={false}>
      <H2 sx={{ fontSize: 24 }}>📖 Hot Collections</H2>
      <Body sx={{ mb: 4, mt: 2, fontSize: 14 }}>Insights about the monthly and historical rankings and trends in technical fields with curated repository lists.</Body>
      <Collections />
    </Section>
  );
}
