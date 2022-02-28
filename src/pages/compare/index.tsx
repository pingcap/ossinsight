import React, {useState} from 'react'

import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Head from '@docusaurus/Head';
import Layout from '@theme/Layout';
import useThemeContext from "@theme/hooks/useThemeContext";

import {LocalizationProvider} from "@mui/lab";
import DateAdapter from "@mui/lab/AdapterLuxon";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import basicStyle from './index.module.css';

import ThemeAdaptor from "../../components/ThemeAdaptor";
import CompareHeader from "../../components/CompareHeader/CompareHeader";
import StatisticCard from "../../components/RemoteCards/StatisticCard";
import LineAreaBarChartCard from "../../components/RemoteCards/LineAreaBarChartCard";
import HeatMapChartCard from "../../components/RemoteCards/HeatMapChartCard";
import PieChartCard from "../../components/RemoteCards/PieChartCard";

import {getRandomColor} from "../../lib/color";
import {areaCodeToName} from "../../lib/areacode";
import {registerThemeDark, registerThemeLight} from "../../components/RemoteCharts/theme";


export interface Repo {
  name: string;
  color: string;
}

const allProvidedRepos = (repos: Repo[]) => {
  return repos.filter((r) => {
    return r !== undefined && r?.name !== undefined;
  });
};

const allReposProvided = (repos: Repo[]) => {
  return repos.filter((r) => {
    return r !== undefined && r?.name !== undefined;
  }).length === repos.length;
};

const anyReposProvided = (repos: Repo[]) => {
  return repos.filter((r) => {
    return r !== undefined && r?.name !== undefined;
  }).length > 0;
};

const StarNumbers = ({ repo, dateRange }) => {
  return <Grid container spacing={1}>
    <Grid item xs={4}>
      <StatisticCard
        title={'Stars total'}
        queryName="stars-total"
        params={{repoName: repo?.name, dateRange: dateRange}}
        shouldLoad={allReposProvided([repo])}
        noLoadReason="Need select repo."
        height="150px"
      />
    </Grid>
    <Grid item xs={4}>
      <StatisticCard
        title={'Avg stars / week'}
        queryName="stars-average-by-week"
        params={{repoName: repo?.name, dateRange: dateRange}}
        shouldLoad={allReposProvided([repo])}
        noLoadReason="Need select repo."
        height="150px"
      />
    </Grid>
    <Grid item xs={4}>
      <StatisticCard
        title={'Max stars / week'}
        queryName="stars-max-by-week"
        params={{repoName: repo?.name, dateRange: dateRange}}
        shouldLoad={allReposProvided([repo])}
        noLoadReason="Need select repo."
        height="150px"
      />
    </Grid>
  </Grid>;
}

const PullRequestNumbers = ({ repo, dateRange }) => {
  return <>
    <Grid container spacing={1}>
      <Grid item xs={4}>
        <StatisticCard
          title={'Pull requests'}
          queryName="pull-requests-total"
          params={{repoName: repo?.name, dateRange: dateRange}}
          shouldLoad={allReposProvided([repo])}
          noLoadReason="Need select repo."
          height="150px"
        />
      </Grid>
      <Grid item xs={4}>
        <StatisticCard
          title={'PR creators'}
          queryName="pull-request-creators-total"
          params={{repoName: repo?.name, dateRange: dateRange}}
          shouldLoad={allReposProvided([repo])}
          noLoadReason="Need select repo."
          height="150px"
        />
      </Grid>
    </Grid>
    <Grid container spacing={1}>
      <Grid item xs={4}>
        <StatisticCard
          title={'Pull request reviews'}
          queryName="pull-request-reviews-total"
          params={{repoName: repo?.name, dateRange: dateRange}}
          shouldLoad={allReposProvided([repo])}
          noLoadReason="Need select repo."
          height="150px"
        />
      </Grid>
      <Grid item xs={4}>
        <StatisticCard
          title={'Pull request reviewers'}
          queryName="pull-request-reviewers-total"
          params={{repoName: repo?.name, dateRange: dateRange}}
          shouldLoad={allReposProvided([repo])}
          noLoadReason="Need select repo."
          height="150px"
        />
      </Grid>
    </Grid>
  </>;
}

