import Section from '../_components/Section';
import React from 'react';
import { H1, P2 } from '../_components/typograph';
import CodeIcon from '@mui/icons-material/Code';
import { A, Footnote, HeadlineTag, LI, UL } from '../_components/styled';
import { paramCase } from 'param-case';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import { Grid } from '@mui/material';

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
      <P2 mt={4} maxWidth={880}>
        {description}
      </P2>
      <Grid component={UL} container mt={4} fontSize='0.8em' color='#E3E3E3' maxWidth={880} spacing={1}>
        {highlights.map(highlight => (
          <Grid component={LI} item key={highlight} xs={12} sm={6}>
            <A href={`#${paramCase(highlight)}`}>
              {highlight}
            </A>
          </Grid>
        ))}
      </Grid>
      <Footnote sx={{ mt: 3 }}>
        <A href='#term-description'>
          <InfoIcon fontSize='inherit' sx={{ verticalAlign: -2, mr: 0.5 }} />
          Term description
        </A>
      </Footnote>
    </Section>
  );
}

const description = 'We analyzed more than 5,000,000,000 rows of GitHub event data and got the results here. In this report, you\'ll get interesting findings about open source software on GitHub in 2022, including:';

export const highlights: string[] = [
  '⌨️ Top programming languages',
  '🌍 Geographic distribution',
  '📅 Contribution time allocation',
  '📈 Technology trends',
  '🔥 The most popular repositories',
  '✨ The most active repositories',
  '🌟 Top stargazers',
  '🤖 The most active developers',
];
