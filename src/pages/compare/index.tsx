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
import LineAreaBarChartCard from "../../components/RemoteCards/LineAreaBarChartCard";
import HeatMapChartCard from "../../components/RemoteCards/HeatMapChartCard";
import PieChartCard from "../../components/RemoteCards/PieChartCard";
import TextCard from "../../components/RemoteCards/TextCard";

import {getRandomColor} from "../../lib/color";
import {areaCodeToName} from "../../lib/areacode";
import {
  registerThemeCompareDark,
  registerThemeCompareLight,
  registerThemeDark, registerThemeVintage,
} from "../../components/RemoteCharts/theme";

import {Repo} from "../../components/CompareHeader/RepoSelector";
import useUrlSearchState, {dateRangeParam, UseUrlSearchStateProps} from "../../hooks/url-search-state";
import CompareNumbers, {CompareNumbersContainer} from "../../components/RemoteCards/CompareNumbers";
import PieChartCompareCard from "../../components/RemoteCards/PieChartCompareCard";


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

interface SomeNumbers {
  title: string
  repos: [Repo | null, Repo | null]
  queries: { title: string, query: string }[]
}

const SomeNumbers = ({title, repos, queries}: SomeNumbers) => {
  return (
    <CompareNumbersContainer title={title}>
      {queries.map(({title, query}) => (
        <CompareNumbers key={query} title={title} query={query} repos={repos} />
      ))}
    </CompareNumbersContainer>
  )
}

const STAR_NUMBERS: SomeNumbers['queries'] = [
  {title: 'Stars total', query: "stars-total"},
  {title: 'Avg stars / week', query: "stars-average-by-week"},
  {title: 'Max stars / week', query: "stars-max-by-week"},
]

const StarNumbers = ({title, repos, dateRange}) => {
  return <SomeNumbers title={title} repos={repos} queries={STAR_NUMBERS} />

}


const PULL_REQUEST_NUMBERS: SomeNumbers['queries'] = [
  {title: 'Pull requests', query: "pull-requests-total"},
  {title: 'PR creators', query: "pull-request-creators-total"},
  {title: 'Pull request reviews', query: "pull-request-reviews-total"},
  {title: 'Pull request reviewers', query: "pull-request-reviewers-total"},
]


const PullRequestNumbers = ({title, repos, dateRange}) => {
  return <SomeNumbers title={title} repos={repos} queries={PULL_REQUEST_NUMBERS} />
}

const ISSUE_NUMBERS: SomeNumbers['queries'] = [
  {title: 'Issues', query: "issues-total"},
  {title: 'Issue creators', query: 'issue-creators-total'},
  {title: 'Issue comments', query: 'issue-comments-total'},
  {title: 'Issue commenters', query: 'issue-commenters-total'},
]

const IssueNumbers = ({title, repos, dateRange}) => {
  return <SomeNumbers title={title} repos={repos} queries={ISSUE_NUMBERS} />
}


const COMMIT_NUMBERS: SomeNumbers['queries'] = [
  {title: 'Commits', query: "commits-total"},
  {title: 'Committers', query: 'committers-total'},
  {title: 'Pushes', query: 'pushes-total'},
]

const CommitNumbers = ({title, repos, dateRange}) => {
  return <SomeNumbers title={title} repos={repos} queries={COMMIT_NUMBERS} />
}

const MainContent = (props) => {
  return <main className={style.mainContent} style={{
  }}>
    {props.children}
  </main>
}

registerThemeDark();
registerThemeVintage(false);

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
  // const [dateRange, setDateRange] = useUrlSearchState<[Date | null, Date | null]>('daterange', dateRangeParam('yyyy-MM-dd', () => [null, null]));
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);

  return (
    <Layout wrapperClassName={style.page} title={`Project Compare | ${siteConfig.title}`}>
      <LocalizationProvider dateAdapter={DateAdapter}>
        <ThemeAdaptor>
          <Head>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Lato:300,400,500,700&display=swap"/>
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
            {/*  Stars  */}
            <section className={style.mainSection}>
              <Grid container spacing={1}>
                {/*  Star - Number  */}
                <Grid item xs={12}>
                  <StarNumbers title="Stars" repos={[repo1, repo2]} dateRange={dateRange} />
                </Grid>
                {/*  Stars - History  */}
                <Grid item xs={12}>
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
                <Grid item xs={12}>
                  <PieChartCompareCard
                    title="The country / area of stargazers"
                    queryName={"stars-map"}
                    params1={{
                      repoName: repo1?.name,
                      dateRange: dateRange
                    }}
                    params2={{
                      repoName: repo2?.name,
                      dateRange: dateRange
                    }}
                    shouldLoad={allReposProvided([repo1, repo2])}
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
                <Grid item xs={12}>
                  <PieChartCompareCard
                    title="Top 50 company of stargazers"
                    queryName={"stars-top-50-company"}
                    params1={{
                      repoName: repo1?.name,
                      dateRange: dateRange
                    }}
                    params2={{
                      repoName: repo2?.name,
                      dateRange: dateRange
                    }}
                    shouldLoad={allReposProvided([repo1, repo2])}
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
              </Grid>
            </section>
            {/*  Pull Requests  */}
            <section className={style.mainSection}>
              <Grid container spacing={1}>
                {/*  Pull Requests - Numbers  */}
                <Grid item xs={12}>
                  <PullRequestNumbers title='Pull Request' repos={[repo1, repo2]} dateRange={dateRange} />
                </Grid>
                <Grid item xs={12}>
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
                <Grid item xs={12}>
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
                <Grid item xs={12}>
                  <PieChartCompareCard
                    title="The country / area of PR creators"
                    queryName={"pull-request-creators-map"}
                    params1={{
                      repoName: repo1?.name,
                      dateRange: dateRange
                    }}
                    params2={{
                      repoName: repo2?.name,
                      dateRange: dateRange
                    }}
                    shouldLoad={allReposProvided([repo1, repo2])}
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
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <IssueNumbers title="Issue" repos={[repo1, repo2]} dateRange={dateRange} />
                </Grid>
              </Grid>
            </section>
            {/*  Commits  */}
            <section className={style.mainSection}>
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <CommitNumbers title="Commits" repos={[repo1, repo2]} dateRange={dateRange} />
                </Grid>
                <Grid item xs={12}>
                  <TextCard height="auto">
                    <>
                      <Typography variant="h6" gutterBottom>
                        Commits Time Distribution
                      </Typography>
                      <Typography variant="body1">
                        Commits time distribution describes the number of push events of the repository in different
                        periods.
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
                <Grid item md={3} xs={0} sx={{height: '1px', p: '0 !important'}} zeroMinWidth/>
                <Grid item md={3} sm={6} xs={12}>
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
                <Grid item md={3} sm={6}  xs={12}>
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