const IssueNumbers = ({ repo, dateRange }) => {
  return <>
    <Grid container spacing={1}>
      <Grid item xs={4}>
        <StatisticCard
          title={'Issues'}
          queryName="issues-total"
          params={{repoName: repo?.name, dateRange: dateRange}}
          shouldLoad={allReposProvided([repo])}
          noLoadReason="Need select repo."
          height="150px"
        />
      </Grid>
      <Grid item xs={4}>
        <StatisticCard
          title={'Issue creators'}
          queryName="issue-creators-total"
          params={{repoName: repo?.name, dateRange: dateRange}}
          shouldLoad={allReposProvided([repo])}
          noLoadReason="Need select repo."
          height="150px"
        />
      </Grid>
    </Grid>
    <Grid container spacing={1}>
      <Grid item xs={4}>
        <StatisticCard
          title={'Issue comments'}
          queryName="issue-comments-total"
          params={{repoName: repo?.name, dateRange: dateRange}}
          shouldLoad={allReposProvided([repo])}
          noLoadReason="Need select repo."
          height="150px"
        />
      </Grid>
      <Grid item xs={4}>
        <StatisticCard
          title={'Issue commenters'}
          queryName="issue-commenters-total"
          params={{repoName: repo?.name, dateRange: dateRange}}
          shouldLoad={allReposProvided([repo])}
          noLoadReason="Need select repo."
          height="150px"
        />
      </Grid>
    </Grid>
  </>;
}

const MainContent = (props) => {
  const {isDarkTheme} = useThemeContext();
  return <main className={basicStyle.mainContent} style={{
    backgroundColor: isDarkTheme ? '#18191a' : '#f9fbfc'
  }}>
    {props.children}
  </main>
}

registerThemeLight();
registerThemeDark();

