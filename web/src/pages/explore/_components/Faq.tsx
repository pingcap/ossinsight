import React, { ReactNode } from 'react';
import { Container, styled, Typography } from '@mui/material';
import ExploreSteps from '@site/src/pages/explore/_components/ExploreSteps';
import { GitHub, Twitter } from '@mui/icons-material';
import Link from '@docusaurus/Link';

export default function Faq () {
  return (
    <Container component="section" maxWidth="md" id="data-explorer-faq" sx={{ py: 8 }}>
      <Typography variant="h2" textAlign="center">FAQ</Typography>
      {qa.map(({ q, a, id }, i) => (
        <QAItem key={i} id={id}>
          <Q>{q}</Q>
          <A>{a}</A>
        </QAItem>
      ))}
      <Typography variant="body1" textAlign="center" color="#929292" fontSize={16} mt={8}>
        Still having trouble? Contact us, we&apos;re happy to help! {githubLink} {twitterLink}
      </Typography>
    </Container>
  );
}

type QA = {
  id?: string;
  q: ReactNode;
  a: ReactNode;
};

const steps = [
  'Input your question',
  'Translate the question into SQL',
  'Visualize and output results',
];

const qa: QA[] = [
  {
    q: 'How it works',
    a: <ExploreSteps steps={steps} />,
  },
  {
    q: 'What are the limitations of Data Explorer?',
    a: (
      <>
        <ol>
          <li>AI is still a work in progress with limitations
            <br />
            Its limitations include:
            <ul>
              <li>A lack of context and knowledge of the specific database structure</li>
              <li>A lack of domain knowledgestructure</li>
              <li>Inability to produce the most efficient SQL statement for large and complex queries</li>
              <li>Sometimes service instability</li>
            </ul>
            <br />
            To help AI understand your query intention, please use clear, specific phrases in your question. Check out our question optimization tips.
            We&apos;re constantly working on improving and optimizing it, so any feedback you have is greatly appreciated. Thanks for using!
          </li>
          <br />
          <li>The dataset itself is a limitation for our tool</li>
          All the data we use on this website is sourced from GH Archive, a non-profit project that records and archives all GitHub event data since 2011 (public data only). If a question falls outside of the scope of the available data, it may be difficult for our tool to provide a satisfactory answer.
        </ol>
      </>
    ),
  },
  {
    id: 'faq-failed-to-generate-sql',
    q: 'Why did it fail to generate an SQL query?',
    a: (
      <>
        Potential reasons:
        <ul>
          <li>The AI was unable to understand or misunderstood your question, resulting in an inability to generate SQL. To know more about AI&apos;s limitations, you can check out the previous question.</li>
          <li>Network issues.</li>
          <li>You had excessive requests. Note that you can ask <b>up to 15 questions per hour</b>.</li>
        </ul>
        <br />
        The potential solution is phrase your question which is related GitHub with short, specific words, then try again. And we strongly recommend you use our query templates near the search box to start your exploring.
      </>
    ),
  }, {
    id: 'faq-optimize-sql',
    q: 'The query result is not satisfactory. How can I optimize my question?',
    a: (
      <>
        We use AI to translate your question to SQL. But it&apos;s still a work in progress with limitations.
        <br />
        To help AI understand your query intention and get a desirable query result, you can rephrase your question using clear, specific phrases related to GitHub. We recommend:
        <ul>
          <li>Using a GitHub login account instead of a nickname. For example, change &quot;Linus&quot; to &quot;torvalds.&quot; </li>
          <li>Using a GitHub repository&apos;s full name. For example, change &quot;react&quot; to &quot;facebook/react.&quot;
          </li>
          <li>Using GitHub terms. For example, to find Python projects with the most forks in 2022, change your query &quot;The most popular Python projects 2022&quot; to &quot;Python projects with the most forks in 2022.&quot;</li>
        </ul>
        <br />
        You can also get inspiration from the suggested queries near the search box.
      </>
    ),
  }, {
    q: 'Why did it fail to generate a chart?',
    a: (
      <>
        Potential reasons:
        <ul>
          <li>The SQL query was incorrect or could not be generated, so the answer could not be found in the database, and the chart could not be generated.</li>
          <li>The answer was found, but the AI did not choose the correct chart template, so the chart could not be generated.</li>
          <li>The SQL query was correct, but no answer was found, so the chart could not be displayed.</li>
        </ul>
      </>
    ),
  }, {
    q: 'Can I use the AI-powered feature with my own dataset?',
    a: (
      <>
        Yes! Even if you&apos;re not a GitHub expert, you can follow our <Link to="/blog/chat2query-tutorials" target="_blank">tutorial</Link> to play around with any dataset at <b>NO COST</b>. Just keep in mind that we take privacy seriously. Our model only needs access to your database schema, not any actual data about your customers.
      </>
    ),
  }, {
    q: 'What technology is Data Explorer built on?',
    a: (
      <>
        Its major technologies include:
        <ul>
          <li>Data source: GH Archive and GitHub event API
            <br />
            GH Archive collects and archives all GitHub data since 2011 and updates it hourly. <b>By combining the GH Archive data and the GitHub event API, we can gain streaming, real-time data updates.</b>
          </li>
          <li>One database for all workloads: <Link href="https://www.pingcap.com/tidb-cloud/?utm_source=ossinsight&utm_medium=referral&utm_campaign=dataexplore" target="_blank" rel="noopener"> TiDB Cloud</Link>
            <br />
            Facing continuously growing large-volume data (currently 5+ billion GitHub events), we need a database that can:
            <ul>
              <li>Store massive data</li>
              <li>Handle complex analytical queries</li>
              <li>Serve online traffic</li>
            </ul>
            <Link href="https://docs.pingcap.com/tidb/stable/overview/?utm_source=ossinsight&utm_medium=referral&utm_campaign=dataexplore" target="_blank" rel="noopener"> TiDB </Link> is an ideal solution. TiDB Cloud is its fully managed cloud Database as a Service. It lets users launch TiDB in seconds and offers the pay-as-you-go pricing model. Therefore, we choose TiDB Cloud as our backend database.
          </li>
          <li>AI engine: OpenAI</li>
          To enable users without SQL knowledge to query with this tool, <b>we use OpenAI to translate the natural language to SQL.</b>
        </ul>
      </>
    ),
  },
];

const QAItem = styled('div')`
  scroll-margin: 100px;

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
  margin-left: 8px;
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
