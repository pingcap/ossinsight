import React, { useMemo } from 'react';
import SqlSection from '@site/src/pages/explore/_components/SqlSection';
import ResultSection from '@site/src/pages/explore/_components/ResultSection';
import useQuestionManagement, { QuestionLoadingPhase } from '@site/src/pages/explore/_components/useQuestion';
import { SwitchTransition } from 'react-transition-group';
import { useBoolean, useMemoizedFn } from 'ahooks';
import { Grow } from '@mui/material';

export interface ExecutionProps {
  onResultEntered?: (id?: string) => void;
  onResultExited?: (id?: string) => void;
  onResultExit?: (id?: string) => void;
  onResultEnter?: (id?: string) => void;
}

export default function Execution ({
  onResultEnter,
  onResultExit,
  onResultEntered,
  onResultExited,
}: ExecutionProps) {
  const { question, phase, error } = useQuestionManagement();
  const [promptsPending, { setTrue: handlePromptsStart, setFalse: handlePromptsReady }] = useBoolean(false);

  const resultQuestion = useMemo(() => {
    const shouldShowResult = RESULT_VISIBLE_PHASES.has(phase);
    if (!promptsPending && shouldShowResult) {
      return question;
    } else {
      return undefined;
    }
  }, [promptsPending, phase, question]);

  const handleEnter = useMemoizedFn(() => {
    onResultEnter?.(resultQuestion?.id);
  });

  const handleEntered = useMemoizedFn(() => {
    onResultEntered?.(resultQuestion?.id);
  });

  const handleExit = useMemoizedFn(() => {
    onResultExit?.(resultQuestion?.id);
  });

  const handleExited = useMemoizedFn(() => {
    onResultExited?.(resultQuestion?.id);
  });

  return (
    <>
      <SqlSection
        question={question}
        phase={phase}
        error={error}
        onPromptsStart={handlePromptsStart}
        onPromptsReady={handlePromptsReady}
      />
      <SwitchTransition
        mode="out-in"
      >
        <Grow
          key={`result-${resultQuestion?.id ?? ''}`}
          onEnter={handleEnter}
          onEntered={handleEntered}
          onExit={handleExit}
          onExited={handleExited}
        >
          <ResultSection
            style={{ transformOrigin: 'top center' }}
            question={resultQuestion}
            phase={phase}
            error={error}
          />
        </Grow>
      </SwitchTransition>
    </>
  );
};

const RESULT_VISIBLE_PHASES = new Set<QuestionLoadingPhase>([
  QuestionLoadingPhase.CREATED,
  QuestionLoadingPhase.QUEUEING,
  QuestionLoadingPhase.EXECUTING,
  QuestionLoadingPhase.EXECUTE_FAILED,
  QuestionLoadingPhase.VISUALIZE_FAILED,
  QuestionLoadingPhase.UNKNOWN_ERROR,
  QuestionLoadingPhase.READY,
  QuestionLoadingPhase.SUMMARIZING,
]);
