import React, { ForwardedRef, forwardRef } from 'react';
import Analyze from '../charts/Analyze';
import { useAnalyzeContext } from '../charts/context';
import { TimeHeatChart } from '../charts/heatmap';
import { LocChart } from '../charts/loc';
import { PushesAndCommitsChart } from '../charts/push-and-commits';
import Section from '../Section';
import { H2, H3, P2 } from '../typography';
import { useSelectParam } from '../../../components/params';
import { notNullish } from '@site/src/utils/value';

import { Grid, useTheme, useMediaQuery, Stack } from '@mui/material';

const PERIOD_OPTIONS = [{
  key: 'last_1_year',
  title: 'Last 1 year',
}, {
  key: 'last_3_year',
  title: 'Last 3 years',
}, {
  key: 'all_times',
  title: 'All times',
}];

const ZONE_OPTIONS: Array<{ key: number, title: string }> = [];

for (let i = -12; i <= 13; i++) {
  ZONE_OPTIONS.push({
    key: i,
    title: i > 0 ? `+${i}` : i === 0 ? '0' : `${i}`,
  });
}

// https://stackoverflow.com/questions/6939685/get-client-time-zone-from-browser
const DEFAULT_ZONE = Math.max(Math.min(Math.round(12 - ((new Date()).getTimezoneOffset() / 60)), ZONE_OPTIONS.length - 1), 0);

export const CommitsSection = forwardRef(function (_, ref: ForwardedRef<HTMLElement>) {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('md'));
  const { comparingRepoId: vs } = useAnalyzeContext();
  const { select: periodSelect, value: period } = useSelectParam<string, false>(PERIOD_OPTIONS, PERIOD_OPTIONS[0], 'Period');
  const { select: zoneSelect, value: zone } = useSelectParam<number, false>(ZONE_OPTIONS, ZONE_OPTIONS[DEFAULT_ZONE], 'Zone');
  const commonAspectRatio = isSmall ? notNullish(vs) ? 4 / 3 : 4 / 3 : notNullish(vs) ? 16 / 9 : 20 / 9;

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
      <Analyze query='commits-time-distribution' params={{ period: period.key }}>
        <H3 id='commits-time-distribution' sx={{ mt: 6 }}>Commits Time Distribution</H3>
        <P2>
          The Heat Maps below describe the number of commit events that occur at a particular point of time (UTC+0).
        </P2>
        <Stack direction='row' spacing={1}>
          {periodSelect}
          {zoneSelect}
        </Stack>
        <Grid container>
          <Grid item xs={12} md={notNullish(vs) ? 12 : 6}>
            <TimeHeatChart aspectRatio={isSmall ? notNullish(vs) ? (4 / 3) : (5 / 3) : notNullish(vs) ? (24 / 7) : (24 / 14)} spec={{ zone: zone.key }}/>
          </Grid>
        </Grid>
      </Analyze>
    </Section>
  );
});
