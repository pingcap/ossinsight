import React  from 'react';
import Section from '../../_components/Section';
import Container from '@mui/material/Container';
import { TopListV2 } from "./TopListV2";
import { Body, H2 } from "../../_components/typography";
import { usePeriods } from "./hook";

export function TopListV2Section() {

  return (
    <Section>
      <Container>
        <H2 sx={{ fontSize: 24, mb: 2 }}>🔥 Top 20 GitHub Repositories </H2>
        <Body sx={{ mb: 4, mt: 2, fontSize: 14 }}>Active repositories ranked by star numbers. Query was filtered due to massive bots’ commits. </Body>
        <TopListV2 />
      </Container>
    </Section>
  );
}
