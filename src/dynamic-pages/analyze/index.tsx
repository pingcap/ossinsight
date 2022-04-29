import React, {useCallback, useMemo, useState} from 'react';
import {Switch, Route, useRouteMatch} from '@docusaurus/router';
import CustomPage from '../../theme/CustomPage';
import {useRepo} from '../../api/gh';
import {AnalyzeContext} from '../../analyze-charts/context';
import {LocChart} from '../../analyze-charts/loc';
import {PrChart} from '../../analyze-charts/pr';
import {DurationChart} from '../../analyze-charts/common-duration';
import Analyze from '../../analyze-charts/Analyze';
import Container from '@mui/material/Container';
import { IssueChart } from '../../analyze-charts/issue';
import {PushesAndCommitsChart} from '../../analyze-charts/push-and-commits';
import {CompaniesChart} from '../../analyze-charts/companies';
import {TimeHeatChart} from '../../analyze-charts/heatmap';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import {WorldMapChart} from '../../analyze-charts/worldmap';
import Summary, {SummaryProps} from '../../analyze-charts/summary';
import {GitCommitIcon, StarIcon, IssueOpenedIcon, RepoForkedIcon, PeopleIcon, CodeIcon, LinkExternalIcon} from '@primer/octicons-react'
import Grid from '@mui/material/Grid';
import {LineChart} from '../../analyze-charts/line';
import Section from './Section';
import {H1, H2, H3, H4, P1, P2} from './typography'
import List from '../../analyze-charts/list/List';
import {alpha2ToTitle} from '../../lib/areacode';

interface AnalyzePageParams {
  owner: string;
  repo: string;
}

const commonAspectRatio = 24 / 9

