import useQuestionManagement from '@site/src/pages/explore/_components/useQuestion';
import React from 'react';
import { QuestionErrorType } from '@site/src/api/explorer';
import { Button, Collapse, Divider, Typography } from '@mui/material';
import { useBoolean } from 'ahooks';
import { isAxiosError } from '@site/src/utils/error';
import { extractTime } from '@site/src/pages/explore/_components/SqlSection/utils';
import TiDBCloudLink from '@site/src/components/TiDBCloudLink';
import Anchor from '@site/src/components/Anchor';
import Link from '@docusaurus/Link';
import { getErrorDetails } from '@site/src/pages/explore/_components/errorOverride';
import { notNullish } from '@site/src/utils/value';

export default function ErrorMessage ({ error }: { error: unknown }) {
  const { question } = useQuestionManagement();
  const [open, { toggle }] = useBoolean(false);

  if (question?.status !== 'error') {
    return <></>;
  }

  switch (question.errorType) {
    case QuestionErrorType.ANSWER_GENERATE:
      if ((question.error?.indexOf('code 500') ?? -1) >= 0) {
        return <Typography variant="body1">OpenAI failed to respond. Please try again later.</Typography>;
      } else {
        return <Typography variant="body1">Failed to generate SQL due to network error. Please try again later.</Typography>;
      }
    case QuestionErrorType.ANSWER_PARSE:
      return <Typography variant="body1">Failed to generate SQL. Optimize your question for effective SQL, or get ideas from <Link to='/explore/'>popular questions</Link>.</Typography>;
    case QuestionErrorType.SQL_CAN_NOT_ANSWER:
      return <Typography variant="body1">Sorry, I can&apos;t generate SQL as your question is not GitHub-related or beyond our data source.</Typography>;
    case QuestionErrorType.QUESTION_IS_TOO_LONG:
      return <Typography variant="body1">Sorry, your question is too long. Please simplify it to a few sentences.</Typography>;
    case QuestionErrorType.VALIDATE_SQL: {
      const errorDetails = getErrorDetails(QuestionErrorType.VALIDATE_SQL, question.error);
      if (notNullish(errorDetails)) {
        return (
          <>
            <Typography variant="body1">
              {errorDetails}
              <br />
              Optimize your question for effective SQL, or get ideas from <Link to="/explore/">popular questions</Link>.
            </Typography>
          </>
        );
      }
      return (
        <>
          <Typography variant="body1">
            {'SQL syntax error or invalid field. '}
            <Button variant="text" size="small" onClick={toggle}>DETAIL</Button>
            <br />
            <Collapse in={open}>
              <Divider orientation="horizontal" sx={{ my: 2 }} />
              <Typography variant="body2">
                {question.error ?? 'Empty message'}
              </Typography>
              <Divider orientation="horizontal" sx={{ my: 2 }} />
            </Collapse>
            Optimize your question for effective SQL, or get ideas from <Link to="/explore/">popular questions</Link>.
          </Typography>
        </>
      );
    }
  }

  // Legacy error
  return isAxiosError(error) && error.response?.status === 429
    ? (
      <>
        Wow, you&apos;re a natural explorer! But it&apos;s a little tough to keep up!
        <br />
        Take a break and try again in {extractTime(error)}.
        <br />
        Check out <TiDBCloudLink>Chat2Query</TiDBCloudLink> if you want to try AI-generated SQL in any other dataset <b>within 5 minutes</b>.
      </>
      )
    : (
      <>
        Whoops! No SQL query is generated.
        Check out <Anchor anchor="faq-failed-to-generate-sql">potential reasons</Anchor> and try again later.
      </>
      );
}
