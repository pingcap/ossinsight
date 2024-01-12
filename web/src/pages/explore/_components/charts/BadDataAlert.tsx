import React, { ReactNode, useMemo } from 'react';
import AlertBlock from '@site/src/pages/explore/_components/AlertBlock';
import useQuestionManagement from '@site/src/pages/explore/_components/useQuestion';
import { makeIssueTemplate } from '@site/src/pages/explore/_components/issueTemplates';
import { QuestionErrorType } from '@site/src/api/explorer';
import { isNullish } from '@site/src/utils/value';

export default function BadDataAlert ({ title }: { title: ReactNode }) {
  const { question } = useQuestionManagement();

  const createIssueUrl = useMemo(() => {
    if (isNullish(question)) {
      return () => '';
    }
    return makeIssueTemplate(question, QuestionErrorType.VALIDATE_CHART);
  }, [question]);

  return (
    <AlertBlock
      severity="warning"
      sx={{ mb: 2 }}
      createIssueUrl={createIssueUrl}
    >
      {title}
    </AlertBlock>
  );
}
