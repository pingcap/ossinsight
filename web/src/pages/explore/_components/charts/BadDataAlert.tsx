import React, { useMemo } from 'react';
import { createIssueLink as createIssueLinkInternal } from '@site/src/utils/gh';
import AlertBlock from '@site/src/pages/explore/_components/AlertBlock';
import useQuestionManagement from '@site/src/pages/explore/_components/useQuestion';
import { DateTime } from 'luxon';
import { isNullish } from '@site/src/utils/value';

export default function BadDataAlert ({ title }: { title: string }) {
  const { question } = useQuestionManagement();

  const createIssueLink = useMemo(() => {
    return () => createIssueLinkInternal('pingcap/ossinsight', {
      title: `${title} in question ${question?.id ?? ''}`,
      labels: 'area/data-explorer,type/bug',
      assignee: 'Mini256',
      body: `
Hi, ${title} in [question](https://ossinsight.io/explore/?id=${question?.id ?? ''})

## Question title:
**${question?.title?.replaceAll('@', '') ?? ''}**

## Chart info:
\`\`\`json
${JSON.stringify(question?.chart, undefined, 2)}
\`\`\`

## Result info:
\`\`\`json
// Fields
${JSON.stringify(question?.result?.fields, undefined, 2)}

// First result (Totally ${question?.result?.rows.length ?? 0} rows)
${JSON.stringify(question?.result?.rows?.[0], undefined, 2)}
\`\`\`

## Time info:
| createdAt              | executedAt              | finishedAt              | requestedAt              |
|------------------------|-------------------------|-------------------------|--------------------------|
| ${fmtDate(question?.createdAt)} | ${fmtDate(question?.executedAt)} | ${fmtDate(question?.finishedAt)} | ${fmtDate(question?.requestedAt)} |

      `,
    });
  }, [question]);

  return (
    <AlertBlock
      severity="warning"
      sx={{ mb: 2 }}
      createIssueUrl={createIssueLink}
    >
      {title}
    </AlertBlock>
  );
}

function fmtDate (date: string | undefined | null) {
  if (isNullish(date)) {
    return '-';
  }
  return DateTime.fromISO(date).toFormat('yyyy-MM-dd HH:mm:ss');
}
