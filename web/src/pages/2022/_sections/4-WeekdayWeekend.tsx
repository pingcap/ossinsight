import Section, { SubSection } from '../_components/Section';
import React from 'react';
import { PieChart, WeekdayDistributionData } from '../_components/charts';
import Insights from '../_components/Insights';
import { BR } from '../_components/styled';

export default function () {
  return (
    <Section
      title={title}
      description={description}
      descriptionProps={{ maxWidth: 1165 }}
    >
      <SubSection>
        <PieChart
          sx={theme => ({
            [theme.breakpoints.up('md')]: {
              maxHeight: 400,
            },
            height: 500,
            mt: 6,
          })}
        />
      </SubSection>
      <SubSection title={distributionTitle}>
        <Insights mt={[2, 4, 6]}>{distributionInsight}</Insights>
        <WeekdayDistributionData
          sx={{
            width: '100%',
            maxWidth: 1316,
            marginLeft: 'auto',
            marginRight: 'auto',
            mt: 6,
          }}
          data={require('../_charts/weekday-distribution.json')}
        />
      </SubSection>
    </Section>
  );
}

const title = 'Developer behavior distribution on weekdays and weekends';
const description = 'We queried the distribution of each event type over the seven days of the week.';

const distributionTitle = 'The distribution of specific events';
const distributionInsight = (
  <>
    Pull Request Event, Pull Request Review Event, and Issues Event all have the highest percentage on Tuesdays, while the lowest percentage is on the weekends.
    <BR />
    The amount of Push Event, Watch Event, and Fork Event activities are similar on weekdays and weekends, while the Pull Request Review Event is the most different. Watch Event and Fork Event are more personal behaviors, Pull Request Review Events are more work behaviors, and Push Events are used more in personal projects.
  </>
);
