import React, { ReactNode } from 'react';
import { Box, styled, Typography } from '@mui/material';
import ExploreSteps from '@site/src/pages/explore/_components/ExploreSteps';
import { GitHub, Twitter } from '@mui/icons-material';

export default function Faq () {
  return (
    <Box component="section" id="data-explorer-faq" pt={8} px={12}>
      <Typography variant="h2" textAlign="center">FAQ</Typography>
      {qa.map(({ q, a }, i) => (
        <QAItem key={i}>
          <Q>{q}</Q>
          <A>{a}</A>
        </QAItem>
      ))}
      <Typography variant="body1" textAlign='center' color='#929292' fontSize={16} mt={8}>
        Still have problems? please feel free to contact us {githubLink} &nbsp;{twitterLink}
      </Typography>
    </Box>
  );
}

type QA = {
  q: ReactNode;
  a: ReactNode;
};

const steps = [
  'Enter your question',
  'Translate the question into SQL',
  'Visualize and output results',
];

const qa: QA[] = [
  {
    q: 'How it works?',
    a: <ExploreSteps steps={steps} />,
  },
  {
    q: 'What is Data Explorer?',
    a: (
      <>
        Data Explorer is a tool powered by large language models (OpenAI API) and&nbsp;
        <a href='https://www.pingcap.com/tidb-cloud/' target='_blank' rel="noreferrer">TiDB Cloud</a>, a cloud-native, distributed, hybrid transactional/analytical processing database. You can use it to explore and get insights from 5+ billion rows of GitHub data.
           </>
    ),
  }, {
    q: 'What are the limitations of Data Explorer?',
    a: (
      <>
        AI&apos;s ability to generate SQL from natural language is pretty amazing!
        <br />
        However, please keep in mind that it is still a work in progress and may have limitations, including:
        <ol>
          <li>AI understanding</li>
          <li>AI-generated SQL syntax</li>
          <li>AI service stability</li>
        </ol>
        We&apos;re constantly working on improving and optimizing it, so any feedback you have is greatly appreciated. Thanks for using!
        <br />
        Also, the dataset itself can also be a limitation for our tool. All the data we use on this website is sourced from&nbsp;
            <a href="http://www.gharchive.org/" target="_blank" rel="noreferrer">
              GH Archive
            </a>, a non-profit project that records and archives all GitHub event data since 2011 (public data only). If a question falls outside of the scope of the available data, it may be difficult for our tool to provide a satisfactory answer.
      </>
    ),
  }, {
    q: 'Why did it fail to generate an SQL query?',
    a: (
      <>
        Potential reasons:
        <ol>
          <li>The AI was unable to understand or misunderstood your question, resulting in an inability to generate SQL. We already mentioned AI&apos;s limitations in the previous question.</li>
          <li>You had network issues.</li>
          <li>You had excessive requests. Note that you can ask up to 15 questions per hour.</li>
        </ol>
      </>
    ),
  }, {
    q: 'Why did it fail to generate a chart?',
    a: (
      <>
        Potential reasons:
        <ol>
          <li>You had network issues.The SQL query was incorrect or could not be generated, so the answer could not be found in the database, and the chart could not be generated.</li>
          <li>The answer was found, but the AI did not choose the correct chart template, so the chart could not be generated.</li>
          <li>The SQL query was correct, but no answer was found, so the chart could not be displayed.</li>
        </ol>
      </>
    ),
  }, {
    q: 'Can I use the data exploration feature with my own dataset?',
    a: (
      <>
        Yes! Even if you are not a GitHub expert, you can still play around with your own data at <b>NO COST</b>. Just keep in mind that we take privacy seriously. Our model only needs access to your database schema, not any actual data about your customers.
        </>
    ),
  },
];

const QAItem = styled('div')`
  &:not(:first-of-type) {
    margin-top: 48px;
  }
`;

const Q = styled('h3')`
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  text-align: left;
`;

const A = styled('div')`
  font-size: 14px;
  font-weight: 400;
  line-height: 21px;
  text-align: left;
  color: #C1C1C1;
  margin: 0;
`;

const IconLink = styled('a')`
  display: inline-flex;
  vertical-align: text-bottom;
  width: 24px;
  height: 24px;
  text-decoration: none !important;
  align-items: center;
  justify-content: center;
  transition: ${({ theme }) => theme.transitions.create(['color', 'background-color'])};
`;

const GithubLink = styled(IconLink)`
  color: #eaeaea !important;

  &:hover {
    color: white;
  }
`;

const TwitterLink = styled(IconLink)`
  font-size: 18px;
  color: #1D9BF0 !important;
  border-radius: 50%;
  background-color: #eaeaea;

  &:hover {
    background-color: white;
  }
`;

const githubLink = <GithubLink href="https://github.com/pingcap/ossinsight/issues" target="_blank"><GitHub /></GithubLink>;
const twitterLink = <TwitterLink href="https://twitter.com/OSSInsight" target="_blank"><Twitter fontSize="inherit" /></TwitterLink>;
