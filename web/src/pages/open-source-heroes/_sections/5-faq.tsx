import { Section, SectionContent, SectionTitle } from '@site/src/pages/open-source-heroes/_components/Section';
import React from 'react';
// @ts-expect-error
import Faq from './5-faq.mdx';

export function FaqSection () {
  return (
    <Section>
      <SectionContent>
        <SectionTitle>
          FAQ
        </SectionTitle>
        <Faq />
      </SectionContent>
    </Section>
  );
}
