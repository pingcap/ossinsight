import React, { useMemo } from 'react';
import { createIssueLink as createIssueLinkInternal } from '@site/src/utils/gh';
import AlertBlock from '@site/src/pages/explore/_components/AlertBlock';
import useQuestionManagement from '@site/src/pages/explore/_components/useQuestion';

export default function BadDataAlert ({ title }: { title: string }) {
  const { question } = useQuestionManagement();

  const createIssueLink = useMemo(() => {
    return () => createIssueLinkInternal('pingcap/ossinsight', {
      title: `${title} in question ${question?.id ?? ''}`,
      labels: 'area/data-explorer,type/bug',
      assignee: 'Mini256',
      body: `
Hi, ${title} in [question](https://ossinsight.io/explore/?id=${question?.id ?? ''})
      
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
