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
      <Q>Why is the output show &quot;No Results Found&quot;?</Q>
      <A>
        Unfortunately, we do not have any useful GitHub insights for you. Usually, there are three situations that cause the answer not to be found:
        <ol>
          <li>AI cannot recognize your text and cannot generate SQLs</li>
          <li>AI misunderstand your text and generate wrong/bad SQLs</li>
          <li>Data restrictions. We currently use repositories that have had active events in the past year as our demo source(approximately 1.2 billion rows of data). So if you want to ask a question about &quot;dormant&quot; repositories and developers, we will not be able to pass on more useful information.</li>
        </ol>
        <br />
        The potential solution for 1,2 is describe your question with short, specific and normal words, then try again.</A>
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
