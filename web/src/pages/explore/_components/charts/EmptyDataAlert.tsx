import AlertBlock from '@site/src/pages/explore/_components/AlertBlock';
import React, { useMemo } from 'react';
import { format } from 'sql-formatter';
import useQuestionManagement from '@site/src/pages/explore/_components/useQuestion';
import { isNullish } from '@site/src/utils/value';
import { makeIssueTemplate } from '@site/src/pages/explore/_components/issueTemplates';
import { QuestionErrorType } from '@site/src/api/explorer';
import { styled, Typography } from '@mui/material';
import Link from '@docusaurus/Link';

export function safeFormat (sql: string | undefined = '') {
  try {
    return format(sql, { language: 'mysql' });
  } catch {
    return sql;
  }
}

export default function EmptyDataAlert () {
  const { question } = useQuestionManagement();

  const createIssueUrl = useMemo(() => {
    if (isNullish(question)) {
      return () => '';
    }
    return makeIssueTemplate(question, QuestionErrorType.EMPTY_RESULT);
  }, [question]);

  return (
    <AlertBlock severity="info" createIssueUrl={createIssueUrl}>
      <Typography variant="body1">
        Query returned no result.
      </Typography>
      <UL>
        <Typography variant='body1' component='li'>
          Click &quot;check it out&quot; above to verify the SQL.
        </Typography>
        <Typography variant='body1' component='li'>
          Or check out the <Link to='/explore/'>popular questions</Link> for inspiration.
        </Typography>
      </UL>
    </AlertBlock>
  );
}

const UL = styled('ul')`
  padding-left: 0;
  list-style-position: inside;
`;
