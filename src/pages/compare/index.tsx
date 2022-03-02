import React, {useState} from 'react'

import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Head from '@docusaurus/Head';
import Layout from '@theme/Layout';
import useThemeContext from "@theme/hooks/useThemeContext";

import {LocalizationProvider} from "@mui/lab";
import DateAdapter from "@mui/lab/AdapterLuxon";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import style from './index.module.css';

import ThemeAdaptor from "../../components/ThemeAdaptor";
import CompareHeader from "../../components/CompareHeader/CompareHeader";
import StatisticCard from "../../components/RemoteCards/StatisticCard";
import LineAreaBarChartCard from "../../components/RemoteCards/LineAreaBarChartCard";
import HeatMapChartCard from "../../components/RemoteCards/HeatMapChartCard";
import PieChartCard from "../../components/RemoteCards/PieChartCard";
import TextCard from "../../components/RemoteCards/TextCard";

import {getRandomColor} from "../../lib/color";
import {areaCodeToName} from "../../lib/areacode";
import {
  registerThemeCompareDark,
  registerThemeCompareLight,
} from "../../components/RemoteCharts/theme";

import {Repo} from "../../components/CompareHeader/RepoSelector";
import useUrlSearchState, {dateRangeParam, stringParam, UseUrlSearchStateProps} from "../../hooks/url-search-state";


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
        height="12em"
      />
    </Grid>
    <Grid item xs={4}>
      <StatisticCard
        title={'Avg stars / week'}
        queryName="stars-average-by-week"
        params={{repoName: repo?.name, dateRange: dateRange}}
        shouldLoad={allReposProvided([repo])}
        noLoadReason="Need select repo."
        height="12em"
      />
    </Grid>
    <Grid item xs={4}>
      <StatisticCard
        title={'Max stars / week'}
        queryName="stars-max-by-week"
        params={{repoName: repo?.name, dateRange: dateRange}}
        shouldLoad={allReposProvided([repo])}
        noLoadReason="Need select repo."
        height="12em"
      />
    </Grid>
  </Grid>;
}

const PullRequestNumbers = ({ repo, dateRange }) => {
  return <Grid container spacing={1}>
    <Grid item xs={6}>
      <StatisticCard
        title={'Pull requests'}
        queryName="pull-requests-total"
        params={{repoName: repo?.name, dateRange: dateRange}}
        shouldLoad={allReposProvided([repo])}
        noLoadReason="Need select repo."
        height="12em"
      />
    </Grid>
    <Grid item xs={6}>
      <StatisticCard
        title={'PR creators'}
        queryName="pull-request-creators-total"
        params={{repoName: repo?.name, dateRange: dateRange}}
        shouldLoad={allReposProvided([repo])}
        noLoadReason="Need select repo."
        height="12em"
      />
    </Grid>
    <Grid item xs={6}>
      <StatisticCard
        title={'Pull request reviews'}
        queryName="pull-request-reviews-total"
        params={{repoName: repo?.name, dateRange: dateRange}}
        shouldLoad={allReposProvided([repo])}
        noLoadReason="Need select repo."
        height="12em"
      />
    </Grid>
    <Grid item xs={6}>
      <StatisticCard
        title={'Pull request reviewers'}
        queryName="pull-request-reviewers-total"
        params={{repoName: repo?.name, dateRange: dateRange}}
        shouldLoad={allReposProvided([repo])}
        noLoadReason="Need select repo."
        height="12em"
      />
    </Grid>
  </Grid>;
}

const IssueNumbers = ({ repo, dateRange }) => {
  return <Grid container spacing={1}>
    <Grid item xs={6}>
      <StatisticCard
        title={'Issues'}
        queryName="issues-total"
        params={{repoName: repo?.name, dateRange: dateRange}}
        shouldLoad={allReposProvided([repo])}
        noLoadReason="Need select repo."
        height="12em"
      />
    </Grid>
    <Grid item xs={6}>
      <StatisticCard
        title={'Issue creators'}
        queryName="issue-creators-total"
        params={{repoName: repo?.name, dateRange: dateRange}}
        shouldLoad={allReposProvided([repo])}
        noLoadReason="Need select repo."
        height="12em"
      />
    </Grid>
    <Grid item xs={6}>
      <StatisticCard
        title={'Issue comments'}
        queryName="issue-comments-total"
        params={{repoName: repo?.name, dateRange: dateRange}}
        shouldLoad={allReposProvided([repo])}
        noLoadReason="Need select repo."
        height="12em"
      />
    </Grid>
    <Grid item xs={6}>
      <StatisticCard
        title={'Issue commenters'}
        queryName="issue-commenters-total"
        params={{repoName: repo?.name, dateRange: dateRange}}
        shouldLoad={allReposProvided([repo])}
        noLoadReason="Need select repo."
        height="12em"
      />
    </Grid>
  </Grid>;
}

