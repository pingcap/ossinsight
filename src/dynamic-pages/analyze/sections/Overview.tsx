import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  CodeIcon,
  GitCommitIcon,
  IssueOpenedIcon,
  LinkExternalIcon,
  PeopleIcon,
  RepoForkedIcon,
  StarIcon,
} from '@primer/octicons-react';
import React, { ForwardedRef, forwardRef, useMemo } from 'react';
import Analyze from '../../../analyze-charts/Analyze';
import { useAnalyzeContext } from '../../../analyze-charts/context';
import { LineChart } from '../../../analyze-charts/line';
import Summary, { SummaryProps } from '../../../analyze-charts/summary';
import Section from '../Section';
import { H1, H2, P2 } from '../typography';

export const OverviewSection = forwardRef(function ({}, ref: ForwardedRef<HTMLElement>) {
  const theme = useTheme()
  const isSmall = useMediaQuery(theme.breakpoints.down('md'))
  const { comparingRepoName, repoName: name, comparingRepoId: vs } = useAnalyzeContext()

  const summaries: SummaryProps['items'] = useMemo(() => {
    return [{
      icon: <StarIcon fill='#FAC858'/>,
      title: 'Stars',
      query: 'stars-total',
      field: '*'
    },{
      icon: <GitCommitIcon fill='#D54562'/>,
      title: 'Commits',
      query: 'commits-total',
      field: '*'
    },{
      icon: <IssueOpenedIcon fill='#FDE494'/>,
      title: 'Issues',
      query: 'issues-total',
      field: '*'
    },{
      icon: <RepoForkedIcon fill='#E30C34'/>,
      title: 'Forks',
      data: repoInfo => repoInfo.forks,
    },{
      icon: <PeopleIcon fill='#F77C00'/>,
      title: 'PR Creators',
      query: 'pull-request-creators-total',
      field: '*'
    },{
      icon: <CodeIcon fill='#309CF2'/>,
      title: 'Language',
      data: repoInfo => repoInfo.language,
    }]
  }, [])

  return (
    <Section id='overview' ref={ref}>
      {
        comparingRepoName ? undefined : (
          <H1 sx={{ mt: 2 }}>
            <img width="48" height="48" src={`https://github.com/${name.split('/')[0]}.png`} alt={name} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />
            <a href={`https://github.com/${name}`} target="_blank">
              {name}
              &nbsp;
              <LinkExternalIcon size={28} verticalAlign="middle" />
            </a>
          </H1>
        )
      }
      <P2>
        Note: The number of stars we got here is an approximate value because the source GitHub data we use here from GH Archive does not include developers' unstarring behavior.
      </P2>
      <Grid container spacing={0} alignItems='center'>
        <Grid item xs={12} md={vs ? 7 : 6}>
          <Summary items={summaries} />
        </Grid>
        <Grid item xs={12} md={vs ? 5 : 6}>
          <Analyze query='stars-history'>
            <H2 id='stars-history' analyzeTitle display='none'>Stars History</H2>
            <P2 display='none'>The growth trend and the specific number of stars since the repository was established.</P2>
            <LineChart spec={{valueIndex: 'total', name: 'Stars', fromRecent: true}} aspectRatio={isSmall ? 16 / 9 : 4 / 3}/>
          </Analyze>
        </Grid>
      </Grid>
    </Section>
  )
})
