import React, { useEffect, useMemo, useState } from 'react';
import SqlSection from '@site/src/pages/explore/_components/SqlSection';
import ResultSection from '@site/src/pages/explore/_components/ResultSection';
import useQuestionManagement, { isEmptyResult, QuestionLoadingPhase } from '@site/src/pages/explore/_components/useQuestion';
import { SwitchTransition } from 'react-transition-group';
import { useMemoizedFn } from 'ahooks';
import { Grow } from '@mui/material';
import { notNullish } from '@site/src/utils/value';
import AdsSection from '@site/src/pages/explore/_components/AdsSection';

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
  const [promptsPending, setPromptsPending] = useState(false);
  const [showAds, setShowAds] = useState(false);

  useEffect(() => {
    setShowAds(false);
  }, [question?.id]);

  const resultQuestion = useMemo(() => {
    const shouldShowResult = RESULT_VISIBLE_PHASES.has(phase);
    if (!promptsPending && shouldShowResult) {
      return question;
    } else {
      return undefined;
    }
  }, [promptsPending, phase, question]);

  const shouldShowAds = useMemo(() => {
    if (!showAds) {
      return false;
    }
    if (ADS_VISIBLE_PHASES.has(phase)) {
      return true;
    } else {
      return notNullish(question) && isEmptyResult(question);
    }
  }, [showAds, phase, question]);

  const handleEnter = useMemoizedFn(() => {
    onResultEnter?.(resultQuestion?.id);
  });

  const handleEntered = useMemoizedFn(() => {
    onResultEntered?.(resultQuestion?.id);
    if (notNullish(resultQuestion)) {
      setShowAds(true);
    }
  });

  const handleExit = useMemoizedFn(() => {
    onResultExit?.(resultQuestion?.id);
    if (notNullish(resultQuestion)) {
      setShowAds(false);
    }
  });

  const handleExited = useMemoizedFn(() => {
    onResultExited?.(resultQuestion?.id);
  });

  const handlePromptsStart = useMemoizedFn(() => {
    setPromptsPending(true);
  });

  const handlePromptsReady = useMemoizedFn(() => {
    setPromptsPending(false);
  });

  const handleSqlErrorMessageStart = useMemoizedFn(() => {
    if (phase !== QuestionLoadingPhase.EXECUTE_FAILED) {
      setShowAds(false);
    }
  });

  const handleSqlErrorMessageReady = useMemoizedFn(() => {
    if (phase !== QuestionLoadingPhase.EXECUTE_FAILED) {
      setShowAds(true);
    }
  });

  return (
    <>
      <SqlSection
        question={question}
        phase={phase}
        error={error}
        onPromptsStart={handlePromptsStart}
        onPromptsReady={handlePromptsReady}
        onErrorMessageStart={handleSqlErrorMessageStart}
        onErrorMessageReady={handleSqlErrorMessageReady}
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
      <Grow in={shouldShowAds} unmountOnExit>
        <AdsSection />
      </Grow>
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

const ADS_VISIBLE_PHASES = new Set<QuestionLoadingPhase>([
  QuestionLoadingPhase.VALIDATE_SQL_FAILED,
  QuestionLoadingPhase.GENERATE_SQL_FAILED,
  QuestionLoadingPhase.EXECUTE_FAILED,
  QuestionLoadingPhase.CREATE_FAILED,
]);
