import React, { useContext, useMemo } from 'react';
import ExploreContext from '@site/src/pages/explore/_components/context';
import { createIssueLink as createIssueLinkInternal } from '@site/src/utils/gh';
import AlertBlock from '@site/src/pages/explore/_components/AlertBlock';

export default function BadDataAlert ({ title = 'AI has generated invalid chart info' }: { title?: string }) {
  const { questionId, question } = useContext(ExploreContext);

  const createIssueLink = useMemo(() => {
    return () => createIssueLinkInternal('pingcap/ossinsight', {
      title: `${title} in question ${questionId ?? ''}`,
      labels: 'area/data-explorer,type/bug',
      assignee: 'Mini256',
      body: `
Hi, ${title} in [question](https://ossinsight/explore/?id=${questionId ?? ''})
      
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
  }, [questionId, question]);

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