const CommitNumbers = ({ repo, dateRange }) => {
  return <Grid container spacing={1}>
    <Grid item xs={4}>
      <StatisticCard
        title="Commits"
        queryName="commits-total"
        params={{repoName: repo?.name, dateRange: dateRange}}
        shouldLoad={allReposProvided([repo])}
        noLoadReason="Need select repo."
        height="12em"
      />
    </Grid>
    <Grid item xs={4}>
      <StatisticCard
        title="Committers"
        queryName="committers-total"
        params={{repoName: repo?.name, dateRange: dateRange}}
        shouldLoad={allReposProvided([repo])}
        noLoadReason="Need select repo."
        height="12em"
      />
    </Grid>
    <Grid item xs={4}>
      <StatisticCard
        title="Pushes"
        queryName="pushes-total"
        params={{repoName: repo?.name, dateRange: dateRange}}
        shouldLoad={allReposProvided([repo])}
        noLoadReason="Need select repo."
        height="12em"
      />
    </Grid>
  </Grid>;
}

const MainContent = (props) => {
  const {isDarkTheme} = useThemeContext();
  return <main className={style.mainContent} style={{
    backgroundColor: isDarkTheme ? '#18191a' : '#f9fbfc'
  }}>
    {props.children}
  </main>
}

registerThemeCompareLight();
registerThemeCompareDark();

const repoParam = (defaultValue?): UseUrlSearchStateProps<Repo> => {
  return {
    defaultValue,
    serialize: value => value ? value.name : undefined,
    deserialize: string => string ? { name: string, color: getRandomColor() } : undefined
  }
}

