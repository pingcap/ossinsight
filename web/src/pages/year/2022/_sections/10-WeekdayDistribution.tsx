import React from "react";
import Section from '../_components/Section';
import Insights from '../_components/Insights';
import { WeekdayDistributionData } from "@site/src/pages/year/2022/_components/charts";

export default function () {
  return (
    <Section title={title}>
      <Insights mt={6}>{insight}</Insights>
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
    </Section>
  );
}

const title = 'The distribution of specific events';
const insight = (
  <>
    PushEvent, WatchEvent and ForkEvent are not much different in Weekday and Weekend.
    PullRequestReviewEvent is the most different.
    WatchEvent and ForkEvent are more personal behaviors, PullRequestReviewEvents are more work behaviors,
    PushEvents are used more in personal projects.
    PushEvent, WatchEvent and ForkEvent account for a larger proportion of Weekend.
  </>
);