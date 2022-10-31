import Layout from "@theme/Layout";
import React, { useEffect, useMemo, useRef } from "react";
import Container from "@mui/material/Container";
import Head from "@docusaurus/Head";
import { styled } from "@mui/material/styles";
import { highlights } from "./_sections/0-Banner";
import { paramCase } from "param-case";
import { SectionContext } from "./_components/Section";
import Share from "./_components/Share";
import { Scrollspy } from '@makotot/ghostui';
import { useHistory } from "@docusaurus/router";
import { AnimatedDownIcon, MrO } from "@site/src/pages/year/2022/_components/styled";

const fonts = [
  'https://fonts.googleapis.com/css?family=JetBrains+Mono',
  'https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@1,100&display=swap',
];

const sections = [
  require('./_sections/0-Banner'),
  require('./_sections/1-Keynotes'),
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

const ids: (string | undefined)[] = [
  undefined,
  undefined,
  ...highlights.map(h => paramCase(h)),
  undefined,
];

if (sections.length !== ids.length) {
  throw new Error(`sections size (${sections.length}) must equals to ids size (${ids.length})`);
}

export default function Page() {
  const refs = sections.map(() => useRef<HTMLDivElement | null>(null));
  return (
    <Layout>
      <Head>
        {fonts.map(font => (
          <link key={font} href={font} rel="stylesheet" />
        ))}
      </Head>
      <Scrollspy sectionRefs={refs} offset={-170}>
        {({ currentElementIndexInViewport }) => (
          <PageContainer>
            <BrowserHash value={ids[currentElementIndexInViewport]} />
            <Share />
            <Container component="main" maxWidth="lg" sx={{ py: 6 }}>
              <MrO width='371' height='570' src={require('./_icons/mro.png').default} alt='Logo' />
              <AnimatedDownIcon className='animated-down-icon' />
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

function BrowserHash({ value }: { value: string | undefined }) {
  useEffect(() => {
    history.replaceState(null, null, value ? `#${value}` : location.pathname + location.search)
  }, [value]);
  return <></>;
}

const PageContainer = styled('div', { label: 'PageContainer' })({
  background: "transparent linear-gradient(180deg, #242526 0%, #0B003B 100%) 0% 0% no-repeat padding-box",
  fontSize: 20,
  overflow: 'hidden',
});
