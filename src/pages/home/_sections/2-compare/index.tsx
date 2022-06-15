import Link from '@docusaurus/Link';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import React from 'react';
import AspectRatio from 'react-aspect-ratio';
import CompareHeader from '../../../../components/CompareHeader/CompareHeader';
import Image from '../../../../components/Image';
import Section from '../../_components/Section';
import { stackDirection } from '../../_components/StackItem';
import { H2, H2Plus, Subtitle } from '../../_components/typography';
import Left from './left';
import Right from './right';

export function CompareSection () {
  return (
    <Section>
      <Stack direction={stackDirection} alignItems='center'>
        <Left />
        <Right />
      </Stack>
    </Section>
  )
}