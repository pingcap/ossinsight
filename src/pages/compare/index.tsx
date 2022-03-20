/// <reference types="@types/webpack-env" />
import React, {Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState} from 'react'

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
import CompareContext from './_context'
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";


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

const sectionsCtx = require.context('./_sections', false, /\.tsx$/)

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

registerThemeDark(false);
registerThemeVintage(false);

function useRepo (name: string | undefined, ): [Repo | undefined, Dispatch<SetStateAction<Repo | undefined>>, boolean] {
  const [repo, setRepo] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (name) {
      setLoading(true)
      fetch(BASE_URL + `/gh/repo/${name}`)
        .then(res => res.json())
        .then(res => setRepo({
          id: res.data.id,
          name: res.data.full_name,
          color: getRandomColor()
        }))
        .finally(() => {
          setLoading(false)
        })
    }
  }, [])

  return [repo, setRepo, loading]
}

const dateRange = [null, null]

export default function RepoCompare() {
  const {siteConfig} = useDocusaurusContext();

  const [repo1Name, setRepo1Name] = useUrlSearchState('repo1', stringParam())
  const [repo2Name, setRepo2Name] = useUrlSearchState('repo2', stringParam())

  const [repo1, setRepo1, repo1Loading] = useRepo(repo1Name)
  const [repo2, setRepo2, repo2Loading] = useRepo(repo2Name)

  useEffect(() => {
    if (!repo1Loading) {
      setRepo1Name(repo1?.name)
    }
  }, [repo1, setRepo1Name, repo1Loading])

  useEffect(() => {
    if (!repo2Loading) {
      setRepo2Name(repo2?.name)
    }
  }, [repo2, setRepo2Name, repo2Loading])

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

  const sections = useMemo(() =>{
    return sectionsCtx.keys()
      .sort()
      .map(key => sectionsCtx(key).default)
      .map(Section => <Section />)
  }, [])

  return (
    <Layout wrapperClassName={style.page} title={`Project Compare | ${siteConfig.title}`}>
      <LocalizationProvider dateAdapter={DateAdapter}>
        <ThemeAdaptor>
          <Head>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Lato:300,400,500,700&display=swap" />
          </Head>
          <MainContent context={{repo1, repo2, dateRange, allReposProvided, allProvidedRepos}}>
            <Typography variant='h3' component='h1'>
              Comparing OSS
            </Typography>
            <Grid container>
              <Grid item xs={12} lg={8}>
                <Typography variant='body1'>
                  Here, you can compare any two GitHub projects regarding their stars, pull requests, stargazers' locations and companies, issues, commits, and some other metrics.
                </Typography>
              </Grid>
              <Grid item xs={12} lg={4}>
                <BrowserOnly>
                  {() => <ShareButtons title={`Compare Projects | OSSInsight`} style={{marginTop: 16, marginRight: 16}} />}
                </BrowserOnly>
              </Grid>
            </Grid>
            <CompareHeader
              repo1={repo1}
              onRepo1Change={setRepo1}
              onRepo1Valid={onRepo1Valid}
              repo2={repo2}
              onRepo2Change={setRepo2}
              onRepo2Valid={onRepo2Valid}
            />
            <Box sx={{ mt: 4 }}>
              {sections}
            </Box>
          </MainContent>
        </ThemeAdaptor>
      </LocalizationProvider>
    </Layout>
  );
}
