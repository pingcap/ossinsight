import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import React, { ForwardedRef, forwardRef, useMemo } from 'react';
import Analyze from '../../../analyze-charts/Analyze';
import { DurationChart } from '../../../analyze-charts/common-duration';
import { useAnalyzeContext } from '../../../analyze-charts/context';
import { IssueChart } from '../../../analyze-charts/issue';
import Summary, { SummaryProps } from '../../../analyze-charts/summary';
import Section from '../Section';
import { H2, H3, P2 } from '../typography';

export const IssuesSection = forwardRef(function ({}, ref: ForwardedRef<HTMLElement>) {
  const theme = useTheme()
  const isSmall = useMediaQuery(theme.breakpoints.down('md'))
  const { comparingRepoId: vs } = useAnalyzeContext()
  const commonAspectRatio = isSmall ? vs ? 4 / 3 : 4 / 3 : vs ? 16 / 9 : 20 / 9

  const issuesSummaries: SummaryProps['items'] = useMemo(() => {
    return [
      {title: 'Total issues', query: "issues-total", field: '*'},
      {title: 'Total issue creators', query: 'issue-creators-total', field: '*'},
      {title: 'Total issue comments', query: 'issue-comments-total', field: '*'},
      {title: 'Total issue commenters', query: 'issue-commenters-total', field: '*'},
    ]
  }, [])

  return (
    <Section id='issues' ref={ref}>
      <H2>Issues</H2>
      <Grid container spacing={2} alignItems='center'>
        <Grid item xs={12} md={vs ? 8 : 6}>
          <Summary items={issuesSummaries} />
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
  )
})
