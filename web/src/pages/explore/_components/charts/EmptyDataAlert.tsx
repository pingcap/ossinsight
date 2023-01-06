import AlertBlock from '@site/src/pages/explore/_components/AlertBlock';
import React, { useContext, useMemo } from 'react';
import ExploreContext from '@site/src/pages/explore/_components/context';
import { createIssueLink as createIssueLinkInternal } from '@site/src/utils/gh';
import { format } from 'sql-formatter';

export function safeFormat (sql: string | undefined = '') {
  try {
    return format(sql, { language: 'mysql' });
  } catch {
    return sql;
  }
}

export default function EmptyDataAlert () {
  const { questionId, question } = useContext(ExploreContext);

  const createIssueLink = useMemo(() => {
    return () => createIssueLinkInternal('pingcap/ossinsight', {
      title: `Empty result from question ${questionId ?? ''}`,
      labels: 'area/data-explorer',
      body: `
Hi, The result of [question](https://ossinsight/explore/?id=${questionId ?? ''}) is empty
The title is: **${question?.title ?? ''}**

Generated SQL is:
\`\`\`mysql
${safeFormat(question?.querySQL)}
\`\`\` 
      `,
    });
  }, [question, questionId],
  );

  return (
    <AlertBlock severity="info" createIssueUrl={createIssueLink} showSuggestions>
      This question has no results.
    </AlertBlock>
  );
}
