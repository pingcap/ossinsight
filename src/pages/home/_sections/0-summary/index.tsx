import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import React from 'react';
import Section from '../../_components/Section';
import { stackDirection } from '../../_components/StackItem';
import Left from './left';
import Right from './right';


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


