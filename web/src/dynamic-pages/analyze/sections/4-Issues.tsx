import React, { ForwardedRef, forwardRef, useMemo } from 'react';
import Analyze from '../charts/Analyze';
import { DurationChart } from '../charts/common-duration';
import { useAnalyzeContext } from '../charts/context';
import { IssueChart } from '../charts/issue';
import Summary, { SummaryProps } from '../charts/summary';
import Section from '../Section';
import { H2, H3, P2 } from '../typography';
import { notNullish } from '@site/src/utils/value';

import { Grid, useTheme, useMediaQuery } from '@mui/material';

export const IssuesSection = forwardRef(function (_, ref: ForwardedRef<HTMLElement>) {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('md'));
  const { comparingRepoId: vs } = useAnalyzeContext();
  const commonAspectRatio = isSmall ? notNullish(vs) ? 4 / 3 : 4 / 3 : notNullish(vs) ? 16 / 9 : 20 / 9;

  const issuesSummaries: SummaryProps['items'] = useMemo(() => {
    return [
      { title: 'Total issues', alt: 'Total issues', field: 'issues' },
      { title: 'Creators', alt: 'Total issue creators', field: 'issue_creators' },
      { title: 'Comments', alt: 'Total issue comments', field: 'issue_comments' },
      { title: 'Commenters', alt: 'Total issue commenters', field: 'issue_commenters' },
    ];
  }, []);

  return (
    <Section id='issues' ref={ref}>
      <H2>Issues</H2>
      <Grid container spacing={2} alignItems='center'>
        <Grid item xs={12} md={notNullish(vs) ? 8 : 6}>
          <Summary items={issuesSummaries} query='analyze-repo-issue-overview' />
        </Grid>
      </Grid>
      <Analyze query='analyze-issue-open-to-first-responded'>
        <H3 id='issue-first-responded-time' sx={{ mt: 6 }}>Issue First Responded Time</H3>
        <P2>
          The time of an issue from open to first-responded(exclude bots).
          <br />
          p25/p75: 25%/75% issues are responded within X minute/hour/day.
          <br />
          e.g. p25: 1h means 25% issues are responded within 1 hour.
        </P2>
        <DurationChart aspectRatio={commonAspectRatio} />
      </Analyze>
      <Analyze query='analyze-issue-opened-and-closed'>
        <H3 id='issue-history' sx={{ mt: 6 }}>Issue History</H3>
        <P2>
          Monthly opened/closed issues and the historical totals.
        </P2>
        <IssueChart aspectRatio={commonAspectRatio} />
      </Analyze>
    </Section>
  );
});
