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
        <Insights mt={[2,4,6]}>{distributionInsight}</Insights>
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

const distributionTitle = 'The distribution of specific events';
const distributionInsight = (
  <>
    PushEvent, WatchEvent and ForkEvent are not much different in Weekday and Weekend.
    PullRequestReviewEvent is the most different.
    WatchEvent and ForkEvent are more personal behaviors, PullRequestReviewEvents are more work behaviors,
    PushEvents are used more in personal projects.
    PushEvent, WatchEvent and ForkEvent account for a larger proportion of Weekend.
  </>
);