export default function RepoCompare() {
  const {siteConfig} = useDocusaurusContext();

  const [repo1, setRepo1] = useUrlSearchState<Repo>('repo1', repoParam(null));
  const [repo2, setRepo2] = useUrlSearchState<Repo>('repo2', repoParam(null));
  const [dateRange, setDateRange] = useUrlSearchState<[Date | null, Date | null]>('daterange', dateRangeParam('yyyy-MM-dd', () => [null, null]));

  return (
    <Layout>
      <LocalizationProvider dateAdapter={DateAdapter}>
        <ThemeAdaptor>
          <Head>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Lato:300,400,500,700&display=swap"/>
            <title>Project Compare | {siteConfig.title}</title>
          </Head>
          <CompareHeader
            repo1={repo1}
            onRepo1Change={setRepo1}
            repo2={repo2}
            onRepo2Change={setRepo2}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
          <MainContent>
            <header>
              <Grid container spacing={2}>
                <Grid item sm={6} xs={12}>
                  <Typography variant="h4" fontFamily="Lato" gutterBottom component="div">{repo1?.name || 'Repo Name 1'}</Typography>
                </Grid>
                <Grid item sm={6} xs={12}>
                  <Typography variant="h4" fontFamily="Lato" gutterBottom component="div">{repo2?.name || 'Repo Name 2'}</Typography>
                </Grid>
              </Grid>
            </header>
            {/*  Stars  */}
            <section className={style.mainSection}>
              <Typography variant="h5" fontFamily="Lato" gutterBottom component="div">Stars</Typography>
              <Grid container spacing={1}>
                {/*  Star - Number  */}
                <Grid item md={6} sm={12}>
                  <StarNumbers repo={repo1} dateRange={dateRange}/>
                </Grid>
                <Grid item md={6} sm={12}>
                  <StarNumbers repo={repo2} dateRange={dateRange}/>
                </Grid>
                {/*  Stars - History  */}
                <Grid item sm={12}>
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
                </Grid>
                {/*  Star - Country / Area  */}
                <Grid item md={6} sm={12}>
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
                <Grid item md={6} sm={12}>
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
                <Grid item md={6} sm={12}>
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
                <Grid item md={6} sm={12}>
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
            </section>
            {/*  Pull Requests  */}
            <section className={style.mainSection}>
              <Typography variant="h5" fontFamily="Lato" gutterBottom component="div">Pull Request</Typography>
              <Grid container spacing={1}>
                {/*  Pull Requests - Numbers  */}
                <Grid item md={6} sm={12}>
                  <PullRequestNumbers repo={repo1} dateRange={dateRange}/>
                </Grid>
                <Grid item md={6} sm={12}>
                  <PullRequestNumbers repo={repo2} dateRange={dateRange}/>
                </Grid>
                <Grid item md={12}>
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
                </Grid>
                <Grid item md={12}>
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
                </Grid>
                {/*  Pull Requests - Country / Area  */}
                <Grid item md={6} sm={12}>
                  <PieChartCard
                    title="The country / area of PR creators"
                    queryName={"pull-request-creators-map"}
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
                <Grid item md={6} sm={12}>
                  <PieChartCard
                    title="The country / area of PR creators"
                    queryName={"pull-request-creators-map"}
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
              </Grid>
            </section>
            {/*  Issue  */}
            <section className={style.mainSection}>
              <Typography variant="h5" fontFamily="Lato" gutterBottom component="div">Issue</Typography>
              <Grid container spacing={1}>
                <Grid item md={6} sm={12}>
                  <IssueNumbers repo={repo1} dateRange={dateRange}/>
                </Grid>
                <Grid item md={6} sm={12}>
                  <IssueNumbers repo={repo2} dateRange={dateRange}/>
                </Grid>
              </Grid>
            </section>
            {/*  Commits  */}
            <section className={style.mainSection}>
              <Typography variant="h5" fontFamily="Lato" gutterBottom component="div">Commits</Typography>
              <Grid container spacing={1}>
                <Grid item md={6} sm={12}>
                  <CommitNumbers repo={repo1} dateRange={dateRange}/>
                </Grid>
                <Grid item md={6} sm={12}>
                  <CommitNumbers repo={repo2} dateRange={dateRange}/>
                </Grid>
                <Grid item sm={12}>
                  <TextCard height="auto">
                    <>
                      <Typography variant="h6" gutterBottom>
                        Commits Time Distribution
                      </Typography>
                      <Typography variant="body1">
                        Commits time distribution describes the number of push events of the repository in different periods.
                      </Typography>
                      <ul>
                        <Typography variant="body1" component="li">The X-axis is 0 ~ 24 hours divided according to GMT(UTC+00:00) time zone</Typography>
                        <Typography variant="body1" component="li">The Y-axis is day of week, 0 means Sunday, 1 means Monday, and so on...</Typography>
                      </ul>
                      <Typography variant="body1">
                        We use the <a href="https://en.wikipedia.org/wiki/Heat_map">heatmap</a> to indicate the frequency of the
                        code <a href="https://docs.github.com/en/developers/webhooks-and-events/events/github-event-types#pushevent">PUSH</a> event on this time node.
                        By analyzing the main distribution area of the large circle, we can roughly learn that the open-source
                        repository is mainly the developers in that area in activities.
                      </Typography>
                      <ul>
                        <Typography variant="body1" component="li">
                          If the hot spots are mainly concentrated on the Y-axis working day, then this open-source repository
                          is likely to be an open-source project whose main contribution comes from one or two companies.
                        </Typography>
                        <Typography variant="body1" component="li">
                          If the hot spots are mainly concentrated on the X-axis 2 - 14h (corresponding to 10 to 22h of GMT+8),
                          then developers of this open-source repository may be mainly in the eastern hemisphere.
                        </Typography>
                        <Typography variant="body1" component="li">
                          If the hot spots are concentrated on the X-axis 14h - 2h (+1) (corresponding to 2 to 18h of GMT-8),
                          then developers of this open-source repository may be mainly in the western hemisphere.
                        </Typography>
                      </ul>
                    </>
                  </TextCard>
                </Grid>
                <Grid item md={6} sm={12}>
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
                    height="400px"
                  />
                </Grid>
                <Grid item md={6} sm={12}>
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
                    height="400px"
                  />
                </Grid>
              </Grid>
            </section>
          </MainContent>
        </ThemeAdaptor>
      </LocalizationProvider>
    </Layout>
  );
}
