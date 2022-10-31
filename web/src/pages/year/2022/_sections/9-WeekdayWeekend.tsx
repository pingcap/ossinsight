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

<<<<<<< HEAD
const title = 'Developer behavior distribution on weekdays and weekends';
const description = 'We queried the distribution of each event type over the seven days of the week.';
=======
const title = 'Behavior distribution by Weekdays/Weekends';
const description = 'We query the event distribution for each Weekday/Weekend in 2022 and calculate the distribution of each event on 7 days of the week and the distribution of events for each day.';

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
>>>>>>> 3d598da9129fd6e2b961cd49c80f727c5ea09807
