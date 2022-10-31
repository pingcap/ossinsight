import Layout from "@theme/Layout";
import React, { useEffect, useRef } from "react";
import Container from "@mui/material/Container";
import Head from "@docusaurus/Head";
import { styled } from "@mui/material/styles";
import { highlights } from "./_sections/0-Banner";
import { paramCase } from "param-case";
import { SectionContext } from "./_components/Section";
import { Scrollspy } from '@makotot/ghostui';

const fonts = [
  'https://fonts.googleapis.com/css?family=JetBrains+Mono',
  'https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@1,100&display=swap',
];

const sections = [
  require('./_sections/0-Banner'),
  require('./_sections/1-Keynotes'),
  require('./_sections/2-Languages'),
  require('./_sections/3-Countries'),
  require('./_sections/4-Topics'),
  require('./_sections/5-PopularRepos'),
  require('./_sections/6-ActiveRepos'),
  require('./_sections/7-Stargazers'),
  require('./_sections/8-MostActiveDevelopers'),
  require('./_sections/9-WeekdayWeekend'),
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
            <Container component="main" maxWidth="xl" sx={{ py: 8 }}>
              {sections.map(({ default: Section }, i) => (
                <SectionContext.Provider key={i} value={{ id: ids[i], ref: refs[i] }}>
                  <Section />
                </SectionContext.Provider>
              ))}
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
});
