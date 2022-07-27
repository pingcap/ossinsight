import { Body, H2 } from "../../_components/typography";
import Section from "../../_components/Section";
import React from "react";
import Workshop from "./Workshop";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Image from "../../../../components/Image";

export function WorkshopSection () {
  return (
    <Section maxWidth={false}>
      <Stack direction={['column', 'column', 'row']}>
        <Box flex={1.5}>
          <H2 sx={{ fontSize: 24, mb: 2 }}>🗓️ Workshops</H2>
          <Body sx={{ mb: 4, mt: 2, fontSize: 14 }}>Build another Insight tool with another data source rather than GitHub, then you’re in the right place.</Body>
          <Workshop />
        </Box>
        <Box flex={1} p={4}>
          <Image src={require('./image.png').default} style={{ height: 268, backgroundSize: 'contain' }} />
        </Box>
      </Stack>
    </Section>
  )
}