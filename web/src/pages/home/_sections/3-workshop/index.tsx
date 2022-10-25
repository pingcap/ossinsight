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
          <Body sx={{ mb: 4, mt: 2, fontSize: 14 }}>Would you like to gain insights about platforms other than GitHub? You’re in the right place. Our workshops will teach you how to build an insight for other kinds of source data, like NFTs, Twitter, or Stack Overflow.
          <br />
          <br />
           Please note: we are still creating some of these workshops. 
</Body>
          <Workshop />
        </Box>
        <Box flex={1} p={4}>
          <Image src={require('./image.png').default} style={{ height: 268, backgroundSize: 'contain' }} />
        </Box>
      </Stack>
    </Section>
  )
}