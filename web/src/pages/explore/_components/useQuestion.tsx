import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { newQuestion, pollQuestion, Question, QuestionStatus } from '@site/src/api/explorer';
import { useMemoizedFn } from 'ahooks';
import { isFalsy, isFiniteNumber, isNonemptyString, notNullish } from '@site/src/utils/value';
import { timeout } from '@site/src/utils/promisify';
import { useAuth0 } from '@auth0/auth0-react';

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

export const FINAL_PHASES = new Set([
  QuestionLoadingPhase.NONE,
  QuestionLoadingPhase.READY,
  QuestionLoadingPhase.SUMMARIZING,
  QuestionLoadingPhase.UNKNOWN_ERROR,
  QuestionLoadingPhase.GENERATE_SQL_FAILED,
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
      } else {
        return QuestionLoadingPhase.VISUALIZE_FAILED;
      }
    case QuestionStatus.Error:
      if (notNullish(question.error)) {
        whenError(question.error);
      } else {
        whenError('Empty error message');
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

  load: (id: string) => void;

  create: (title: string) => void;

  reset: () => void;
}

export function useQuestionManagementValues ({ pollInterval = 2000 }: QuestionManagementOptions): QuestionManagement {
  const [phase, setPhase] = useState<QuestionLoadingPhase>(QuestionLoadingPhase.NONE);
  const [question, setQuestion] = useState<Question>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>();
  const idRef = useRef<string>();

  const { isLoading, user, getAccessTokenSilently, loginWithPopup } = useAuth0();

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
        setError(undefined);
        setQuestion(undefined);
        setPhase(QuestionLoadingPhase.LOADING);
      }
      setLoading(true);
      const result = await pollQuestion(id);
      idRef.current = result.id;
      setPhase(computePhase(result, setError));
      setQuestion(result);
    } catch (e) {
      setPhase(QuestionLoadingPhase.LOAD_FAILED);
      setError(e);
      return await Promise.reject(e);
    } finally {
      setLoading(false);
    }
  });

  const load = useMemoizedFn((id: string) => {
    void loadInternal(id, true);
  });

  const create = useMemoizedFn((title: string) => {
    async function createInternal (title: string) {
      try {
        if (!isLoading && !user) {
          return await loginWithPopup();
        }
        setError(undefined);
        setQuestion(undefined);
        setLoading(true);
        setPhase(QuestionLoadingPhase.CREATING);
        const accessToken = await getAccessTokenSilently();
        const result = await newQuestion(title, { accessToken });
        await timeout(600);
        idRef.current = result.id;
        setPhase(computePhase(result, setError));
        setQuestion(result);
      } catch (e) {
        setPhase(QuestionLoadingPhase.CREATE_FAILED);
        setError(e);
        return await Promise.reject(e);
      } finally {
        setLoading(false);
      }
    }

    void createInternal(title);
  });

  const reset = useMemoizedFn(() => {
    setPhase(QuestionLoadingPhase.NONE);
    setQuestion(undefined);
    setLoading(false);
    setError(undefined);
    idRef.current = undefined;
  });

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
      case QuestionLoadingPhase.SUMMARIZING:
      // case QuestionLoadingPhase.VISUALIZING:
      {
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

  return {
    phase,
    question,
    loading,
    error,
    load,
    create,
    reset,
  };
}

export const QuestionManagementContext = createContext<QuestionManagement>({
  phase: QuestionLoadingPhase.NONE,
  question: undefined,
  loading: false,
  error: undefined,
  load () {},
  create () {},
  reset () {},
});

QuestionManagementContext.displayName = 'QuestionManagementContext';

export default function useQuestionManagement () {
  return useContext(QuestionManagementContext);
}
