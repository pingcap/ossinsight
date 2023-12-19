import useQuestionManagement from '@site/src/pages/explore/_components/useQuestion';
import React from 'react';
import { QuestionErrorType } from '@site/src/api/explorer';
import { Typography } from '@mui/material';
import Link from '@docusaurus/Link';

export default function ErrorMessage () {
  const { question } = useQuestionManagement();

  if (question?.status !== 'error' && question?.status !== 'cancel') {
    return <></>;
  }

  switch (question.errorType) {
    case QuestionErrorType.QUERY_TIMEOUT:
      return (
        <Typography variant="body1">
          Whoops! Query timed out. SQL may be too complex or incorrect.
          <br />
          Optimize your question for effective SQL, or get ideas from <Link to='/explore/'>popular questions</Link>.
        </Typography>
      );
    default:
      // case QuestionErrorType.QUERY_EXECUTE:
      // case QuestionErrorType.UNKNOWN:
      // // And includes legacy error messages
      return (
        <Typography variant="body1">
          Oops, something wrong with the SQL query. SQL may be too complex or incorrect.
          <br />
          Optimize your question for effective SQL, or get ideas from <Link to='/explore/'>popular questions</Link>.
        </Typography>
      );
  }
}
