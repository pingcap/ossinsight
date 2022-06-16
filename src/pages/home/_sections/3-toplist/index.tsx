import Container from '@mui/material/Container';
import React, { useState } from 'react';
import TopList from './TopList';
import Section from '../../_components/Section';

export function TopListSection () {
  const [period, setPeriod] = useState('last_hour')

  return (
    <Section darker>
      <Container maxWidth='lg'>
        <TopList period={period} onPeriodChange={setPeriod} />
      </Container>
    </Section>
  )
}