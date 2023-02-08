import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { newQuestion, pollQuestion, Question, QuestionErrorType, QuestionStatus } from '@site/src/api/explorer';
import { useMemoizedFn } from 'ahooks';
import { isFalsy, isFiniteNumber, isNonemptyString, notNullish } from '@site/src/utils/value';
import { timeout } from '@site/src/utils/promisify';
import { useResponsiveAuth0 } from '@site/src/theme/NavbarItem/useResponsiveAuth0';
import { useGtag } from '@site/src/utils/ga';
import { getErrorMessage } from '@site/src/utils/error';
import { notNone } from '@site/src/pages/explore/_components/SqlSection/utils';
import { useIfMounted } from '@site/src/hooks/mounted';

export const enum QuestionLoadingPhase {
  /** There is no question */
  NONE,
  /** The question is loading by providing id */
  LOADING,
  /** The question is failed to load */
  LOAD_FAILED,
  /** New question is creating by providing title */
  CREATING,
  /** Recently created, generating SQL */
  CREATED,
  GENERATING_SQL,
  /** Creation failed, question would not be exists */
  CREATE_FAILED,
  /** Generate SQL failed, question exists */
  GENERATE_SQL_FAILED,
  VALIDATE_SQL_FAILED,
  /** SQL is waiting for execution */
  QUEUEING,
  /** SQL is executing */
  EXECUTING,
  /** SQL execution was failed */
  EXECUTE_FAILED,
  /** Visualize failed (only if `question.chart` in nullish) */
  VISUALIZE_FAILED,
  UNKNOWN_ERROR,
  /** Question is ready to render */
  SUMMARIZING,
  READY,
  /** Question is ready to render but has no result */
}

export const GENERATE_SQL_NON_FINAL_PHASES = new Set([
  QuestionLoadingPhase.NONE,
  QuestionLoadingPhase.LOADING,
  QuestionLoadingPhase.CREATING,
  QuestionLoadingPhase.CREATED,
  QuestionLoadingPhase.GENERATING_SQL,
]);

export const FINAL_PHASES = new Set([
  QuestionLoadingPhase.NONE,
  QuestionLoadingPhase.READY,
  QuestionLoadingPhase.SUMMARIZING,
  QuestionLoadingPhase.UNKNOWN_ERROR,
  QuestionLoadingPhase.GENERATE_SQL_FAILED,
  QuestionLoadingPhase.VALIDATE_SQL_FAILED,
  QuestionLoadingPhase.VISUALIZE_FAILED,
  QuestionLoadingPhase.CREATE_FAILED,
  QuestionLoadingPhase.LOAD_FAILED,
  QuestionLoadingPhase.EXECUTE_FAILED,
]);

function computePhase (question: Question, whenError: (error: unknown) => void): QuestionLoadingPhase {
  switch (question.status) {
    case QuestionStatus.New:
      return QuestionLoadingPhase.CREATED;
    case QuestionStatus.AnswerGenerating:
    case QuestionStatus.SQLValidating:
      return QuestionLoadingPhase.GENERATING_SQL;
    case QuestionStatus.Waiting:
      return QuestionLoadingPhase.QUEUEING;
    case QuestionStatus.Running:
      return QuestionLoadingPhase.EXECUTING;
    case QuestionStatus.Summarizing:
      return QuestionLoadingPhase.SUMMARIZING;
    case QuestionStatus.Success:
      if (notNullish(question.chart)) {
        return QuestionLoadingPhase.READY;
      } else if (question.sqlCanAnswer === false) {
        return QuestionLoadingPhase.GENERATE_SQL_FAILED;
      } else {
        return QuestionLoadingPhase.VISUALIZE_FAILED;
      }
    case QuestionStatus.Error:
      if (notNullish(question.error)) {
        whenError(question.error);
      } else {
        whenError('Empty error message');
      }
      switch (question.errorType) {
        case QuestionErrorType.ANSWER_GENERATE:
        case QuestionErrorType.ANSWER_PARSE:
        case QuestionErrorType.SQL_CAN_NOT_ANSWER:
          return QuestionLoadingPhase.GENERATE_SQL_FAILED;
        case QuestionErrorType.VALIDATE_SQL:
          return QuestionLoadingPhase.VALIDATE_SQL_FAILED;
        case QuestionErrorType.QUERY_TIMEOUT:
        case QuestionErrorType.QUERY_EXECUTE:
          return QuestionLoadingPhase.EXECUTE_FAILED;
      }
      if (isFalsy(question.querySQL)) {
        return QuestionLoadingPhase.GENERATE_SQL_FAILED;
      } else if (isFalsy(question.result)) {
        return QuestionLoadingPhase.EXECUTE_FAILED;
      } else if (isFalsy(question.chart)) {
        return QuestionLoadingPhase.VISUALIZE_FAILED;
      } else {
        return QuestionLoadingPhase.UNKNOWN_ERROR;
      }
    case QuestionStatus.Cancel:
      if (notNullish(question.error)) {
        whenError(question.error);
      } else {
        whenError('Execution was cancelled');
      }
      return QuestionLoadingPhase.EXECUTE_FAILED;
    default:
      // Guess phase
      if (notNullish(question.querySQL)) {
        if (notNullish(question.result)) {
          return QuestionLoadingPhase.READY;
        } else if (notNullish(question.error)) {
          whenError(question.error);
          return QuestionLoadingPhase.EXECUTE_FAILED;
        } else {
          return QuestionLoadingPhase.EXECUTING;
        }
      } else {
        if (notNullish(question.error)) {
          whenError(question.error);
          return QuestionLoadingPhase.GENERATE_SQL_FAILED;
        } else {
          return QuestionLoadingPhase.GENERATING_SQL;
        }
      }
  }
}

