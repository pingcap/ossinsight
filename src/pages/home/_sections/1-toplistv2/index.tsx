import React, { useState } from 'react';
import Section from '../../_components/Section';
import Container from '@mui/material/Container';
import { TopListV2 } from "./TopListV2";

export function TopListV2Section() {
  return (
    <Section darker>
      <Container>
        <TopListV2 />
      </Container>
    </Section>
  );
}
