import BrowserOnly from '@docusaurus/BrowserOnly';
import Head from '@docusaurus/Head';
import { useHistory, useLocation, useRouteMatch } from '@docusaurus/router';
import { Scrollspy } from '@makotot/ghostui';
import { useMediaQuery } from '@mui/material';
import Container from '@mui/material/Container';
import { Theme } from '@mui/material/styles';
import Error from '@theme/Error';
import React, { useCallback, useRef } from 'react';
import { AnalyzeContext } from '../../analyze-charts/context';
import { RepoInfo, useRepo } from '../../api/gh';
import NewCompareHeader from '../../components/CompareHeader/NewCompareHeader';
import { Repo } from '../../components/CompareHeader/RepoSelector';
import { AsyncData } from '../../components/RemoteCharts/hook';
import TryItYourself from '../../components/Ads/TryItYourself';
import useUrlSearchState, { stringParam } from '../../hooks/url-search-state';
import CustomPage from '../../theme/CustomPage';
import { Navigator } from './Navigator';
import { OverviewSection } from './sections/0-Overview';
import { PeopleSection } from './sections/1-People';
import { CommitsSection } from './sections/2-Commits';
import { PullRequestsSection } from './sections/3-PullRequests';
import { IssuesSection } from './sections/4-Issues';
import { Contributors } from './sections/5-Contributors';
import {Redirect} from '@docusaurus/router';

interface AnalyzePageParams {
  owner: string;
  repo: string;
}

const sections = [
  'overview',
  'people',
  'commits',
  'pull-requests',
  'issues',
  'contributors',
]

function AnalyzePage() {
  const history = useHistory();
  const location = useLocation();

  const { data: main, name, error } = useMainRepo();
  const { data: vs, name: comparingRepoName, setName: setComparingRepoName } = useVsRepo();

  const sectionRefs = sections.map(section => useRef<HTMLElement>(null))

  const onRepoChange = useCallback((repo: Repo) => {
    history.push({
      pathname: `/analyze/${repo.name}`,
      search: location.search,
    });
  }, [history, location]);

  const onComparingRepoChange = useCallback((repo: Repo | undefined) => {
    setComparingRepoName(repo?.name);
  }, []);

  const allValid = useCallback(() => undefined, []);

  // Out of mui theme context, so we need to use magic number here
  const isSmall = useMediaQuery<Theme>('(max-width:600px)')
  const sideWidth = isSmall ? undefined : '160px'

  if (!main && error) {
    return <Redirect to='/404' />
  }

  return (
    <Scrollspy sectionRefs={sectionRefs} offset={-140}>
      {({ currentElementIndexInViewport }) => (
        <CustomPage
          sideWidth={sideWidth}
          Side={() => !isSmall ? <Navigator comparing={!!comparingRepoName} type='side' value={sections[currentElementIndexInViewport]} /> : undefined}
          header={(
            <NewCompareHeader
              sideWidth={sideWidth}
              repo1={main?.repo}
              repo2={vs?.repo}
              onRepo1Change={onRepoChange}
              onRepo2Change={onComparingRepoChange}
              onRepo1Valid={allValid}
              onRepo2Valid={allValid}
              repo1DisableClearable
              repo1Placeholder="Select to analyze"
              repo2Placeholder="Add to compare"
            />
          )}
        >
          <Head>
            <title>
              {comparingRepoName
                ? `${name} vs ${comparingRepoName} | OSSInsight`
                : `Analyze ${name} | OSSInsight`}
            </title>
          </Head>
          <AnalyzeContext.Provider value={{
            repoId: main?.repo.id,
            comparingRepoId: vs?.repo.id,
            repoName: name,
            comparingRepoName,
            repoInfo: main?.repoInfo,
            comparingRepoInfo: vs?.repoInfo,
          }}>
            <Container maxWidth="lg">
              <OverviewSection ref={sectionRefs[0]} />
              <PeopleSection ref={sectionRefs[1]} />
              <CommitsSection ref={sectionRefs[2]} />
              <PullRequestsSection ref={sectionRefs[3]} />
              <IssuesSection ref={sectionRefs[4]} />
              {!comparingRepoName ? <Contributors ref={sectionRefs[5]} /> : undefined}
              <TryItYourself campaign="compare" show fixed />
            </Container>
          </AnalyzeContext.Provider>
          {isSmall ? <Navigator comparing={!!comparingRepoName} value={sections[currentElementIndexInViewport]} type='bottom' /> : undefined}
        </CustomPage>
      )}
    </Scrollspy>
  );
}

export default () => <BrowserOnly>{() => <AnalyzePage />}</BrowserOnly>


type InfoPack = {
  repoInfo: RepoInfo
  repo: Repo
}

function toRepo(repo: RepoInfo | undefined): InfoPack | undefined {
  return repo ? {
    repoInfo: repo,
    repo: {
      id: repo.id,
      name: repo.full_name,
    },
  } : undefined;
}

function useMainRepo(): AsyncData<InfoPack> & { name: string } {
  let { params: { owner, repo: repoName } } = useRouteMatch<AnalyzePageParams>();
  const name = `${owner}/${repoName}`;
  const { data: repo, isValidating, error } = useRepo(name);

  return {
    data: toRepo(repo),
    loading: isValidating,
    error,
    name,
  };
}

function useVsRepo(): AsyncData<InfoPack> & { name: string, setName: (val: string | undefined) => void } {
  const [vs, setVs] = useUrlSearchState('vs', stringParam());

  const { data: repo, isValidating, error } = useRepo(vs);
  return {
    data: toRepo(repo),
    loading: isValidating,
    error,
    name: vs,
    setName: setVs,
  };
}
