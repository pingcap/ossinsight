import { css, styled } from '@mui/material';
import { Section, SectionContent, SectionTitle } from '@site/src/pages/open-source-heroes/_components/Section';
import React, { Fragment } from 'react';

export function HowItWorks () {
  return (
    <ThisSection>
      <ThisSectionContent>
        <SectionTitle style={{ marginBottom: 0 }}>
          How it Works
        </SectionTitle>
        <Features>
          {items.map((item, index) => (
            <Fragment key={index}>
              {index > 0 && <FeatureSplitter />}
              <FeatureTitle>{item.title}</FeatureTitle>
            </Fragment>
          ))}
        </Features>
      </ThisSectionContent>
    </ThisSection>
  );
}

const ThisSection = styled(Section)`
  ${({ theme }) => ({
    [theme.breakpoints.up('lg')]: css`
      padding-top: 0;
    `,
  })}
`;

const ThisSectionContent = styled(SectionContent)`
  display: flex;
  gap: 32px;
  align-items: center;
  justify-content: center;
  width: max-content;

  flex-direction: column;

  ${({ theme }) => ({
    [theme.breakpoints.up('md')]: css`
      flex-direction: row;
    `,
  })}
  
  h2 {
    font-size: 32px;
    line-height: 36px;
  }
`;

const Features = styled('div')`
  flex: 1;
  display: flex;
  gap: 24px;
  align-items: center;
  justify-content: center;
  padding: 0;
  list-style: none;
  width: max-content;
  flex-direction: column;

  ${({ theme }) => ({
    [theme.breakpoints.up('md')]: css`
      flex-direction: row;
    `,
  })}
`;

const FeatureSplitter = styled('li')`
  width: 94px;
  height: 1px;
  flex-shrink: 0;
  background-color: #6E6E6E;
  display: none;

  ${({ theme }) => ({
    [theme.breakpoints.up('md')]: css`
      display: block;
    `,
  })}
`;

const FeatureTitle = styled('h3')`
  font-size: 24px;
  white-space: nowrap;
  font-weight: normal;
  margin-bottom: 0;
  color: #D2D2D2;
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
    description: 'Once you have your credits, use them to build any project you want on TiDB Cloud Serverless. TiDB Cloud Serverless provides a full set of on-boarding supports and a few sets of sample data to help you get started.',
    color1: '#C1F6E2',
    color2: '#73D9B4',
  },
];
