import React from 'react';
import Analyze from '../Analyze';
import Bars from './Bars';
import Lines from './Lines';
import { CommitIcon, GitPullRequestIcon, IssueOpenedIcon, StarIcon } from '@primer/octicons-react';
import { Border } from './ui';
import { Grid } from '@mui/material';

function MonthlySummaryCard () {
  return (
    <Grid container direction="column" spacing={1} paddingTop='14.75px' height='100%'>
      <Grid item maxWidth='100% !important'>
        <Analyze query="analyze-recent-stars">
          <Border>
            <Bars
              icon={<StarIcon />}
              title="Stars"
              color="#F58A00"
              dayValueKey="current_period_day_stars"
              totalKey="current_period_stars"
            />
          </Border>
        </Analyze>
      </Grid>
      <Grid item container direction="row" spacing={1}>
        <Grid item xs={12} lg={6} width='100%'>
          <Analyze query="analyze-recent-pull-requests">
            <Border>
              <Lines
                icon={<GitPullRequestIcon />}
                title="Pull Requests"
                dayOpenedValueKey="current_period_opened_day_prs"
                dayClosedValueKey="current_period_merged_day_prs"
                totalOpenedValueKey="current_period_opened_prs"
                totalClosedValueKey="current_period_merged_prs"
                closedText="Merged"
              />
            </Border>
          </Analyze>
        </Grid>
        <Grid item xs={12} lg={6} width='100%'>
          <Analyze query="analyze-recent-issues">
            <Border>
              <Lines
                icon={<IssueOpenedIcon />}
                title="Issues"
                dayOpenedValueKey="current_period_opened_day_issues"
                dayClosedValueKey="current_period_closed_day_issues"
                totalOpenedValueKey="current_period_opened_issues"
                totalClosedValueKey="current_period_closed_issues"
                closedText="Closed"
              />
            </Border>
          </Analyze>
        </Grid>
      </Grid>
      <Grid item maxWidth='100% !important'>
        <Analyze query="analyze-recent-commits">
          <Border>
            <Bars
              icon={<CommitIcon />}
              title="Commits"
              color="#309CF2"
              dayValueKey="current_period_day_commits"
              totalKey="current_period_commits"
            />
          </Border>
        </Analyze>
      </Grid>
    </Grid>
  );
}

export default MonthlySummaryCard;
