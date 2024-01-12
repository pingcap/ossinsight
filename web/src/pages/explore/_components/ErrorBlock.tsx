import React, { forwardRef, ReactNode, useMemo } from 'react';
import AlertBlock from '@site/src/pages/explore/_components/AlertBlock';
import { SxProps } from '@mui/system';
import { AlertColor } from '@mui/material';
import useQuestionManagement from '@site/src/pages/explore/_components/useQuestion';
import { isNullish } from '@site/src/utils/value';
import { makeIssueTemplate } from '@site/src/pages/explore/_components/issueTemplates';

interface ErrorBlockProps {
  severity: AlertColor;
  sx?: SxProps;
  children?: ReactNode;
}

const ErrorBlock = forwardRef<HTMLDivElement, ErrorBlockProps>(function ({ severity, sx, children }, ref) {
  const { question } = useQuestionManagement();

  const createIssueUrl = useMemo(() => {
    if (isNullish(question)) {
      return () => '';
    }
    return makeIssueTemplate(question);
  }, [question]);

  return (
    <AlertBlock severity={severity} sx={sx} ref={ref} createIssueUrl={createIssueUrl}>
      {children}
    </AlertBlock>
  );
});

export default ErrorBlock;
