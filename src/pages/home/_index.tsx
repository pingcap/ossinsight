import React, {useCallback, useMemo, useState} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import WordCloud from "../../components/WordCloud";
import TopList from "../../components/TopList";
import Section from './_components/Section';
import CustomPage from "../../theme/CustomPage";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import {styled} from '@mui/material/styles';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import Tag from "./_components/Tag";
import Image from "../../components/Image";
import AspectRatio from "react-aspect-ratio";
import CompareHeader from "../../components/CompareHeader/CompareHeader";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import {useRemoteData} from "../../components/RemoteCharts/hook";
import Skeleton from "@mui/material/Skeleton";
import {Repo} from "../../components/CompareHeader/RepoSelector";
import Link from "@docusaurus/Link";
import {H1, H2, Span, Headline, Subtitle, Body, fontSizes, H2Plus} from './_components/typography'

const Item = styled(Box)(({theme}) => ({
  padding: theme.spacing(4),
  flex: 1,
  [theme.breakpoints.down('md')]: {
    width: '100%',
    padding: theme.spacing(1)
  }
}))

const AlignRightItem = styled(Item)(({theme}) => ({
  textAlign: 'right',
  [theme.breakpoints.down('md')]: {
    textAlign: 'left'
  }
}))

const Logo = styled('img')(({theme}) => ({
  verticalAlign: 'text-bottom',
  marginLeft: theme.spacing(1),
}))

const formatHugeNumber = (x: number) => {
  return x.toLocaleString("en")
}

const stackDirection = {xs: 'column', md: 'row'} as const

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  const [period, setPeriod] = useState('last_hour')
  const [repo1, setRepo1] = useState<Repo>(undefined)
  const [repo2, setRepo2] = useState<Repo>(undefined)
  const onRepo1Valid = useCallback((repo: Repo) => {
    if (repo?.name !== undefined && repo?.name === repo2?.name) {
      return 'Please select another repository to compare.'
    }
  }, [repo2])
  const onRepo2Valid = useCallback((repo: Repo) => {
    if (repo?.name !== undefined && repo?.name === repo1?.name) {
      return 'Please select another repository to compare.'
    }
  }, [repo1])
  const compare = useMemo(() => {
    if (typeof window === 'undefined') {
      return '/compare'
    }
    const usp = new URLSearchParams()
    if (repo1) {
      usp.set('repo1', repo1.name)
    }
    if (repo2) {
      usp.set('repo2', repo2.name)
    }
    return `/compare?${usp.toString()}`
  }, [repo1, repo2])
  const {data: totalEventsData} = useRemoteData('events-total', {}, false)

  return (
    <CustomPage
      title={siteConfig.title}
      description={siteConfig.tagline}
      dark
    >
      <Section>
        <Stack
          divider={<Divider orientation="vertical" flexItem />}
          direction={stackDirection}
        >
          <AlignRightItem>
            <Headline>
              Get insights from
              <Span sx={{color: '#E30C34', mx: 0.5}}>
                {totalEventsData ? (formatHugeNumber(totalEventsData.data[0].cnt)) :
                  <Skeleton sx={{display: 'inline-block', minWidth: '150px'}} />}
              </Span>
              GitHub Events
            </Headline>
            <H1>
              Open Source Software
              <br />
              <Span sx={{color: '#FFE895'}}>
                <VisibilityOutlinedIcon fontSize='inherit' sx={{verticalAlign: 'text-bottom'}} />
                &nbsp;Insight
              </Span>
            </H1>
            <Body>
              Powered by
              <a href="https://en.pingcap.com/tidb-cloud/" target="_blank">
                <Logo src='/img/tidb_cloud.png' width={108} height={24} alt='TiDB Cloud' />
              </a>
            </Body>
          </AlignRightItem>
          <Item sx={[{flex: 0.618}, fontSizes.h1]}>
            <WordCloud period='last_hour' style={{minHeight: 200}}>
              <span></span>
            </WordCloud>
          </Item>
        </Stack>
      </Section>
      <Section darker>
        <Stack direction={stackDirection} alignItems='center'>
          <Item>
            <H2>
              Historical / real-time
              <br />
              <H2Plus sx={{color: '#FFE895'}}>
                Insight
              </H2Plus>
            </H2>
            <Subtitle>
              Explore the <b>Popularity & Activity trends</b>
              <br />
              in a technical field：
            </Subtitle>
            <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 2, mt: 3}}>
              <Tag color='#E63E6D' to='/database'>
                Database
              </Tag>
              <Tag color='#E30C34' to='/js-framework'>
                JavaScript Framework
              </Tag>
              <Tag color='#FEC260' to='/web-framework'>
                Web Framework
              </Tag>
              <Tag color='#F15A24' to='/language'>
                Programming Languages
              </Tag>
              <Tag color='#F87C00' to='/low-code'>
                Lowcode Development Tools
              </Tag>
            </Box>
          </Item>
          <Item>
            <AspectRatio ratio={1472 / 1390}>
              <Image src={require('./images/demo-1.png').default} style={{width: '100%', height: '100%'}} />
            </AspectRatio>
          </Item>
        </Stack>
      </Section>
      <Section>
        <Stack direction={stackDirection} alignItems='center'>
          <Item>
            <H2>
              Visually & Comprehensive
              <br />
              <H2Plus sx={{color: '#FFE895'}}>
                Compare
              </H2Plus>
            </H2>
            <Subtitle>
              Track <b>the code activity & community metrics</b>.
              <br />
              Find out who is participating,
              <br />
              and in which <b>regions</b> or <b>companies</b> are they located.
            </Subtitle>
            <Box sx={theme => ({
              mt: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              [theme.breakpoints.down('md')]: {
                flexDirection: 'column',
                '> *': {
                  width: '100%'
                }
              }
            })}>
              <CompareHeader
                repo1={repo1}
                repo2={repo2}
                onRepo1Change={setRepo1}
                onRepo2Change={setRepo2}
                onRepo1Valid={onRepo1Valid}
                onRepo2Valid={onRepo2Valid}
                sx={{backgroundColor: 'transparent', flex: 1, borderBottom: 'none'}}
                position='static'
              />
              <Button component={Link} variant='contained' href={compare}>
                go!
              </Button>
            </Box>
          </Item>
          <Item>
            <AspectRatio ratio={1284 / 1273}>
              <Image src={require('./images/demo-2.png').default} style={{width: '100%', height: '100%'}} />
            </AspectRatio>
          </Item>
        </Stack>
      </Section>
      <Section darker>
        <Container maxWidth='lg'>
          <TopList period={period} onPeriodChange={setPeriod} />
        </Container>
      </Section>
    </CustomPage>
  );
}
