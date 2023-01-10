import React, { ReactNode } from 'react';
import { Box, styled, Typography } from '@mui/material';
import ExploreSteps from '@site/src/pages/explore/_components/ExploreSteps';
import { GitHub, Twitter } from '@mui/icons-material';

export default function Faq () {
  return (
    <Box component="section" id="data-explorer-faq" pt={8}>
      <Typography variant="h2" textAlign="center">FAQ</Typography>
      {qa.map(({ q, a }, i) => (
        <QAItem key={i}>
          <Q>{q}</Q>
          <A>{a}</A>
        </QAItem>
      ))}
      <Typography variant="body1" textAlign="center" color="#929292" fontSize={16} mt={8}>
        Still have problems? please feel free to contact us {githubLink} {twitterLink}
      </Typography>
    </Box>
  );
}

type QA = {
  q: ReactNode;
  a: ReactNode;
};

const steps = [
  'Input your question',
  'Translate your question to SQL with OpenAI',
  'Visualize and output your results',
];

const qa: QA[] = [
  {
    q: 'How it works?',
    a: <ExploreSteps steps={steps} />,
  },
  {
    q: 'How do I use this tool?',
    a: 'You can start with selecting a popular query from the query wall or directly input a short text query statement to the search box. OpenAI will translate your question into Structured Query Language (SQL), and we will use the generated SQL to query in the database and return the results.',
  },
  {
    q: 'Why the answer do not turn out to my intended?',
    a: 'We use the text completion provided by OpenAI to translate the text into Structured Query Language (SQL), and the final output depends on the accuracy of the generated SQL. If the final query result does not meet your expectation, please shorten your input statement and using more concise and clear short words for AI recognition.',
  }, {
    q: 'Why is the output report an error or show 0 results?',
    a: (
      <>
        Unfortunately, we do not have useful GitHub insights for you. Usually, there are two situations that cause the answer not to be found:
        <ol>
          <li>AI unrecognized/misunderstand your text and generated wrong/bad SQLs, the query mission failed.</li>
          <li>Data restrictions. All the data we use here on this website sources from&nbsp;
            <a href="http://www.gharchive.org/" target="_blank" rel="noreferrer">
              GH Archive
            </a>, a non-profit project that records and archives all GitHub events data since 2011. We can not offer you more insights if you are looking for answers about other topics.
          </li>
        </ol>
        <br />
        The potential solution is phrase your question which is related GitHub with short, specific words , then try again. And we strongly recommend you use our query templates near the search box to start your exploring.
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
