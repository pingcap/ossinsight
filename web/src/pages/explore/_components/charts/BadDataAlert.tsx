import React, { useContext } from 'react';
import ExploreContext from '@site/src/pages/explore/_components/context';
import { Alert, Button, useEventCallback } from '@mui/material';
import { createIssueLink } from '@site/src/utils/gh';

export default function BadDataAlert ({ title = 'AI has generated invalid chart info' }: { title?: string }) {
  const { questionId, question } = useContext(ExploreContext);

  const report = useEventCallback(() => {
    const url = createIssueLink('pingcap/ossinsight', {
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
    window.open(url, '_blank');
  });

  return (
    <Alert
      severity="warning"
      sx={{ mb: 2 }}
      action={<Button onClick={report}>Report</Button>}
    >
      {title}
    </Alert>
  );
}
