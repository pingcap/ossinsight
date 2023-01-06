import React, { useContext } from 'react';
import ExploreContext from '@site/src/pages/explore/_components/context';
import { Alert, Button, useEventCallback } from '@mui/material';

export default function BadDataAlert ({ title = 'AI has generated invalid chart info' }: { title?: string }) {
  const { questionId } = useContext(ExploreContext);

  const report = useEventCallback(() => {
    const q = `is:open label:area/data-explorer ${title} in question ${questionId ?? ''}`;
    window.open(`https://github.com/pingcap/ossinsight/issues?q=${encodeURIComponent(q)}`, '_blank');
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
