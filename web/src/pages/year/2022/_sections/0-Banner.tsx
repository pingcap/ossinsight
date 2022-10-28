import Section from "@site/src/pages/year/2022/_components/Section";
import React from "react";
import { P2, H1 } from "@site/src/pages/year/2022/_components/typograph";
import CodeIcon from '@mui/icons-material/Code';
import { HeadlineTag, LI, UL } from "@site/src/pages/year/2022/_components/styled";

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
            <P2>- {highlight}</P2>
          </LI>
        ))}
      </UL>
    </Section>
  );
}

const description = `We analyzed more than 5,000,000,000 rows of GitHub event data and got the results here. In this report, you’ll get interesting findings about open source software on GitHub, including:`;

const highlights: string[] = [
  'Top programming languages from 2019 to 2022',
  'Geographic distribution behavior by country or region',
  'Popular open source topics from 2019 to 2022',
  'The most popular repositories in 2022',
  'The most active repositories from 2019 to 2022',
  'The developer who gave the most stars in 2022',
  'The most active developers since 2011',
  'Developer behavior distribution on weekdays and weekends',
];
