import React, { useContext } from 'react';
import ExploreContext from '@site/src/pages/explore/_components/context';
import AlertBlock from '@site/src/pages/explore/_components/AlertBlock';
import { SxProps } from '@mui/system';
import { createIssueLink } from '@site/src/utils/gh';
import { AlertColor } from '@mui/material';
import { safeFormat } from '@site/src/pages/explore/_components/charts/EmptyDataAlert';
import { notNullish } from '@site/src/utils/value';

interface ErrorBlockProps {
  title: string;
  prompt: string;
  error: string;
  severity: AlertColor;
  sx?: SxProps;
  showSuggestions?: boolean;
}

export default function ErrorBlock ({ severity, title, prompt, sx, error, showSuggestions }: ErrorBlockProps) {
  const { questionId, question } = useContext(ExploreContext);

  const createIssueUrl = () => {
    return createIssueLink('pingcap/ossinsight', {
      title: `${title} for question ${questionId ?? ''}`,
      body: `
${prompt} [question](https://ossinsight.io/explore?id=${questionId ?? ''})

## Question title
**${question?.title ?? ''}**

## Error message
${error}
${notNullish(question?.querySQL)
? `
## Generated SQL
\`\`\`mysql
${safeFormat(question?.querySQL)}
\`\`\`
`
: ''}
${notNullish(question?.chart)
? `
## Chart info
\`\`\`json
${JSON.stringify(question?.chart, undefined, 2)}
\`\`\`
`
: ''}
`,
      labels: 'area/data-explorer,type/bug',
    });
  };

  return (
    <AlertBlock severity={severity} sx={sx} createIssueUrl={createIssueUrl} showSuggestions={showSuggestions}>
      {title}: {error}
    </AlertBlock>
  );
}
