import React from 'react';
import Analyze from '../Analyze';
import { CommitIcon, GitPullRequestIcon, IssueOpenedIcon, StarIcon } from '@primer/octicons-react';
import BarsCompare from './BarsCompare';
import { Border } from './ui';
import LinesCompare from './LinesCompare';
import TopContributors from './TopContributors';
import Map from './Map';

import { Grid, Box, Typography } from '@mui/material';

export function MonthlyDetailsCard () {
  return (
    <Grid container spacing={1}>
      <Grid container item xs={12} lg={6} direction="column" spacing={1}>
        <Grid item maxWidth='100% !important'>
          <Analyze query="analyze-recent-stars">
            <Border>
              <BarsCompare
                icon={<StarIcon />}
                title="Stars"
                color="#F58A00"
                dayValueKey="period_day_stars"
                totalKey="period_stars"
              />
            </Border>
          </Analyze>
        </Grid>
        <Grid item flex={1} maxWidth='100% !important'>
          <Border style={{ width: '100%', height: '100%' }}>
            <Analyze query="analyze-stars-map" params={{ period: 'last_28_days' }}>
              <Map />
            </Analyze>
          </Border>
        </Grid>
        <Grid item maxWidth='100% !important'>
          <Analyze query="analyze-recent-top-contributors">
            <Border>
              <TopContributors />
            </Border>
          </Analyze>
        </Grid>
      </Grid>
      <Grid container item xs={12} lg={6} direction="column" spacing={1}>
        <Grid item maxWidth='100% !important'>
          <Analyze query="analyze-recent-issues">
            <Border>
              <Typography fontSize={16} fontWeight="bold">
                <IssueOpenedIcon />
                &nbsp;
                Issues
              </Typography>
              <Box height={8} />
              <LinesCompare
                title="Opened"
                color="#63C16D"
                dayValueKey="period_opened_day_issues"
                totalKey="period_opened_issues"
              />
              <Box height={8} />
              <LinesCompare
                title="Closed"
                color="#904DC9"
                dayValueKey="period_closed_day_issues"
                totalKey="period_closed_issues"
              />
            </Border>
          </Analyze>
        </Grid>
        <Grid item maxWidth='100% !important'>
          <Analyze query="analyze-recent-pull-requests">
            <Border>
              <Typography fontSize={16} fontWeight="bold">
                <GitPullRequestIcon />
                &nbsp;
                Pull Requests
              </Typography>
              <Box height={8} />
              <LinesCompare
                title="Opened"
                color="#63C16D"
                dayValueKey="period_opened_day_prs"
                totalKey="period_opened_prs"
              />
              <Box height={8} />
              <LinesCompare
                title="Merged"
                color="#904DC9"
                dayValueKey="period_merged_day_prs"
                totalKey="period_merged_prs"
              />
            </Border>
          </Analyze>
        </Grid>
        <Grid item maxWidth='100% !important'>
          <Analyze query="analyze-recent-commits">
            <Border>
              <BarsCompare
                icon={<CommitIcon />}
                title="Commits"
                color="#309CF2"
                dayValueKey="period_day_commits"
                totalKey="period_commits"
              />
            </Border>
          </Analyze>
        </Grid>
      </Grid>
    </Grid>
  );
}
