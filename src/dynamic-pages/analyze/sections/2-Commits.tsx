import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import React, { ForwardedRef, forwardRef } from 'react';
import Analyze from '../charts/Analyze';
import { useAnalyzeContext } from '../charts/context';
import { TimeHeatChart } from '../charts/heatmap';
import { LocChart } from '../charts/loc';
import { PushesAndCommitsChart } from '../charts/push-and-commits';
import Section from '../Section';
import { H2, H3, P2 } from '../typography';

export const CommitsSection = forwardRef(function ({}, ref: ForwardedRef<HTMLElement>) {
  const theme = useTheme()
  const isSmall = useMediaQuery(theme.breakpoints.down('md'))
  const { comparingRepoId: vs } = useAnalyzeContext()
  const commonAspectRatio = isSmall ? vs ? 4 / 3 : 4 / 3 : vs ? 16 / 9 : 20 / 9

  return (
    <Section id='commits' ref={ref}>
      <H2>Commits</H2>
      <Analyze query='analyze-pushes-and-commits-per-month'>
        <H3 id='commits-and-pushes-history' sx={{ mt: 6 }}>Commits & Pushes History</H3>
        <P2>
          The trend of the total number of commits/pushes per month in a repository since it was created.
          <br />
          * Note: A push action can include multiple commit actions.
        </P2>
        <PushesAndCommitsChart aspectRatio={commonAspectRatio} />
      </Analyze>
      <Analyze query='analyze-loc-per-month'>
        <H3 id='lines-of-code-changed' sx={{ mt: 6 }}>Lines of code changed</H3>
        <P2>
          The bars show the additions or deletions of code in Pull Requests monthly.
          <br />
          The line chart demonstrate the total lines of code in Pull Requests (additions + deletions).
        </P2>
        <LocChart aspectRatio={commonAspectRatio} />
      </Analyze>
      <Analyze query='commits-time-distribution'>
        <H3 id='commits-time-distribution' sx={{ mt: 6 }}>Commits Time Distribution</H3>
        <P2>
          The Heat Maps below describe the number of commit events that occur at a particular point of time (UTC+0).
        </P2>
        <Grid container>
          <Grid item xs={12} md={vs ? 12 : 6}>
            <TimeHeatChart aspectRatio={isSmall ? vs ? (4 / 3) : (5 / 3) : vs ? (24 / 7) : (24 / 14)}/>
          </Grid>
        </Grid>
      </Analyze>
    </Section>
  )
})
