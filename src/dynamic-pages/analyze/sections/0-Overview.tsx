import { IconButton, Tooltip } from '@mui/material';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import Box from '@mui/material/Box';
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
import Analyze from '../charts/Analyze';
import { useAnalyzeContext } from '../charts/context';
import { LineChart } from '../charts/line';
import Summary, { SummaryProps } from '../charts/summary';
import Section from '../Section';
import { H1, H2, P2 } from '../typography';
import { useRemoteData } from "../../../components/RemoteCharts/hook";
import { Collection } from "@ossinsight/api";
import Chip from "@mui/material/Chip";
import { paramCase } from "param-case";
import { MonthlySummaryCard } from "../charts/montly-cards";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";

export const OverviewSection = forwardRef(function ({}, ref: ForwardedRef<HTMLElement>) {
  const theme = useTheme()
  const isSmall = useMediaQuery(theme.breakpoints.down('md'))
  const { repoId, comparingRepoName, repoName: name, repoInfo, comparingRepoId: vs } = useAnalyzeContext()
  const { data: collectionData } = useRemoteData<any, Pick<Collection, 'id' | 'name'>>('get-repo-collections', { repoId }, false, !!repoId && !vs)

  const summaries: SummaryProps['items'] = useMemo(() => {
    return [{
      icon: <StarIcon fill='#FAC858'/>,
      title: <>Stars
        <Tooltip title="We only display the total number of stars and ignore developers' unstarring or restarring behaviors." sx={{marginBottom:"2px",color: 'text.secondary',}}>
          <IconButton size="small">
            <InfoOutlined fontSize='small' />
          </IconButton>
        </Tooltip>
      </>,
      alt: 'Stars',
      field: 'stars'
    },{
      icon: <GitCommitIcon fill='#D54562'/>,
      title: 'Commits',
      alt: 'Commits',
      field: 'commits'
    },{
      icon: <IssueOpenedIcon fill='#FDE494'/>,
      title: 'Issues',
      alt: 'Issues',
      field: 'issues'
    },{
      icon: <RepoForkedIcon fill='#E30C34'/>,
      title: 'Forks',
      alt: 'Forks',
      data: repoInfo => repoInfo.forks,
    },{
      icon: <PeopleIcon fill='#F77C00'/>,
      title: 'PR Creators',
      alt: 'PR Creators',
      field: 'pull_request_creators'
    },{
      icon: <CodeIcon fill='#309CF2'/>,
      title: 'Language',
      alt: 'Language',
      data: repoInfo => repoInfo.language,
    }]
  }, [])

  return (
    <Section id='overview' ref={ref}>
      {
        comparingRepoName ? undefined : (
          <>
            <H1 sx={{ mt: 2 }}>
              <Box component='span' display='inline-flex' bgcolor='white' borderRadius='4px' padding='2px' alignItems='center' justifyContent='center' sx={{ verticalAlign: 'text-bottom'}} mr={1}>
                <img width="48" height="48" src={`https://github.com/${name.split('/')[0]}.png`} alt={name} />
              </Box>
              <a href={`https://github.com/${name}`} target="_blank">
                {name}
                &nbsp;
                <LinkExternalIcon size={28} verticalAlign="middle" />
              </a>
            </H1>
            <P2>{repoInfo?.description}</P2>
            {collectionData?.data && collectionData.data.length > 0
              ? (
                <Box mb={1}>
                  In Collection:
                  &nbsp;
                  {collectionData.data.map(collection => (
                    <Chip color="primary" variant="outlined" size="small" sx={{ mr: 1 }} key={collection.id}
                          label={collection.name}
                          onClick={() => window.open(`/collections/${paramCase(collection.name)}`, '_blank')} />
                  ))}
                </Box>
              ) : undefined
            }
          </>
        )
      }
      <Grid container spacing={0} alignItems='center' mb={!vs ? 2 : 0} mt={2}>
        <Grid item xs={12} lg={5}>
          <Summary items={summaries} query='analyze-repo-overview' />
        </Grid>
        <Grid item xs={12} lg={7}>
          {
            vs
              ? (
                <Analyze query='analyze-stars-history'>
                  <H2 id='stars-history' analyzeTitle display='none'>Stars History</H2>
                  <P2 display='none'>The growth trend and the specific number of stars since the repository was established.</P2>
                  <LineChart spec={{valueIndex: 'total', name: 'Stars'}} aspectRatio={16 / 9}/>
                </Analyze>
              )
              : (
                <>
                  <Stack direction='row' justifyContent='space-between' flexWrap='wrap' mt={isSmall ? 2 : 0}>
                    <Typography component='h3' fontSize={20} fontWeight='bold'>Last 28 days Stats</Typography>
                    <Typography component='a' fontSize={16} href='#repository'>
                      🆕 Compare with the previous period
                    </Typography>
                  </Stack>
                  <MonthlySummaryCard />
                </>
              )
          }
        </Grid>
      </Grid>
      {!vs && (
        <Analyze query='analyze-stars-history'>
          <H2 id='stars-history' analyzeTitle display='none'>Stars History</H2>
          <P2 display='none'>The growth trend and the specific number of stars since the repository was established.</P2>
          <LineChart spec={{valueIndex: 'total', name: 'Stars'}} aspectRatio={isSmall ? 16 / 9 : 32 / 9}/>
        </Analyze>
      )}
    </Section>
  )
})
