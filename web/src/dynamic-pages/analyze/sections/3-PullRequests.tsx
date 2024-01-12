import React, { ForwardedRef, forwardRef, useMemo } from 'react';
import Analyze from '../charts/Analyze';
import { DurationChart } from '../charts/common-duration';
import { useAnalyzeContext } from '../charts/context';
import { PrChart } from '../charts/pr';
import Summary, { SummaryProps } from '../charts/summary';
import Section from '../Section';
import { H2, H3, P2 } from '../typography';
import { notNullish } from '@site/src/utils/value';

import { Grid, useTheme, useMediaQuery } from '@mui/material';

export const PullRequestsSection = forwardRef(function (_, ref: ForwardedRef<HTMLElement>) {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('md'));
  const { comparingRepoId: vs } = useAnalyzeContext();
  const commonAspectRatio = isSmall ? notNullish(vs) ? 4 / 3 : 4 / 3 : notNullish(vs) ? 16 / 9 : 20 / 9;

  const prSummaries: SummaryProps['items'] = useMemo(() => {
    return [
      { title: 'Total PRs', alt: 'Total PRs', field: 'pull_requests' },
      { title: 'Creators', alt: 'Total PR creators', field: 'pull_request_creators' },
      { title: 'Reviews', alt: 'Total PR reviews', field: 'pull_request_reviews' },
      { title: 'Reviewers', alt: 'Total PR reviewers', field: 'pull_request_reviewers' },
    ];
  }, []);

  return (
    <Section id='pull-requests' ref={ref}>
      <H2>Pull Requests</H2>
      <Grid container spacing={2} alignItems='center'>
        <Grid item xs={12} md={notNullish(vs) ? 8 : 6}>
          <Summary items={prSummaries} query='analyze-repo-pr-overview' />
        </Grid>
      </Grid>
      <Analyze query='analyze-pull-requests-size-per-month'>
        <H3 id='pr-history' sx={{ mt: 6 }}>Pull Request History</H3>
        <P2>
          We divide the size of Pull Request into six intervals, from xs to xxl (based on the changes of code lines). Learn more about
          &nbsp;
          <a href='https://github.com/kubernetes/kubernetes/labels?q=size' target='_blank' rel="noreferrer">
            PR size
          </a>.
        </P2>
        <PrChart aspectRatio={commonAspectRatio} />
      </Analyze>
      <Analyze query='analyze-pull-request-open-to-merged'>
        <H3 id='pr-time-cost' sx={{ mt: 6 }}>Pull Request Time Cost</H3>
        <P2>
          The time of a Pull Request from submitting to merging.
          <br />
          p25/p75: 25%/75% Pull Requests are merged within X minute/hour/day.
          <br />
          e.g. p25: 1h means 25% Pull Requests are merged within 1 hour.
        </P2>
        <DurationChart aspectRatio={commonAspectRatio} />
      </Analyze>
    </Section>
  );
});
