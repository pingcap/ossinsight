import React, { PropsWithChildren } from 'react';
import { responsive } from './responsive';
import { Breakpoint } from '@mui/system';

import { Box, Container } from '@mui/material';

export interface SectionProps {
  darker?: boolean;
  pt?: number;
  id?: string;
  maxWidth?: Breakpoint | false;
  sideWidth?: string | undefined;
}

const dark = {
  default: '#242526',
  darker: '#1C1E21',
};

export default function Section ({ id, darker = false, pt, maxWidth = 'xl', sideWidth, children }: PropsWithChildren<SectionProps>) {
  return (
    <Box
      component='section'
      id={id}
      sx={[
        responsive('py', 2, 4, 6),
        {
          backgroundColor: darker ? dark.darker : dark.default,
          pt,
          marginLeft: sideWidth,
          paddingRight: sideWidth,
        },
      ]}
    >
      <Container maxWidth={maxWidth} sx={{ padding: 1 }}>
        {children}
      </Container>
    </Box>
  );
}
