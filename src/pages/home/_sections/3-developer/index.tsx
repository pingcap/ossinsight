import Stack from '@mui/material/Stack';
import React from 'react';
import Section from '../../_components/Section';
import { stackDirection } from '../../_components/StackItem';
import Left from './left';
import Right from './right';

export function DeveloperSection() {
  return (
    <Section>
      <Stack direction={stackDirection} alignItems="center">
        <Left />
        <Right />
      </Stack>
    </Section>
  );
}