import React, {PropsWithChildren} from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";

export interface SectionProps{
  darker?: boolean
}

const dark = {
  default: '#242526',
  darker: '#1C1E21'
}

export default function Section ({darker = false, children}: PropsWithChildren<SectionProps>) {
  return (
    <Box
      component='section'
      sx={{
        py: 8,
        backgroundColor: darker ? dark.darker : dark.default
      }}
    >
      <Container maxWidth='xl'>
        {children}
      </Container>
    </Box>
  )
}