interface QuestionManagementOptions {
  pollInterval?: number;
}

export interface QuestionManagement {
  /** The phase of question, `question.status` could be ignored */
  phase: QuestionLoadingPhase;
  question: Question | undefined;
  loading: boolean;
  error: unknown;

  isSqlPending: boolean;
  isResultPending: boolean;

  load: (id: string) => void;

  create: (title: string, ignoreCache: boolean) => void;

  reset: () => void;
}

export function useQuestionManagementValues ({ pollInterval = 2000 }: QuestionManagementOptions): QuestionManagement {
  const [phase, setPhase] = useState<QuestionLoadingPhase>(QuestionLoadingPhase.NONE);
  const [question, setQuestion] = useState<Question>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>();
  const waitTimeRef = useRef<number>(0);
  const idRef = useRef<string>();
  const ifMounted = useIfMounted();

  const { gtagEvent } = useGtag();

  const { isLoading, user, getAccessTokenSilently, login } = useResponsiveAuth0();

  // TODO: support cancel
  const loadInternal = useMemoizedFn(async function (id: string, clear: boolean) {
    // Prevent reload when loading same question
    if (idRef.current === id) {
      if (clear || loading) {
        return;
      }
    }
    idRef.current = id;

    try {
      if (clear) {
        waitTimeRef.current = performance.now();
        setError(undefined);
        setQuestion(undefined);
        setPhase(QuestionLoadingPhase.LOADING);
      }
      setLoading(true);
      const result = await pollQuestion(id);
      idRef.current = result.id;
      ifMounted(() => {
        setPhase(computePhase(result, setError));
        setQuestion(result);
      });
    } catch (e) {
      ifMounted(() => {
        setPhase(QuestionLoadingPhase.LOAD_FAILED);
        setError(e);
      });
      return await Promise.reject(e);
    } finally {
      ifMounted(() => {
        setLoading(false);
      });
    }
  });

  const load = useMemoizedFn((id: string) => {
    void loadInternal(id, true);
  });

  const create = useMemoizedFn((title: string, ignoreCache: boolean) => {
    async function createInternal (title: string, ignoreCache: boolean) {
      try {
        if (!isLoading && !user) {
          // TODO: Auto search after login
          return await login({ triggerBy: 'explorer-search' });
        }
        waitTimeRef.current = performance.now();
        setError(undefined);
        setQuestion(undefined);
        setLoading(true);
        setPhase(QuestionLoadingPhase.CREATING);
        const accessToken = await getAccessTokenSilently();
        const result = await newQuestion({ question: title, ignoreCache }, { accessToken });
        await timeout(600);
        idRef.current = result.id;
        gtagEvent('create_question', {
          questionId: result.id,
          questionTitle: result.title,
          questionHitCache: result.hitCache,
          spent: (performance.now() - waitTimeRef.current) / 1000,
        });
        ifMounted(() => {
          setPhase(computePhase(result, setError));
          setQuestion(result);
        });
      } catch (e) {
        gtagEvent('create_question_failed', {
          errorMessage: getErrorMessage(e),
          spent: (performance.now() - waitTimeRef.current) / 1000,
        });
        ifMounted(() => {
          setPhase(QuestionLoadingPhase.CREATE_FAILED);
          setError(e);
        });
        return await Promise.reject(e);
      } finally {
        ifMounted(() => {
          setLoading(false);
        });
      }
    }

    void createInternal(title, ignoreCache);
  });

  const reset = useMemoizedFn(() => {
    setPhase(QuestionLoadingPhase.NONE);
    setQuestion(undefined);
    setLoading(false);
    setError(undefined);
    idRef.current = undefined;
  });

  const isSqlPending = useMemo(() => {
    return GENERATE_SQL_NON_FINAL_PHASES.has(phase);
  }, [phase]);

  const isResultPending = useMemo(() => {
    return !FINAL_PHASES.has(phase);
  }, [phase]);

  useEffect(() => {
    if (isFiniteNumber(pollInterval) && pollInterval < 1000) {
      pollInterval = 1000;
    }
    // Poll question if question was not finished
    switch (phase) {
      case QuestionLoadingPhase.CREATED:
      case QuestionLoadingPhase.GENERATING_SQL:
      case QuestionLoadingPhase.EXECUTING:
      case QuestionLoadingPhase.QUEUEING:
      case QuestionLoadingPhase.SUMMARIZING: {
        const h = setTimeout(() => {
          if (isNonemptyString(idRef.current)) {
            void loadInternal(idRef.current, false);
          }
        }, pollInterval);
        return () => {
          clearTimeout(h);
        };
      }
      default:
        break;
    }
  }, [phase, loading, pollInterval]);

  // send gtag events when question id changes and the question is fully ready.
  useEffect(() => {
    if (notNullish(question) && FINAL_PHASES.has(phase) && phase !== QuestionLoadingPhase.SUMMARIZING) {
      gtagEvent('explore_question', {
        questionId: question.id,
        questionTitle: question.title,
        questionHitCache: question.hitCache,
        questionRecommended: question.recommended,
        questionStatus: question.status,
        questionNotClear: isNone(question.notClear),
        questionHasAssumption: !isNone(question.assumption),
        questionSqlCanAnswer: question.sqlCanAnswer,
        // Seconds used from load start to ready (or error).
        spent: (performance.now() - waitTimeRef.current) / 1000,
      });
    }
  }, [question?.id, FINAL_PHASES.has(phase) && phase !== QuestionLoadingPhase.SUMMARIZING]);

  return {
    phase,
    question,
    loading,
    error,
    load,
    create,
    reset,
    isSqlPending,
    isResultPending,
  };
}

