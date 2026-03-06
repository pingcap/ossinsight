import Section, { SubSection } from '../_components/Section';
import React from 'react';
import Split from '../_components/Split';
import Insights from '../_components/Insights';
import { RankChart } from '../_components/charts';
import { H2, H3, P2 } from '../_components/typograph';
import { AdditionalTag, BR, ResponsiveAlignedRight, ResponsiveColumnFlex } from '../_components/styled';

export default function () {
  return (
    <Section>
      <SubSection>
        <Split>
          <ResponsiveColumnFlex maxWidth={711}>
            <H2 whiteSpace="pre-wrap">{title}</H2>
            <P2>{description}</P2>
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
            <AdditionalTag>Additional Notes</AdditionalTag>
            <H3>{backendTitle}</H3>
            <P2>{backendDescription}</P2>
            <Insights mt={[2, 2, 4]}>
              {backendInsights}
            </Insights>
          </ResponsiveColumnFlex>
          <ResponsiveAlignedRight>
            <RankChart
              data={require('../_charts/backend-languages.json')}
              aspect={8 / 10}
              sx={{ maxWidth: 600 }}
              footnote={backendFootnote}
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

const description = 'This chart ranks programming languages ​​yearly from 2019 to 2022 based on the ratio of new repositories using these languages to all new repositories.';

const insights = (
  <>
    Python surpassed Java and moved to <strong>#3</strong> in 2021.
    <BR />
    TypeScript rose from #10 to <strong>#6</strong>, and SCSS rose from #39 to <strong>#19</strong>. The rise of SCSS shows that open source projects that
    value front-end expressiveness are gradually gaining popularity.
    <BR />
    The two languages Ruby and R dropped a lot in ranking over the years.
  </>
);

const footnote = '* 2022: 01.01-09.30, excluding forking repositories';

const backendTitle = 'Rankings of back-end programming languages';

const backendDescription = 'The programming languages used in a pull request reflect which languages developers used. To find out the most popular back-end programming languages, we queried the distribution of programming languages by new pull requests from 2019 to 2022 and took the top 10 for each year.';

const backendInsights = (
  <>
    Python and Java rank #1 and #2 respectively. In 2021, Go overtook Ruby to rank <strong>#3</strong> in 2021.
    <BR />
    Rust has been trending upward for several years, ranking <strong>#9</strong> in 2022.
  </>
);

const backendFootnote = '* 2022: 01.01-09.30, excluding bot events';
