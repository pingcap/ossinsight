import AlertBlock from '@site/src/pages/explore/_components/AlertBlock';
import React, { useMemo } from 'react';
import { format } from 'sql-formatter';
import Anchor from '@site/src/components/Anchor';
import useQuestionManagement from '@site/src/pages/explore/_components/useQuestion';
import { isNullish } from '@site/src/utils/value';
import { makeIssueTemplate } from '@site/src/pages/explore/_components/issueTemplates';
import { QuestionErrorType } from '@site/src/api/explorer';

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
      Oops! Your query yielded no results. Try our <Anchor anchor="faq-optimize-sql">tips</Anchor> for crafting effective queries and give it another go.
    </AlertBlock>
  );
}
