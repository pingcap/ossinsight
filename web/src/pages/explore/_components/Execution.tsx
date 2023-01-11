import React from 'react';
import useQuestionManagement, { QuestionLoadingPhase } from '@site/src/pages/explore/_components/useQuestion';
import PoweredBy from '@site/src/pages/explore/_components/PoweredBy';
import SqlSection from '@site/src/pages/explore/_components/SqlSection';
import ResultSection from '@site/src/pages/explore/_components/ResultSection';

export default function Execution ({ search }: { search: string }) {
  const { phase } = useQuestionManagement();

  return (
    <>
      <SqlSection />
      <ResultSection />
      {phase === QuestionLoadingPhase.READY && <PoweredBy sx={{ mt: 2 }} />}
    </>
  );
};
