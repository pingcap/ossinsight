import React from 'react';
import {Switch, Route, useRouteMatch} from '@docusaurus/router';
import CustomPage from '../../theme/CustomPage';
import {useRepo} from '../../api/gh';
import {AnalyzeContext} from '../../analyze-charts/context';
import {LocChart} from '../../analyze-charts/loc';
import {PrChart} from '../../analyze-charts/pr';
import {PrDurationChart} from '../../analyze-charts/pr-duration';
import Analyze from '../../analyze-charts/Analyze';
import Container from '@mui/material/Container';
import { IssueChart } from '../../analyze-charts/issue';
import {PushesAndCommitsChart} from '../../analyze-charts/push-and-commits';

interface AnalyzePageParams {
  owner: string;
  repo: string;
}

export default function AnalyzePage() {
  let {params: {owner, repo: repoName}} = useRouteMatch<AnalyzePageParams>();

  const {data: repo} = useRepo(`${owner}/${repoName}`);

  return (
    <CustomPage>
      <AnalyzeContext.Provider value={{repoId: repo?.id}}>
        <Container maxWidth='md'>
          <Analyze query='analyze-loc-per-month'>
            <h2>Lines of changes</h2>
            <LocChart />
          </Analyze>
          <Analyze query='analyze-pull-requests-size-per-month'>
            <h2>PR</h2>
            <PrChart />
          </Analyze>
          <Analyze query='analyze-pull-request-open-to-merged'>
            <h2>PR Duration</h2>
            <PrDurationChart />
          </Analyze>
          <Analyze query='analyze-issue-opened-and-closed'>
            <h2>Issues</h2>
            <IssueChart />
          </Analyze>
          <Analyze query='analyze-pushes-and-commits-per-month'>
            <h2>Push and commits</h2>
            <PushesAndCommitsChart />
          </Analyze>

        </Container>
      </AnalyzeContext.Provider>
    </CustomPage>
  );
}