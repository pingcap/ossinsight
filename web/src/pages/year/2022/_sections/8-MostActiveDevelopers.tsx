import React from 'react'
import Section from '../_components/Section'
import { MostActiveDevelopersChart } from "../_components/charts";
import Stack from "@mui/material/Stack";
import Insights from '../_components/Insights'

export default function () {

  return (
    <Section
      title={title}
      description={description}
      descriptionProps={{ maxWidth: 849 }}
    >
      <Stack
        mt={4}
        direction={['column', 'column', 'row']}
        justifyContent='space-between'
      >
        <div style={{ flex: 1 }}>
          <MostActiveDevelopersChart sx={{ maxWidth: 977 }} />
        </div>
        <Insights title='95%' sx={{ maxWidth: 458 }}>
          {insight}
        </Insights>
      </Stack>
    </Section>
  )
}

const title = 'The most active developers since 2011'
const description = "We queried the top 20 most active developers per year since 2011. This time we didn't filter out bot events."
const insight = 'We found that the percentage of bots is becoming larger and larger. Bots started to overtake humans in 2013 and have reached over 95% in 2022.'

