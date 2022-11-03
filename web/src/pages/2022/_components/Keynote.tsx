import React, { ReactNode } from 'react';
import { H4, P1 } from './typograph';
import { Box } from '@mui/material';

export interface KeynoteProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export default function Keynote ({ icon, title, description }: KeynoteProps) {
  return (
    <Box maxWidth={418}>
      <Box>
        {icon}
      </Box>
      <H4 mt={2}>
        {title}
      </H4>
      <P1 mt={2}>
        {description}
      </P1>
    </Box>
  );
}
