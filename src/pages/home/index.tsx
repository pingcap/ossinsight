import React, {useCallback, useState} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import WordCloud from "../../components/WordCloud";
import TopList from "../../components/TopList";
import Section from './_components/Section';
import CustomPage from "../../theme/CustomPage";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import {styled, recomposeColor} from '@mui/material/styles';
import Typography, {TypographyProps} from "@mui/material/Typography";
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import Chip from "@mui/material/Chip";
import {alpha, decomposeColor} from "@mui/material";
import Tag from "./_components/Tag";
import Image from "../../components/Image";
import AspectRatio from "react-aspect-ratio";
import CompareHeader from "../../components/CompareHeader/CompareHeader";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";

const Item = styled(Box)(({theme}) => ({
  padding: theme.spacing(4),
  flex: 1
}))

const Span = (props: TypographyProps) => <Typography {...props} component='span' display='inline' variant='inherit' />

const Logo = styled('img')(({theme}) => ({
  verticalAlign: 'text-bottom',
  marginLeft: theme.spacing(1),
}))

const formatHugeNumber = (x: number) => {
  return x.toLocaleString("en")
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  const [period, setPeriod] = useState('last_hour')
  const [repo1, setRepo1] = useState(undefined)
  const [repo2, setRepo2] = useState(undefined)
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
    <CustomPage
      title={siteConfig.title}
      description={siteConfig.tagline}
      dark
    >
      <Section>
        <Stack
          divider={<Divider orientation="vertical" flexItem />}
          direction='row'
        >
          <Item sx={{textAlign: 'right'}}>
            <Typography
              sx={{color: '#C4C4C4'}}
              fontSize={24}
            >
              Get insights from
              <Span sx={{color: '#E30C34', mx: 0.5}}>
                {formatHugeNumber(4300000000)}
              </Span>
              GitHub events
            </Typography>
            <Typography variant='h1' sx={{fontSize: 80}}>
              Open Source Software
              <br />
              <Span sx={{color: '#FFE895'}}>
                <VisibilityOutlinedIcon fontSize='inherit' sx={{verticalAlign: 'text-bottom'}} />
                Insight
              </Span>
            </Typography>
            <Typography variant='body2' sx={{fontSize: 20, color: '#C4C4C4', mt: 14}}>
              Powered by
              <Logo src='/img/tidb_cloud.png' width={108} height={24} alt='TiDB Cloud' />
            </Typography>
          </Item>
          <Item sx={{flex: 0.618}} style={{fontSize: 80}}>
            <WordCloud period='last_hour'>
              <span></span>
            </WordCloud>
          </Item>
        </Stack>
      </Section>
      <Section darker>
        <Stack direction='row' alignItems='center'>
          <Item>
            <Typography variant='h1' style={{fontSize: 48}}>
              Historical / real-time
              <br />
              <Span sx={{color: '#FFE895', fontSize: 64}}>
                Insight
              </Span>
            </Typography>
            <Typography variant='subtitle1' component='p' sx={{fontSize: 24, mt: 7}}>
              Explore the <b>Popularity & Activity trends</b>
              <br />
              in a technical field：
            </Typography>
            <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 2, mt: 3}}>
              <Tag color='#E63E6D'>
                Database
              </Tag>
              <Tag color='#E30C34'>
                JavaScript Framework
              </Tag>
              <Tag color='#FEC260'>
                Web Framework
              </Tag>
              <Tag color='#F15A24'>
                Programming Languages
              </Tag>
              <Tag color='#F87C00'>
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
        <Stack direction='row' alignItems='center'>
          <Item>
            <Typography variant='h1' style={{fontSize: 48}}>
              Visually & Comprehensive
              <br />
              <Span sx={{color: '#FFE895', fontSize: 64}}>
                Compare
              </Span>
            </Typography>
            <Typography variant='subtitle1' component='p' sx={{fontSize: 24, mt: 7}}>
              Track <b>the code activity & community metrics</b>.
              <br />
              Find out who is participating,
              <br />
              and in which <b>regions</b> or <b>companies</b> are they located.
            </Typography>
            <Box sx={{mt: 3, display: 'flex', alignItems: 'center', gap: 2}}>
              <CompareHeader
                repo1={repo1}
                repo2={repo2}
                onRepo1Change={setRepo1}
                onRepo2Change={setRepo2}
                onRepo1Valid={onRepo1Valid}
                onRepo2Valid={onRepo2Valid}
                sx={{backgroundColor: 'transparent', flex: 1, borderBottom: 'none'}}
              />
              <Button variant='contained'>
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
