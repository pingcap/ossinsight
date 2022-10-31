import Section, { SubSection } from "@site/src/pages/year/2022/_components/Section";
import React from "react";
import Split from "@site/src/pages/year/2022/_components/Split";
import Insights from "@site/src/pages/year/2022/_components/Insights";
import { RankChart } from "../_components/charts";
import { H2, H3, P2 } from "../_components/typograph";
import { BR, ResponsiveAlignedRight, ResponsiveColumnFlex, Spacer } from "../_components/styled";

export default function () {
  return (
    <Section>
      <SubSection>
        <Split>
          <ResponsiveColumnFlex maxWidth={711}>
            <H2 whiteSpace="pre-wrap">{title}</H2>
            <P2>{description}</P2>
            <Spacer />
            <Insights mt={[2, 2, 4]}>
              {insights}
            </Insights>
          </ResponsiveColumnFlex>
          <ResponsiveAlignedRight>
            <RankChart
              data={require('../_charts/languages.json')}
              aspect={8 / 10}
              sx={{ maxWidth: 600 }}
              footnote={footnote}
            />
          </ResponsiveAlignedRight>
        </Split>
      </SubSection>
      <SubSection>
        <Split spacing={2}>
          <ResponsiveColumnFlex maxWidth={711}>
            <H3>{backendTitle}</H3>
            <P2>{backendDescription}</P2>
            <Spacer />
            <Insights mt={[2, 2, 4]}>
              {backendInsights}
            </Insights>
          </ResponsiveColumnFlex>
          <ResponsiveAlignedRight>
            <RankChart
              data={require('../_charts/backend-languages.json')}
              aspect={8 / 10}
              sx={{ maxWidth: 600 }}
              footnote={footnote}
            />
          </ResponsiveAlignedRight>
        </Split>
      </SubSection>
    </Section>
  );
}

const title = `Top languages 
in the open source world 
over the past four years`;

const description = `This chart ranks programming languages ​​yearly from 2019 to 2022 based on the ratio of new repositories using these languages to all new repositories.`;

const insights = (
  <>
    Python surpassed Java and moved to #3 in 2021.
    <BR />
    TypeScript rose from #10 to #6, and SCSS rose from #39 to #19. The rise of SCSS shows that open source projects that
    value front-end expressiveness are gradually gaining popularity.
    <BR />
    The two languages Ruby and R dropped a lot in ranking over the years.
  </>
);

const footnote = '* 2022: 01.01-09.01, exclude fork repositories';


const backendTitle = `Rankings of back-end programming languages`;

const backendDescription = `The programming languages used in a pull request reflect which languages developers used. To find out the most popular back-end programming languages, we queried the distribution of programming languages by new pull requests from 2019 to 2022 and took the top 10 for each year.`;

const backendInsights = (
  <>
    Python and Java rank #1 and #2 respectively. In 2021, Go overtook Ruby to rank #3 in 2021.
    <BR />
    Rust has been trending upward for several years, ranking #9 in 2022.
  </>
);

const backendFootnote = '* 2022: 01.01-09.01, exclude bots';