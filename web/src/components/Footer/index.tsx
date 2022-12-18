import { Cards, StandardCard } from '../Cards';
import React from 'react';
import Section from '../../pages/home/_components/Section';
import GitHubButton from 'react-github-btn';
import { Typography, Box } from '@mui/material';

const icon = (src) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
      <img src={src} alt='logo' width='54' height='54' />
    </Box>
  );
};

export default function Footer ({ sideWidth }: { sideWidth?: string }) {
  return (
    <>
      <Section sideWidth={sideWidth}>
        <Typography variant='h2' sx={{ fontSize: 40 }} align='center'>
          Wonder how OSS Insight works?
        </Typography>
        <Cards sx={{ mt: 2 }} xs={12} sm={6} md={4}>
          <StandardCard
            title='How do we implement OSS Insight ?'
            description='Blog: 10 min read'
            codeStyleDescription={false}
            readMore='/blog/why-we-choose-tidb-to-support-ossinsight'
            buttonVariant='outlined'
            top={icon(require('./icon-1.png').default)}
            cardSx={{
              backgroundColor: '#2c2c2c',
            }}
          />
          <StandardCard
            title='Use TiDB Cloud to Analyze GitHub Events in 10 Minutes'
            description='Tutorial: 10 min read'
            codeStyleDescription={false}
            readMore='/blog/try-it-yourself'
            buttonVariant='outlined'
            top={icon(require('./icon-2.png').default)}
            cardSx={{
              backgroundColor: '#2c2c2c',
            }}
          />
          <StandardCard
            title='Join a Workshop to Setup a Mini OSS Insight'
            description='Tutorial: 25 min'
            codeStyleDescription={false}
            readMore='/docs/workshop/mini-ossinsight/introduction'
            buttonVariant='outlined'
            top={icon(require('./icon-3.png').default)}
            cardSx={{
              backgroundColor: '#2c2c2c',
            }}
          />
        </Cards>
      </Section>
      <Section darker sideWidth={sideWidth}>
        <div className="text--center">
          <h3>
            Follow us at&nbsp;
            <a href="https://twitter.com/OSSInsight">@OSSInsight</a>
            &nbsp;and join the conversation using the hashtags
            <br />
            <a href="https://twitter.com/hashtag/OSSInsight" target='_blank' rel="noreferrer">
              #OSSInsight
            </a>
            &nbsp;
            <a href="https://twitter.com/hashtag/TiDBCloud" target='_blank' rel="noreferrer">
              #TiDBCloud
            </a>
          </h3>
          <GitHubButton href="https://github.com/pingcap/ossinsight" data-size="large" data-show-count="true" aria-label="Star pingcap/ossinsight on GitHub">Star</GitHubButton>
        </div>
      </Section>
    </>
  );
}
