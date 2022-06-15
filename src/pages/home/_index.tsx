import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import React, { useCallback, useMemo, useState } from 'react';
import AspectRatio from 'react-aspect-ratio';
import { useInView } from 'react-intersection-observer';
import AnimatedNumber from "react-awesome-animated-number";
import AnalyzeSelector from '../../components/AnalyzeSelector';
import CompareHeader from '../../components/CompareHeader/CompareHeader';
import { Repo } from '../../components/CompareHeader/RepoSelector';
import Image from '../../components/Image';
import { useTotalEvents } from '../../components/RemoteCharts/hook';
import TopList from '../../components/TopList';
import useVisibility from '../../hooks/visibility';
import CustomPage from '../../theme/CustomPage';
import AnalyzeSelectorComponent from './_components/AnalyzeSelectorComponent';
import { Realtime } from './_components/realtime';
import Section from './_components/Section';
import Tag from './_components/Tag';
import { Body, fontSizes, H1, H2, H2Plus, Headline, Span, Subtitle } from './_components/typography';

const Item = styled(Box)(({theme}) => ({
  paddingLeft: theme.spacing(4),
  paddingRight: theme.spacing(4),
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

const StyledAnimatedNumber = styled(AnimatedNumber)({
  color: '#E30C34',
  marginLeft: 4,
  marginRight: 4,
})

const TotalNumber = () => {
  const visible = useVisibility()
  const { inView, ref } = useInView()
  const total = useTotalEvents(inView && visible)

  return (
    <div style={{ display: 'inline' }} ref={ref}>
      <StyledAnimatedNumber value={total} hasComma duration={200} size={24} />
    </div>
  )
}

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
    if (!repo1 || !repo2) {
      return undefined
    }
    return `/analyze/${repo1.name}?vs=${encodeURIComponent(repo2.name)}`
  }, [repo1, repo2])

  return (
    <CustomPage
      title={"OSS Insight"}
      description={"The comprehensive Open Source Software insight tool by analyzing massive events from GitHub, powered by TiDB, the best insight building database of data agility."}
      dark
    >
      <Section pt={4}>
        <Stack
          divider={<Divider orientation="vertical" flexItem />}
          direction={stackDirection}
        >
          <AlignRightItem>
            <Headline>
              Get insights from
              <TotalNumber />
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
            <AnalyzeSelectorComponent />
            <Body>
              Powered by
              <a href="https://en.pingcap.com/tidb-cloud/?utm_source=ossinsight&utm_medium=referral" target="_blank">
                <Logo src='/img/tidb-logo-o.png' height={24} alt='TiDB' />
              </a>
            </Body>
          </AlignRightItem>
          <Item sx={[{flex: 0.618}, fontSizes.h1]}>
            <Realtime />
          </Item>
        </Stack>
      </Section>
      <Section darker>
        <Stack direction={stackDirection} alignItems='center'>
          <Item>
            <H2>
            Ranked & Dynamic
              <br />
              <H2Plus sx={{color: '#FFE895'}}>
              Collections
              </H2Plus>
            </H2>
            <Subtitle>
            Explore the <b>Monthly & Historical</b> rankings and trends
              <br />
              in a technical field：
            </Subtitle>
            <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 2, mt: 3}}>
              <Tag color='#E63E6D' to='/collections/open-source-database'>
                Open Source Database
              </Tag>
              <Tag color='#E30C34' to='/collections/javascript-framework'>
                JavaScript Framework
              </Tag>
              <Tag color='#FEC260' to='/collections/web-framework'>
                Web Framework
              </Tag>
              <Tag color='#F15A24' to='/collections/static-site-generator'>
                Static Site Generator
              </Tag>
              <Tag color='#F87C00' to='/collections/low-code-development-tool'>
                Lowcode Development Tools
              </Tag>
            </Box>
          </Item>
          <Item>
          <AspectRatio ratio={1920 / 1280} style={{ width: '100%' }}>
            <video width="100%" height="100%" autoPlay loop muted >
            <source src={require('./videos/bar-chart-race.mp4').default} type="video/mp4"/>
            </video>
          </AspectRatio>
          </Item>
        </Stack>
      </Section>
      <Section>
        <Stack direction={stackDirection} alignItems='center'>
          <Item>
            <H2 id='compare'>
              Visual & Comprehensive
              <br />
              <H2Plus sx={{color: '#FFE895'}}>
                Compare
              </H2Plus>
            </H2>
            <Subtitle>
              Track the code <b>activity & community metrics</b>.
              <br />
              Find out who is participating,
              <br />
              and in which regions or companies are they located.
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
              <Button component={Link} variant='contained' href={compare} disabled={!repo1 || !repo2}>
                go!
              </Button>
            </Box>
          </Item>
          <Item>
            <AspectRatio ratio={1284 / 1273}>
              <Image src={require('./images/analyze.png').default} style={{width: '100%', height: '100%'}} />
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
