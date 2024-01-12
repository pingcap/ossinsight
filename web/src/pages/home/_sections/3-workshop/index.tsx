import { Body, H2 } from '../../_components/typography';
import Section from '../../_components/Section';
import React from 'react';
import Workshop from './Workshop';
import Link from '@docusaurus/Link';

import { Stack, Box } from '@mui/material';

export function WorkshopSection () {
  return (
    <Section maxWidth={false}>
      <Stack direction={['column', 'column', 'row']}>
        <Box flex={1.5}>
          <H2 sx={{ fontSize: 24, mb: 2 }}>💡 How to build your own insight tool</H2>
          <Body sx={{ mb: 4, mt: 2, fontSize: 14 }}>Would you like to gain insights about platforms other than GitHub? You’re in the right place. Our <Link href='/docs/workshop' target='_blank'>tutorials</Link> teach you how to build an insight tool for other kinds of source data, like non-fungible tokens (NFTs), Twitter, and Stack Overflow.
</Body>
          <Workshop />
        </Box>
      </Stack>
    </Section>
  );
}
