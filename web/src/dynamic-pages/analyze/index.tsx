import BrowserOnly from '@docusaurus/BrowserOnly';
import Head from '@docusaurus/Head';
import { Redirect, useHistory, useLocation } from '@docusaurus/router';
import { useRouteMatch } from 'react-router';
import { Container, Theme, useMediaQuery } from '@mui/material';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { AnalyzeContext } from './charts/context';
import { useRepo } from '../../api';
import type { RepoInfo } from '@ossinsight/api';
import NewCompareHeader from '../../components/CompareHeader/NewCompareHeader';
import { Repo } from '../../components/CompareHeader/RepoSelector';
import { AsyncData } from '../../components/RemoteCharts/hook';
import useUrlSearchState, { stringParam } from '../../hooks/url-search-state';
import CustomPage from '../../theme/CustomPage';
import { Navigator } from './Navigator';
import { OverviewSection } from './sections/0-Overview';
import { PeopleSection } from './sections/1-People';
import { CommitsSection } from './sections/2-Commits';
import { PullRequestsSection } from './sections/3-PullRequests';
import { IssuesSection } from './sections/4-Issues';
import { Contributors } from './sections/6-Contributors';
import { Repository } from './sections/5-Repository';
import { isNullish, notNullish } from '@site/src/utils/value';
import { Highlights } from '@site/src/dynamic-pages/analyze/sections/98-Highlights';
import ScrollSpy, { ScrollSpyInstance } from '@site/src/components/ScrollSpy';
import BrowserHash from '@site/src/components/BrowserHash';
import { usePlayground } from '@site/src/dynamic-pages/analyze/playground/Playground';

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
  'repository',
  'contributors',
  'highlights',
];

function AnalyzePage () {
  const history = useHistory();
  const location = useLocation();

  const { data: main, name, error } = useMainRepo();
  const { data: vs, name: comparingRepoName, setName: setComparingRepoName } = useVsRepo();
  const { button: playgroundButton, drawer: playgroundDrawer } = usePlayground();

  const showPlayground = useMemo(() => {
    return isNullish(vs) && (notNullish(main?.repo));
  }, [vs, main]);

  const onRepoChange = useCallback((repo: Repo) => {
    history.push({
      pathname: `/analyze/${repo.name}`,
      search: location.search,
    });
  }, [history, location]);

  const onComparingRepoChange = useCallback((repo: Repo | null) => {
    setComparingRepoName(repo?.name);
  }, []);

  const allValid = useCallback(() => undefined, []);

  // Out of mui theme context, so we need to use magic number here
  const isSmall = useMediaQuery<Theme>('(max-width:600px)');
  const sideWidth = isSmall ? '0' : '160px';

  const spyRef = useRef<ScrollSpyInstance | null>(null);
  const [active, setActive] = useState(0);

  const scrollTo = useCallback((key: string) => {
    spyRef.current?.scrollTo(sections.indexOf(key));
  }, []);

  if (isNullish(main) && notNullish(error)) {
    return <Redirect to="/404" />;
  }

  const content = useMemo(() => {
    const children = [
      <OverviewSection key={sections[0]} />,
      <PeopleSection key={sections[1]} />,
      <CommitsSection key={sections[2]} />,
      <PullRequestsSection key={sections[3]} />,
      <IssuesSection key={sections[4]} />,
    ];
    if (!comparingRepoName) {
      children.push(
        <Repository key={sections[5]} />,
        <Contributors key={sections[6]} />,
        <Highlights key={sections[7]} />,
      );
    }
    return (
      <Container maxWidth="xl">
        <ScrollSpy ref={spyRef} offset={120} onVisibleElementChange={setActive}>
          {children}
        </ScrollSpy>
      </Container>
    );
  }, [comparingRepoName]);

  return (
    <CustomPage
      sideWidth={sideWidth}
      Side={() => !isSmall ? <Navigator comparing={!!comparingRepoName} type="side" value={sections[active]} scrollTo={scrollTo} /> : null}
      header={(
        <NewCompareHeader
          sideWidth={sideWidth}
          repo1={main?.repo ?? null}
          repo2={vs?.repo ?? null}
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
        <BrowserHash value={sections[active]}/>
        {content}
        {showPlayground && playgroundDrawer}
      </AnalyzeContext.Provider>
      {isSmall ? <Navigator comparing={!!comparingRepoName} value={sections[active]} scrollTo={scrollTo} type="bottom" /> : undefined}
      {showPlayground && playgroundButton}
    </CustomPage>
  );
}

export default () => <BrowserOnly>{() => <AnalyzePage />}</BrowserOnly>;

type InfoPack = {
  repoInfo: RepoInfo;
  repo: Repo;
};

function toRepo (repo: RepoInfo | undefined): InfoPack | undefined {
  return notNullish(repo)
    ? {
        repoInfo: repo,
        repo: {
          id: repo.id,
          name: repo.full_name,
        },
      }
    : undefined;
}

function useMainRepo (): AsyncData<InfoPack> & { name: string } {
  const { params: { owner, repo: repoName } } = useRouteMatch<AnalyzePageParams>();
  const name = `${owner}/${repoName}`;
  const { data: repo, isValidating, error } = useRepo(name);

  return {
    data: toRepo(repo),
    loading: isValidating,
    error,
    name,
  };
}

function useVsRepo (): AsyncData<InfoPack> & { name: string | undefined, setName: (val: string | undefined) => void } {
  const [vs, setVs] = useUrlSearchState<string | undefined>('vs', stringParam());

  const { data: repo, isValidating, error } = useRepo(vs);
  return {
    data: toRepo(repo),
    loading: isValidating,
    error,
    name: vs,
    setName: useCallback((name) => {
      setVs(name);
    }, [setVs]),
  };
}
