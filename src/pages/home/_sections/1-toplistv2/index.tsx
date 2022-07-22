import React, { useState } from 'react';
import Section from '../../_components/Section';
import Container from '@mui/material/Container';
import { TopListV2 } from "./TopListV2";
import { H2 } from "../../_components/typography";
import { usePeriods } from "./hook";

export function TopListV2Section() {
  const { select: periodSelect, value: period } = usePeriods();

  return (
    <Section darker>
      <Container>
        <H2 sx={{ fontSize: 24, mb: 2 }}>Top 20 GitHub Repositories in {periodSelect}</H2>
        <TopListV2 period={period.key} />
      </Container>
    </Section>
  );
}
