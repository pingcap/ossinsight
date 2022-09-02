import React, {PropsWithChildren} from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import {responsive} from './responsive'
import { Breakpoint } from "@mui/system";

export interface SectionProps{
  darker?: boolean
  pt?: number
  id?: string
  maxWidth?: Breakpoint | false
}

const dark = {
  default: '#242526',
  darker: '#1C1E21',
}

export default function Section ({id, darker = false, pt, maxWidth = 'xl', children}: PropsWithChildren<SectionProps>) {
  return (
    <Box
      component='section'
      id={id}
      sx={[
        responsive('py', 2, 4, 6),
        {
          backgroundColor: darker ? dark.darker : dark.default,
          pt
        },
      ]}
    >
      <Container maxWidth={maxWidth} sx={{ padding: 1 }}>
        {children}
      </Container>
    </Box>
  )
}