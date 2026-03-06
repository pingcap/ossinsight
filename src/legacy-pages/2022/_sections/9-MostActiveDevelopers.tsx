import React from 'react';
import Section from '../_components/Section';
import { MostActiveDevelopersChart } from '../_components/charts';
import Insights from '../_components/Insights';
import { Stack } from '@mui/material';

export default function () {
  return (
    <Section
      title={title}
      description={description}
      descriptionProps={{ maxWidth: 849 }}
    >
      <Stack
        mt={[1, 2, 4]}
        direction={['column', 'column', 'row']}
        justifyContent='space-between'
        columnGap={4}
      >
        <div style={{ flex: 1 }}>
          <MostActiveDevelopersChart
            sx={{ maxWidth: 977 }}
            footnote={footnote}
          />
        </div>
        <Insights title='95%' sx={{ maxWidth: 458 }}>
          {insight}
        </Insights>
      </Stack>
    </Section>
  );
}

const title = 'The most active developers since 2011';
const description = "We queried the top 20 most active developers per year since 2011. This time we didn't filter out bot events.";
const footnote = '* Time range: 2022.01.01-2022.09.30';
const insight = 'We found that the percentage of bots is becoming larger and larger. Bots started to overtake humans in 2013 and have reached over 95% in 2022.';
