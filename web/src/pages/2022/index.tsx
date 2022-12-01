import Layout from '@theme/Layout';
import React, { useMemo, useRef } from 'react';
import Head from '@docusaurus/Head';
import { highlights } from './_sections/0-Banner';
import { paramCase } from 'param-case';
import { SectionContext } from './_components/Section';
import Share from './_components/Share';
import { Scrollspy } from '@makotot/ghostui';
import { AnimatedDownIcon, MrO } from './_components/styled';

import { Container, styled } from '@mui/material';
import BrowserHash from '@site/src/components/BrowserHash';

const fonts = [
  'https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,400;0,600;0,700;1,100;1,400;1,600&display=swap',
];

const sections = [
  require('./_sections/0-Banner'),
  require('./_sections/2-Languages'),
  require('./_sections/3-Countries'),
  require('./_sections/4-WeekdayWeekend'),
  require('./_sections/5-Topics'),
  require('./_sections/6-PopularRepos'),
  require('./_sections/7-ActiveRepos'),
  require('./_sections/8-Stargazers'),
  require('./_sections/9-MostActiveDevelopers'),
  require('./_sections/99-Appendix'),
];

const ids: Array<string | undefined> = [
  undefined,
  ...highlights.map(h => paramCase(h)),
  'term-description',
];

if (sections.length !== ids.length) {
  throw new Error(`sections size (${sections.length}) must equals to ids size (${ids.length})`);
}

export default function Page () {
  const refs = sections.map(() => useRef<HTMLDivElement | null>(null));
  return (
    <Layout
      title={title}
      description={description}
      keywords={keywords}
      image={image}
    >
      <Head>
        {fonts.map(font => (
          <link key={font} href={font} rel="stylesheet" />
        ))}
      </Head>
      <Scrollspy sectionRefs={refs} offset={-120}>
        {({ currentElementIndexInViewport }) => (
          <PageContainer>
            <BrowserHash value={ids[currentElementIndexInViewport]} />
            <Share />
            <Container component="main" maxWidth="lg" sx={theme => ({
              py: 2,
              [theme.breakpoints.up('md')]: {
                py: 6,
              },
            })}>
              <MrO width="296.8" height="456" src={require('./_icons/mro.png').default} alt="Logo" />
              <AnimatedDownIcon className="animated-down-icon" />
              {useMemo(() => sections.map(({ default: Section }, i) => (
                <SectionContext.Provider key={i} value={{ id: ids[i], ref: refs[i] }}>
                  <Section />
                </SectionContext.Provider>
              )), [sections])}
            </Container>
          </PageContainer>
        )}
      </Scrollspy>
    </Layout>
  );
}

const title = 'Open Source Highlights: Trends and Insights from GitHub 2022';
const description = 'We analyzed 5 billion+ GitHub events and got interesting findings about open source software, such as top programming languages, geographic distribution behavior by country or region, popular open source topics, and the most active repositories and developers.';
const keywords = 'GitHub annual report, GitHub 2022, The State of the Octoverse, GitHub insights, Open Source, top programming languages, most active developers, most active repositories';
const image = '/img/2022/thumbnail.png';

const PageContainer = styled('div', { label: 'PageContainer' })(({ theme }) => ({
  background: 'transparent linear-gradient(180deg, #242526 0%, #0B003B 100%) 0% 0% no-repeat padding-box',
  fontFamily: "'JetBrains Mono', monospace",
  overflow: 'hidden',
  fontSize: 14,
  [theme.breakpoints.up('md')]: {
    fontSize: 16,
  },
  [theme.breakpoints.up('lg')]: {
    fontSize: 20,
  },
}));
