import React from 'react';
import Section from '../_components/Section';
import CountryEvents from '../_components/charts/CountryEvents';
import Split from '../_components/Split';
import Insights from '../_components/Insights';
import { Box } from '@mui/material';

export default function () {
  return (
    <Section
      title={title}
      description={description}
    >
      <Split mt={[1, 2, 3]}>
        <CountryEvents
          data={require('../_charts/country-data.json')}
          footnote={footnote}
        />
        <Box>
          {insights.map((insight, i) => (
            <Insights key={i} hideTitle={i !== 0}>{insight}</Insights>
          ))}
        </Box>
      </Split>
    </Section>
  );
}

const title = 'Geographic distribution of developer behavior';
const description = 'We queried the number of various events that occurred throughout the world from January 1 to September 30, 2022 and identified the top 10 countries by the number of events triggered by developers in these countries. The chart displays the proportion of each event type by country or region.';
const footnote = '* Time range: 2022.01.01-2022.09.30, excluding bot events';
const insights = [
  <>The events triggered in the top 10 countries account for about <strong>23.27%</strong> of all GitHub events. However, the number of developers from these countries is only <strong>10%</strong>.</>,
  <>🇺🇸 <strong>US developers</strong> are most likely to review code, with a <strong>PullRequestReviewEvent share of 6.15%</strong>.</>,
  <>🇨🇳 <strong>Chinese developers</strong> like to star repositories, with <strong>17.23% for WatchEvent and 2.7% for ForkEvent</strong>.</>,
  <>🇩🇪 <strong>German developers</strong> like to open issues and comments, with <strong>IssueEvent and CommentEvent accounting for 4.18% and 12.66%</strong> respectively.</>,
  <>🇰🇷 <strong>Korean developers</strong> prefer pushing directly to repositories (PushEvent).</>,
  <>🇯🇵 <strong>Japanese developers</strong> are most likely to submit code via pull requests, with a <strong>PullRequestEvent share of 10%</strong>.</>,
];
