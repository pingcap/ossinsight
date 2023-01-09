import AlertBlock from '@site/src/pages/explore/_components/AlertBlock';
import React, { useMemo } from 'react';
import { createIssueLink as createIssueLinkInternal } from '@site/src/utils/gh';
import { format } from 'sql-formatter';
import useQuestionManagement from '@site/src/pages/explore/_components/useQuestion';

export function safeFormat (sql: string | undefined = '') {
  try {
    return format(sql, { language: 'mysql' });
  } catch {
    return sql;
  }
}

export default function EmptyDataAlert () {
  const { question } = useQuestionManagement();

  const createIssueLink = useMemo(() => {
    return () => createIssueLinkInternal('pingcap/ossinsight', {
      title: `Empty result from question ${question?.id ?? ''}`,
      labels: 'area/data-explorer',
      body: `
Hi, The result of [question](https://ossinsight.io/explore/?id=${question?.id ?? ''}) is empty
The title is: **${question?.title ?? ''}**

Generated SQL is:
\`\`\`mysql
${safeFormat(question?.querySQL)}
\`\`\` 
      `,
    });
  }, [question],
  );

  return (
    <AlertBlock severity="info" createIssueUrl={createIssueLink} showSuggestions>
      This question has no results.
    </AlertBlock>
  );
}
