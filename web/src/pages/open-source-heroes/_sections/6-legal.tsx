import { Section, SectionContent, SectionTitle } from '@site/src/pages/open-source-heroes/_components/Section';
import React from 'react';
import { Collapse } from '../_components/Collapse';
// @ts-expect-error
import Legal from './6-legal.mdx';

export function LegalSection () {
  return (
    <Section>
      <SectionContent>
        <SectionTitle>
          Legal Statement
        </SectionTitle>
        <Collapse>
          <Legal />
        </Collapse>
      </SectionContent>
    </Section>
  );
}
