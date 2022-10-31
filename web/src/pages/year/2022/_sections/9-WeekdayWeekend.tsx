import Section, { SubSection } from "@site/src/pages/year/2022/_components/Section";
import React from "react";
import { PieChart, WeekdayDistributionData } from '../_components/charts';
import Insights from "@site/src/pages/year/2022/_components/Insights";

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
        <Insights mt={6}>{distributionInsight}</Insights>
        <WeekdayDistributionData
          sx={{
            width: '100%',
            maxWidth: 1316,
            marginLeft: 'auto',
            marginRight: 'auto',
            mt: 6
          }}
          data={require('../_charts/weekday-distribution.json')}
        />
      </SubSection>
    </Section>
  );
}

const title = 'Developer behavior distribution on weekdays and weekends';
const description = 'We queried the distribution of each event type over the seven days of the week.';