export default function AnalyzePage() {
  let {params: {owner, repo: repoName}} = useRouteMatch<AnalyzePageParams>();

  const name = `${owner}/${repoName}`
  const {data: repo} = useRepo(name);

  const [mapType, setMapType] = useState('stars-map')
  const handleChangeMapType = useCallback((event:  React.SyntheticEvent, value: string) => {
    setMapType(value)
  }, [])

  const [companyType, setCompanyType] = useState('analyze-stars-company')
  const handleChangeCompanyType = useCallback((event:  React.SyntheticEvent, value: string) => {
    setCompanyType(value)
  }, [])

  const summaries: SummaryProps['items'] = useMemo(() => {
    return [{
      icon: <StarIcon/>,
      title: 'Stars',
      query: 'stars-total',
      field: '*'
    },{
      icon: <GitCommitIcon/>,
      title: 'Commits',
      query: 'commits-total',
      field: '*'
    },{
      icon: <IssueOpenedIcon/>,
      title: 'Issues',
      query: 'issues-total',
      field: '*'
    },{
      icon: <RepoForkedIcon/>,
      title: 'Forks',
      data: repo?.forks,
    },{
      icon: <PeopleIcon/>,
      title: 'Contributors',
      query: 'committers-total',
      field: '*'
    },{
      icon: <CodeIcon/>,
      title: 'Language',
      data: repo?.language,
    }]
  }, [repo])

  return (
    <CustomPage>
      <AnalyzeContext.Provider value={{repoId: repo?.id, repoName: name}}>
        <Container maxWidth='xl'>
          <Section>
            <H1>
              <a href={`https://github.com/${name}`} target='_blank'>
                {name}
                &nbsp;
                <LinkExternalIcon size={28} />
              </a>
            </H1>
            <Grid container>
              <Grid item xs={6}>
                <Summary items={summaries} />
              </Grid>
              <Grid item xs={6}>
                <Analyze query='stars-history'>
                  <H2 analyzeTitle display='none'>Stars History</H2>
                  <LineChart spec={{valueIndex: 'total', name: 'Stars'}}/>
                </Analyze>
              </Grid>
            </Grid>
          </Section>
          <Section>
            <H2>Commits</H2>
            <Analyze query='analyze-pushes-and-commits-per-month'>
              <H3>Commits & Pushes History</H3>
              <P2>
                A commit is an individual change to a file (or set of files).
                <br />
                A Push may include several Commits.
              </P2>
              <PushesAndCommitsChart aspectRatio={commonAspectRatio} />
            </Analyze>
            <Analyze query='analyze-loc-per-month'>
              <H3>Lines of code changed</H3>
              <P2>
                The bars mean the additions or deletions of code.
                <br />
                The line chart means the total lines of code (additions + deletions).
              </P2>
              <LocChart aspectRatio={commonAspectRatio} />
            </Analyze>
            <Analyze query='commits-time-distribution'>
              <H3>Commits Time Distribution</H3>
              <P2>
                The Heat Maps below describe the number of commit events that occur at a particular point of time (UTC+0).
              </P2>
              <TimeHeatChart />
            </Analyze>
          </Section>
          <Section>
            <H2>Pull Requests</H2>
            <Analyze query='analyze-pull-requests-size-per-month'>
              <H3>Pull Request History</H3>
              <P2>
                xs, s, m, l, xl, xxl means the size of Pull Request. Learn more about 
                &nbsp;
                <a href='https://github.com/kubernetes/kubernetes/labels?q=size' target='_blank'>
                  PR size
                </a>
              </P2>
              <PrChart aspectRatio={commonAspectRatio} />
            </Analyze>
            <Analyze query='analyze-pull-request-open-to-merged'>
              <H3>Pull Request Time Cost</H3>
              <P2>
              p25: 25% Pull Requests are closed within X hour/day. 
                <br />
              e.g. p25: 1h means 25% Pull Requests are closed within 1 hour.
              </P2>
              <DurationChart aspectRatio={commonAspectRatio} />
            </Analyze>
          </Section>
          <Section>
            <H2>Issues</H2>
            <Analyze query='analyze-issue-open-to-first-responded'>
            <H3>Issue Time Cost</H3>
              <P2>
              p25: 25% Issues are closed within X hour/day. 
                <br />
              e.g. p25: 1h means 25% Issues are closed within 1 hour.
              </P2>
              <DurationChart aspectRatio={commonAspectRatio} />
            </Analyze>
            <Analyze query='analyze-issue-opened-and-closed'>
              <H3>Issue History</H3>
              <IssueChart aspectRatio={commonAspectRatio} />
            </Analyze>
          </Section>
          <Section>
            <H2>People</H2>
            <Analyze query={mapType}>
              <H3>Geographical Distribution</H3>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={mapType} onChange={handleChangeMapType}>
                  <Tab label={<H4>Stargazers</H4>} value='stars-map' />
                  <Tab label={<H4>Issue Creators</H4>} value='issue-creators-map' />
                  <Tab label={<H4>Pull Requests Creators</H4>} value='pull-request-creators-map' />
                </Tabs>
              </Box>
              <Grid container>
                <Grid item xs={9}>
                  <WorldMapChart />
                </Grid>
                <Grid item xs={3}>
                  <List title='Geo-Locations' n={10} valueIndex='count' nameIndex='country_or_area' percentIndex='percentage' transformName={alpha2ToTitle} />
                </Grid>
              </Grid>
            </Analyze>
            <Analyze query={companyType}>
              <H3 analyzeTitle={false}>Companies</H3>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={companyType} onChange={handleChangeCompanyType}>
                  <Tab label={<H4>Stargazers</H4>} value='analyze-stars-company' />
                  <Tab label={<H4>Issue Creators</H4>} value='analyze-issue-creators-company' />
                  <Tab label={<H4>Pull Requests Creators</H4>} value='analyze-pull-request-creators-company' />
                </Tabs>
              </Box>
              <Grid container>
                <Grid item xs={9}>
                  <CompaniesChart spec={{valueIndex: companyValueIndices[companyType]}} />
                </Grid>
                <Grid item xs={3}>
                  <List title='Companies' n={10} valueIndex={companyValueIndices[companyType]} nameIndex='company_name' percentIndex='proportion' />
                </Grid>
              </Grid>
            </Analyze>
          </Section>
        </Container>
      </AnalyzeContext.Provider>
    </CustomPage>
  );
}

const companyValueIndices = {
  'analyze-stars-company': 'stargazers',
  'analyze-issue-creators-company': 'issue_creators',
  'analyze-pull-request-creators-company': 'code_contributors'
}
