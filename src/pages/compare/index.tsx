/// <reference types="@types/webpack-env" />
import React, {Dispatch, SetStateAction, useCallback, useEffect, useState} from 'react'

import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Head from '@docusaurus/Head';
import Layout from '@theme/Layout';

import {LocalizationProvider} from "@mui/lab";
import DateAdapter from "@mui/lab/AdapterLuxon";
import style from './index.module.css';

import ThemeAdaptor from "../../components/ThemeAdaptor";
import CompareHeader from "../../components/CompareHeader/CompareHeader";

import {getRandomColor} from "../../lib/color";
import {registerThemeDark, registerThemeVintage} from "../../components/BasicCharts";

import {Repo} from "../../components/CompareHeader/RepoSelector";
import useUrlSearchState, {stringParam} from "../../hooks/url-search-state";
import ShareButtons from "../../components/ShareButtons";
import BrowserOnly from "@docusaurus/core/lib/client/exports/BrowserOnly";
import {BASE_URL} from "../../lib/request";
import CompareContext from './context'


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

const sectionsCtx = require.context('./sections', false, /\.tsx$/)
const sections = sectionsCtx.keys().sort().map(key => sectionsCtx(key).default).map(Section => <Section />)

const MainContent = (props) => {
  return <main className={style.mainContent} style={{}}>
    <CompareContext.Provider value={props.context}>
      {props.children}
    </CompareContext.Provider>
  </main>
}

const zones: number[] = [
]

for (let i = -12; i <= 13; i++) {
  zones.push(i)
}

registerThemeDark();
registerThemeVintage(false);

function useRepo (name: string | undefined, setName: Dispatch<SetStateAction<string | undefined>>): [Repo | undefined, Dispatch<Repo | undefined>] {
  const [repo, setRepo] = useState(null)

  useEffect(() => {
    if (name) {
      fetch(BASE_URL + `/gh/repo/${name}`)
        .then(res => res.json())
        .then(res => setRepo({
          id: res.data.id,
          name: res.data.full_name,
          color: getRandomColor()
        }))
    }
  }, [])

  const setRepoHook: Dispatch<Repo | undefined> = useCallback((repo) => {
    setName(repo?.name)
    setRepo(repo)
  }, [setName])

  return [repo, setRepoHook]
}

const dateRange = [null, null]

export default function RepoCompare() {
  const {siteConfig} = useDocusaurusContext();

  const [repo1, setRepo1] = useRepo(...useUrlSearchState('repo1', stringParam()))
  const [repo2, setRepo2] = useRepo(...useUrlSearchState('repo2', stringParam()))

  const onRepo1Valid = useCallback((repo) => {
    if (repo?.name !== undefined && repo?.name === repo2?.name) {
      return 'Please select another repository to compare.'
    }
  }, [repo2])

  const onRepo2Valid = useCallback((repo) => {
    if (repo?.name !== undefined && repo?.name === repo1?.name) {
      return 'Please select another repository to compare.'
    }
  }, [repo1])

  return (
    <Layout wrapperClassName={style.page} title={`Project Compare | ${siteConfig.title}`}>
      <LocalizationProvider dateAdapter={DateAdapter}>
        <ThemeAdaptor>
          <Head>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Lato:300,400,500,700&display=swap" />
          </Head>
          <BrowserOnly>
            {() => <ShareButtons title={`Compare Projects | OSSInsight`} style={{marginTop: 16, marginRight: 16}} />}
          </BrowserOnly>
          <CompareHeader
            repo1={repo1}
            onRepo1Change={setRepo1}
            onRepo1Valid={onRepo1Valid}
            repo2={repo2}
            onRepo2Change={setRepo2}
            onRepo2Valid={onRepo2Valid}
          />
          <MainContent context={{repo1, repo2, dateRange, allReposProvided, allProvidedRepos}}>
            {sections}
          </MainContent>
        </ThemeAdaptor>
      </LocalizationProvider>
    </Layout>
  );
}