export default function RepoCompare() {
  const {siteConfig} = useDocusaurusContext();

  const [repo1, setRepo1] = useState<Repo>();
  const [repo2, setRepo2] = useState<Repo>();
  const [dateRange, setDateRange] = useState([]);

  return (
    <Layout>
      <LocalizationProvider dateAdapter={DateAdapter}>
        <ThemeAdaptor>
          <Head>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Lato:300,400,500,700&display=swap"/>
            <title>Project Compare | {siteConfig.title}</title>
          </Head>
          <CompareHeader
            onRepo1Change={(newRepo1) => {
              setRepo1(newRepo1);
            }}
            onRepo2Change={(newRepo2) => {
              setRepo2(newRepo2);
            }}
            onDateRangeChange={(newDateRange) => {
              setDateRange(newDateRange);
            }}
          />
          <MainContent>
            <Grid container spacing={2}>
              <Grid item sm={6} xs={12}>
                <Typography variant="h4" gutterBottom component="div">{repo1?.name || 'Repo Name 1'}</Typography>
              </Grid>
              <Grid item sm={6} xs={12}>
                <Typography variant="h4" gutterBottom component="div">{repo2?.name || 'Repo Name 2'}</Typography>
              </Grid>
            </Grid>
            {/*  Stars  */}
            <Typography variant="h5" gutterBottom component="div">Stars</Typography>
            <Grid container spacing={2}>
              {/*  Star - Number  */}
              <Grid item sm={6} xs={12}>
                <StarNumbers repo={repo1} dateRange={dateRange}/>
              </Grid>
              <Grid item sm={6} xs={12}>
                <StarNumbers repo={repo2} dateRange={dateRange}/>
              </Grid>
            </Grid>
            {/*  Stars - History  */}
            <LineAreaBarChartCard
              title={'Stars History'}
              queryName={"stars-history"}
              params={{
                repoName1: repo1?.name,
                repoName2: repo2?.name,
                dateRange: dateRange
              }}
              shouldLoad={allReposProvided([repo1, repo2])}
              noLoadReason="Need select repo."
              seriesColumnName="repo_name"
              series={allProvidedRepos([repo1, repo2]).map((r) => {
                return {
                  name: r.name,
                  color: r.color || getRandomColor(),
                  axisLabel: {
                    formatter: '{yyyy} {MMM}'
                  }
                };
              })}
              xAxis={{
                type: "time",
                name: "event_month"
              }}
              yAxis={{
                type: "value",
                name: "total"
              }}
              height="500px"
            />
            <Grid container spacing={2}>
              {/*  Star - Map  */}
              <Grid item sm={6} xs={12}>
                <PieChartCard
                  title="The country / area of stargazers"
                  queryName={"stars-map"}
                  params={{
                    repoName: repo1?.name,
                    dateRange: dateRange
                  }}
                  shouldLoad={allReposProvided([repo1])}
                  noLoadReason="Need select repo."
                  series={[
                    {
                      name: "country_or_area",
                      nameMap: areaCodeToName
                    }
                  ]}
                  dimensionColumnName="country_or_area"
                  metricColumnName="count"
                  height="400px"
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                <PieChartCard
                  title="The country / area of stargazers"
                  queryName={"stars-map"}
                  params={{
                    repoName: repo2?.name,
                    dateRange: dateRange
                  }}
                  shouldLoad={allReposProvided([repo2])}
                  noLoadReason="Need select repo."
                  series={[
                    {
                      name: "country_or_area",
                      nameMap: areaCodeToName
                    }
                  ]}
                  dimensionColumnName="country_or_area"
                  metricColumnName="count"
                  height="400px"
                />
              </Grid>
              {/*  Star - Top 50 Company  */}
              <Grid item sm={6} xs={12}>
                <PieChartCard
                  title="Top 50 company of stargazers"
                  queryName={"stars-top-50-company"}
                  params={{
                    repoName: repo1?.name,
                    dateRange: dateRange
                  }}
                  shouldLoad={allReposProvided([repo1])}
                  noLoadReason="Need select repo."
                  series={[
                    {
                      name: "company"
                    }
                  ]}
                  dimensionColumnName="company_name"
                  metricColumnName="stargazers"
                  height="400px"
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                <PieChartCard
                  title="Top 50 company of stargazers"
                  queryName={"stars-top-50-company"}
                  params={{
                    repoName: repo2?.name,
                    dateRange: dateRange
                  }}
                  shouldLoad={allReposProvided([repo2])}
                  noLoadReason="Need select repo."
                  series={[
                    {
                      name: "company"
                    }
                  ]}
                  dimensionColumnName="company_name"
                  metricColumnName="stargazers"
                  height="400px"/>
              </Grid>
            </Grid>
            {/*  Pull Requests  */}
            <Typography variant="h5" gutterBottom component="div">Pull Request</Typography>
            <Grid container spacing={2}>
              <Grid item sm={6} xs={12}>
                <PullRequestNumbers repo={repo1} dateRange={dateRange}/>
              </Grid>
              <Grid item sm={6} xs={12}>
                <PullRequestNumbers repo={repo2} dateRange={dateRange}/>
              </Grid>
            </Grid>
            {/*  Pull Requests - History  */}
            <LineAreaBarChartCard
              title={'Pull Request History'}
              queryName={"pull-requests-history"}
              params={{
                repoName1: repo1?.name,
                repoName2: repo2?.name,
                dateRange: dateRange
              }}
              shouldLoad={allReposProvided([repo1, repo2])}
              noLoadReason="Need select repo."
              seriesColumnName="repo_name"
              series={allProvidedRepos([repo1, repo2]).map((r) => {
                return {
                  name: r.name,
                  color: r.color || getRandomColor(),
                  axisLabel: {
                    formatter: '{yyyy} {MMM}'
                  }
                };
              })}
              xAxis={{
                type: "time",
                name: "event_month"
              }}
              yAxis={{
                type: "value",
                name: "total"
              }}
              height="500px"
            />
            {/*  Pull Requests - Creator per Month  */}
            <LineAreaBarChartCard
              title={'Pull Request Creator per month'}
              queryName={"pull-request-creators-per-month"}
              params={{
                repoName1: repo1?.name,
                repoName2: repo2?.name,
                dateRange: dateRange
              }}
              shouldLoad={allReposProvided([repo1, repo2])}
              noLoadReason="Need select repo."
              seriesColumnName="repo_name"
              series={allProvidedRepos([repo1, repo2]).map((r) => {
                return {
                  name: r.name,
                  color: r.color || getRandomColor(),
                  axisLabel: {
                    formatter: '{yyyy} {MMM}'
                  }
                };
              })}
              xAxis={{
                type: "time",
                name: "event_month"
              }}
              yAxis={{
                type: "value",
                name: "total"
              }}
              height="500px"
            />
            <Grid container spacing={2}>
              {/*  Pull Requests - Map  */}
              <Grid item sm={6} xs={12}>
                {/*<GeoMapCard*/}
                {/*  title="PR Creator Map"*/}
                {/*  queryName={"pull-request-creators-map"}*/}
                {/*  params={{*/}
                {/*    repoName: repo1?.name,*/}
                {/*    dateRange: dateRange*/}
                {/*  }}*/}
                {/*  shouldLoad={allReposProvided([repo1])}*/}
                {/*  noLoadReason="Need select repo."*/}
                {/*  series={[*/}
                {/*    {name: "pull-request-creator"}*/}
                {/*  ]}*/}
                {/*  worldMap={worldMap}*/}
                {/*  areaColumnName="country_or_area"*/}
                {/*  valueColumnName="count"*/}
                {/*  height="400px"*/}
                {/*/>*/}
              </Grid>
              <Grid item sm={6} xs={12}>
                {/*<GeoMapCard*/}
                {/*  title="PR Creator Map"*/}
                {/*  queryName={"pull-request-creators-map"}*/}
                {/*  params={{*/}
                {/*    repoName: repo2?.name,*/}
                {/*    dateRange: dateRange*/}
                {/*  }}*/}
                {/*  shouldLoad={allReposProvided([repo2])}*/}
                {/*  noLoadReason="Need select repo."*/}
                {/*  series={[*/}
                {/*    {name: "pull-request-creator"}*/}
                {/*  ]}*/}
                {/*  worldMap={worldMap}*/}
                {/*  areaColumnName="country_or_area"*/}
                {/*  valueColumnName="count"*/}
                {/*  height="400px"*/}
                {/*/>*/}
              </Grid>
            </Grid>
            {/*  Issue  */}
            <Typography variant="h5" gutterBottom component="div">Issue</Typography>
            <Grid container spacing={2}>
              <Grid item sm={6} xs={12}>
                <IssueNumbers repo={repo1} dateRange={dateRange}/>
              </Grid>
              <Grid item sm={6} xs={12}>
                <IssueNumbers repo={repo2} dateRange={dateRange}/>
              </Grid>
            </Grid>
            {/*  Commits  */}
            <Typography variant="h5" gutterBottom component="div">Commits</Typography>
            <Grid container spacing={2}>
              <Grid item sm={6} xs={12}>
                <HeatMapChartCard
                  title={'Commits Time Distribution'}
                  queryName={"commits-time-distribution"}
                  params={{
                    repoName: repo1?.name,
                    dateRange: dateRange
                  }}
                  shouldLoad={allReposProvided([repo1])}
                  noLoadReason="Need select repo."
                  xAxisColumnName="hour"
                  yAxisColumnName="dayofweek"
                  valueColumnName="pushes"
                  series={allProvidedRepos([repo1]).map((r) => {
                    return {
                      name: r.name,
                      color: r.color || getRandomColor(),
                      axisLabel: {
                        formatter: '{yyyy} {MMM}'
                      }
                    };
                  })}
                  xAxis={{
                    type: "time",
                    name: "event_month"
                  }}
                  yAxis={{
                    type: "value",
                    name: "total"
                  }}
                  height="400px"
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                <HeatMapChartCard
                  title={'Commits Time Distribution'}
                  queryName={"commits-time-distribution"}
                  params={{
                    repoName: repo2?.name,
                    dateRange: dateRange
                  }}
                  shouldLoad={allReposProvided([repo2])}
                  noLoadReason="Need select repo."
                  xAxisColumnName="hour"
                  yAxisColumnName="dayofweek"
                  valueColumnName="pushes"
                  series={allProvidedRepos([repo2]).map((r) => {
                    return {
                      name: r.name,
                    };
                  })}
                  xAxis={{
                    type: "time",
                    name: "event_month"
                  }}
                  yAxis={{
                    type: "value",
                    name: "total"
                  }}
                  height="400px"
                />
              </Grid>
            </Grid>
          </MainContent>
        </ThemeAdaptor>
      </LocalizationProvider>
    </Layout>
  );
}
