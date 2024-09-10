import { css, styled } from '@mui/material';
import { Section, SectionContent, SectionTitle } from '@site/src/pages/open-source-heroes/_components/Section';
import { motion } from 'framer-motion';
import React, { Fragment } from 'react';

export function HowItWorks () {
  return (
    <ThisSection initial="initial" whileInView="hover" viewport={{ amount: 0.6, once: true }}>
      <ThisSectionContent>
        <SectionTitle>
          How it Works
        </SectionTitle>
        <Features layout="size">
          {items.map((item, index) => (
            <Fragment key={index}>
              {index > 0 && <FeatureSplitter />}
              <Feature key={index} style={{ '--color1': item.color1, '--color2': item.color2 }}>
                <FeatureTitle>{item.title}</FeatureTitle>
                <FeatureIndicatorBar>
                  <FeatureIndicatorInnerCircle />
                </FeatureIndicatorBar>
                <FeatureDescription transition={{ delay: index * 0.1, bounce: 0 }} variants={animations}>
                  <FeatureDescriptionLine />
                  <FeatureDescriptionCircle />
                  {item.description}
                </FeatureDescription>
              </Feature>
            </Fragment>
          ))}
        </Features>
      </ThisSectionContent>
    </ThisSection>
  );
}

const animations = {
  initial: { opacity: 0, y: -26 },
  hover: { opacity: 1, y: 0 },
};

const ThisSection = motion(styled(Section)`
  ${({ theme }) => ({
    [theme.breakpoints.up('lg')]: css`
      padding-top: 0;
    `,
  })}
`);

const ThisSectionContent = styled(SectionContent)`
  display: block;
  ${({ theme }) => ({
    [theme.breakpoints.up('lg')]: css`
      display: flex;
      gap: 48px;

      h2 {
        font-size: 24px;
        line-height: 36px;
      }
    `,
  })}
`;

const Features = motion(styled('div')`
  display: flex;
  gap: 24px;
  align-items: center;
  justify-content: space-between;
  padding: 0;
  list-style: none;
  flex-direction: column;

  ${({ theme }) => ({
    [theme.breakpoints.up('md')]: css`
      display: flex;
      flex-direction: row;
      align-items: flex-start;
    `,
  })}
`);

const FeatureSplitter = styled('li')`
  flex: 0.6;
  height: 1px;
  background-color: #6E6E6E;
  margin-top: 64px;
  display: none;

  ${({ theme }) => ({
    [theme.breakpoints.up('md')]: css`
      display: block;
    `,
  })}
`;

const Feature = styled('div')`
  flex: 1;
  max-width: 344px;
`;

const FeatureTitle = styled('h3')`
  font-size: 24px;
  line-height: 36px;
`;
const FeatureDescription = motion(styled('div')`
  max-width: 100%;
  overflow: hidden;
  font-size: 18px;
  line-height: 28px;
`);

const FeatureIndicatorBar = styled('div')`
  background-color: var(--color1);
  height: 28px;
  border-radius: 9999px;
  padding: 5px;
`;

const FeatureIndicatorInnerCircle = styled('div')`
  width: 18px;
  height: 18px;
  border-radius: 9px;
  border: 4px solid var(--color2);
  background-color: white;
`;

const FeatureDescriptionLine = styled('div')`
  margin-left: 13px;
  height: 32px;
  width: 1px;
  background-color: var(--color1);
`;

const FeatureDescriptionCircle = styled('div')`
  margin-left: 4px;
  width: 18px;
  height: 18px;
  border-radius: 9px;
  border: 4px solid var(--color1);
  background-color: white;
`;

type Item = {
  title: string;
  description: string;
  color1: string;
  color2: string;
};

const items: Item[] = [
  {
    title: 'Link your Github',
    description: 'Developers who actively contribute to open-source projects on GitHub are eligible. We\'ll consider factors like lines of code written, commits made, and pull requests submitted.',
    color1: '#B2DFF2',
    color2: '#238AB5',
  },
  {
    title: 'Claim your Credits',
    description: 'Simply sign in OssInsight with Github account. We\'ll calculate your credit allocation based on your contributions. Just claim it with one click.',
    color1: '#FFE895',
    color2: '#A58927',
  },
  {
    title: 'Start Building',
    description: 'Once you have your credits, use them to build any project you want on TiDB Serverless. TiDB Serverless provides a full set of on-boarding supports and a few sets of sample data to help you get started.',
    color1: '#C1F6E2',
    color2: '#73D9B4',
  },
];