export const QuestionManagementContext = createContext<QuestionManagement>({
  phase: QuestionLoadingPhase.NONE,
  question: undefined,
  loading: false,
  error: undefined,
  isSqlPending: true,
  isResultPending: true,
  load () {},
  create () {},
  reset () {},
});

QuestionManagementContext.displayName = 'QuestionManagementContext';

export default function useQuestionManagement () {
  return useContext(QuestionManagementContext);
}

/**
 * Returns if value is string and string is not 'None' or empty
 * @param string
 */
function isNone (string?: string) {
  if (isNonemptyString(string)) {
    return ['none', 'n/a'].includes(string.toLowerCase());
  }
  return true;
}

export function isEmptyResult (question: Question) {
  if (question.status === QuestionStatus.Success || question.status === QuestionStatus.Summarizing) {
    return (question.result?.rows.length ?? NaN) === 0;
  }
  return false;
}

export function hasAIPrompts (question: Question) {
  if (question.status === QuestionStatus.AnswerGenerating) {
    // RQ are generate first
    return notNone(question.combinedTitle) || notNone(question.notClear);
  } else {
    // For previous questions without CQ
    return (
      notNone(question.revisedTitle) ||
      notNone(question.combinedTitle) ||
      notNone(question.notClear)
    );
  }
}
