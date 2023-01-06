import React from 'react';
import { Box, styled, Typography } from '@mui/material';

export default function Faq () {
  return (
    <Box id='data-explorer-faq' pt={8}>
      <Typography variant='h2' textAlign='center'>FAQ</Typography>
      <Q>How do I use this tool?</Q>
      <A>You can start with selecting a popular query from the query wall or directly input a short text query statement to the search box. OpenAI will translate your question into Structured Query Language (SQL), and we will use the generated SQL to query in the database and return the results.</A>
      <Q>Why the answer do not turn out to my intended?</Q>
      <A>We use the text completion provided by OpenAI to translate the text into Structured Query Language (SQL), and the final output depends on the accuracy of the generated SQL. If the final query result does not meet your expectation, please shorten your input statement and using more concise and clear short words for AI recognition.</A>
      <Q>Why is the output report an error or show 0 results?</Q>
      <A>
        Unfortunately, we do not have useful GitHub insights for you. Usually, there are two situations that cause the answer not to be found:
        <ol>
          <li>AI unrecognized/misunderstand your text and generated wrong/bad SQLs, the query mission failed.</li>
          <li>Data restrictions. All the data we use here on this website sources from&nbsp;
            <a href='https://github.com/kubernetes/kubernetes/labels?q=size' target='_blank' rel="noreferrer">
            GH Archive
          </a>, a non-profit project that records and archives all GitHub events data since 2011. We can not offer you more insights if you are looking for answers about other topics.</li>
        </ol>
        <br />
        The potential solution is phrase your question which is related GitHub with short, specific words , then try again. And we strongly recommend you use our query templates near the search box to start your exploring.</A>
    </Box>
  );
}

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
  color: #929292;
  margin-bottom: 48px;
`;
