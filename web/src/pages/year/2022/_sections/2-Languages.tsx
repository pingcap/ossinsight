import Section, { SubSection } from "@site/src/pages/year/2022/_components/Section";
import React from "react";
import Split from "@site/src/pages/year/2022/_components/Split";
import Insights from "@site/src/pages/year/2022/_components/Insights";
import { RankChart } from "../_components/charts";
import _LanguagesChart from '../_charts/languages.svg';
import _BackendLanguagesChart from '../_charts/backend-languages.svg';
import { styled } from "@mui/material/styles";
import { H2, H3, P2 } from "../_components/typograph";
import { BR, ResponsiveAlignedRight, ResponsiveColumnFlex, Spacer } from "../_components/styled";

export default function () {
  return (
    <Section>
      <SubSection>
        <Split spacing={2}>
          <ResponsiveColumnFlex maxWidth={711}>
            <H2 whiteSpace="pre-wrap">{title}</H2>
            <P2 mt={3}>{description}</P2>
            <Spacer />
            <Insights>
              {insights}
            </Insights>
          </ResponsiveColumnFlex>
          <ResponsiveAlignedRight>
            <RankChart data={require('../_charts/languages.json')} aspect={7 / 10} sx={{ maxWidth: 600 }} />
          </ResponsiveAlignedRight>
        </Split>
      </SubSection>
      <SubSection>
        <Split spacing={2}>
          <ResponsiveColumnFlex maxWidth={711}>
            <H3>{backendTitle}</H3>
            <P2 mt={3}>{backendDescription}</P2>
            <Spacer />
            <Insights>
              {backendInsights}
            </Insights>
          </ResponsiveColumnFlex>
          <ResponsiveAlignedRight>
            <RankChart data={require('../_charts/backend-languages.json')} aspect={7 / 10} sx={{ maxWidth: 600 }} />
          </ResponsiveAlignedRight>
        </Split>
      </SubSection>
    </Section>
  );
}

const LanguagesChart = styled(_LanguagesChart)({
  maxWidth: 656,
});

const title = `Top languages 
in the open source world 
over the past four years`;

const description = `This chart ranks programming languages ​​yearly from January 1, 2019 to September 30, 2022 based on the ratio of new repositories using these languages to all new repositories. We filtered out forking projects.`;

const insights = (
  <>
    JavaScript and HTML consistently rank #1, with Python surpassing Java and moving to #3 in 2021.
    <BR />
    In 2022, TypeScript rose from #10 to #6, and SCSS rose from #39 to #19. The rise of SCSS shows that open source
    projects that value front-end expressiveness are gradually gaining popularity.
    <BR />
    The two languages Ruby and R dropped a lot in ranking over the years.
  </>
);


const BackendLanguagesChart = styled(_BackendLanguagesChart)({
  maxWidth: 542,
});

const backendTitle = `Rankings of back-end programming languages`;

const backendDescription = `Front-end languages are used more often in new repositories. But the programming language used in a pull request reflect which languages developers used. To find out the most popular back-end programming languages, we queried the distribution of new pull requests from January 1, 2019 to September 30, 2022 and took the top 10 for each year. We filtered out bot events.`;

const backendInsights = (
  <>
    Python and Java rank #1 and #2 respectively. In 2021, Go overtook Ruby to rank #3 in 2021.
    <BR />
    Rust has been trending upward for several years, reaching 1.8% in 2022, ranking #9.
  </>
);