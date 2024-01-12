import React from 'react';
import Section from '../../_components/Section';
import { stackDirection } from '../../_components/StackItem';
import Left from './left';
import Right from './right';

import { Divider, Stack } from '@mui/material';

export function SummarySection () {
  return (
    <Section pt={4}>
      <Stack
        divider={<Divider orientation="vertical" flexItem />}
        direction={stackDirection}
      >
        <Left />
        <Right />
      </Stack>
    </Section>
  );
}
