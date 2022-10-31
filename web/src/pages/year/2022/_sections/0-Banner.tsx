import Section from "@site/src/pages/year/2022/_components/Section";
import React from "react";
import { P2, H1 } from "@site/src/pages/year/2022/_components/typograph";
import CodeIcon from '@mui/icons-material/Code';
import { A, HeadlineTag, LI, UL } from "@site/src/pages/year/2022/_components/styled";
import { paramCase } from "param-case";

export default function () {
  return (
    <Section>
      <HeadlineTag>
        <span>
          Open Source Highlights
        </span>
        <CodeIcon fontSize="inherit" sx={{ ml: 1 }} />
      </HeadlineTag>
      <H1>
        Trends and Insights from GitHub 2022
      </H1>
      <P2 mt={8}>
        {description}
      </P2>
      <UL sx={{ mt: 4 }}>
        {highlights.map(highlight => (
          <LI key={highlight}>
            <P2>
              <A href={`#${paramCase(highlight)}`}>
                - {highlight}
              </A>
            </P2>
          </LI>
        ))}
      </UL>
    </Section>
  );
}

const description = `We analyzed more than 5,000,000,000 rows of GitHub event data and got the results here. In this report, you'll get interesting findings about open source software on GitHub in 2022, including:`;

const highlights: string[] = [
  'Top programming languages in open source',
  'Geographic distribution behavior by country or region',
  'Popular open source topics',
  'The most popular repositories',
  'The most active repositories',
  'The developers who gave the most stars',
  'The most active developers',
  'Developer behavior distribution on weekdays and weekends',
];
