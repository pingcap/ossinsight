import React from 'react';
import Section from '../_components/Section';
import Repos, { ReposProps } from '../_components/Repos';
import { Footnote } from '../_components/styled';
import { Grid } from '@mui/material';

export default function () {
  return (
    <Section
      title={title}
      description={description}
    >
      <Grid
        container
        spacing={2}
        height={700}
        mt={[2, 4, 6]}
        direction="row"
        sx={(theme) => ({
          height: 'unset',
          [theme.breakpoints.up('md')]: {
            height: 700,
          },
        })}
      >
        <Grid container item sm={12} md={groupSpan(0, 1)} spacing={2} height="100%" direction="column" wrap="nowrap">
          <Grid item xs={span(0, 1)}>
            <Repos {...repos[0]} />
          </Grid>
          <Grid item xs={span(1, 0)}>
            <Repos {...repos[1]} />
          </Grid>
        </Grid>
        <Grid container item sm={12} md={groupSpan(2, 3)} spacing={2} height="100%" direction="column" wrap="nowrap">
          <Grid item xs={span(2, 3)}>
            <Repos {...repos[2]} />
          </Grid>
          <Grid item xs={span(3, 2)}>
            <Repos {...repos[3]} />
          </Grid>
        </Grid>
      </Grid>
      <Footnote>{footnote}</Footnote>
    </Section>
  );
}

const title = 'The most popular repositories in 2022';
const description = 'The number of stars is the most visible indication of the popularity of open source projects. We looked at the 50 projects that received the most stars from January 1 to September 30, 2022.';
const footnote = '* Time range: 2022.01.01-2022.09.30, excluding bot events';

function span (n: number, o: number) {
  return parseInt(repos[n].percent) / (parseInt(repos[n].percent) + parseInt(repos[o].percent)) * 12;
}

function groupSpan (a, b) {
  return (parseInt(repos[a].percent) + parseInt(repos[b].percent)) / 100 * 12;
}

const repos: ReposProps[] = [{
  color: 'orange',
  category: 'technology',
  value: 7,
  percent: '14%',
  list: [
    'carbon-language/carbon-lang',
    'tauri-apps/tauri',
    'httpie/httpie',
    'CompVis/stable-diffusion',
    'Facebook/react',
    'torvalds/linux',
    'yt-dlp/yt-dlp',
  ],
}, {
  color: 'green',
  category: 'spam',
  value: 9,
  percent: '38%',
  list: [
    '* Suspected to be iterations of bots.',
  ],
}, {
  color: 'purple',
  category: 'education',
  value: 12,
  percent: '24%',
  list: [
    'Anduin2017/HowToCook',
    'donnemartin/system-design-primer',
    'jwasham/coding-interview-university',
    '...',
  ],
}, {
  color: 'blue',
  category: 'awesome',
  value: 12,
  percent: '24%',
  list: [
    'sindresorhus/awesome',
    'public-apis/public-apis',
    'EbookFoundation/free-programming-books',
    '...',
  ],
}];
