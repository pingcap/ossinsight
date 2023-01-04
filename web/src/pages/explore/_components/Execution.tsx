import { useAsyncOperation, useAsyncState } from '@site/src/hooks/operation';
import { newQuestion, pollQuestion, Question, QuestionStatus, questionToChart } from '@site/src/api/explorer';
import React, { ForwardedRef, forwardRef, useEffect, useMemo, useRef } from 'react';
import { isNullish, notFalsy, notNullish } from '@site/src/utils/value';
import { format } from 'sql-formatter';
import Section from '@site/src/pages/explore/_components/Section';
import CodeBlock from '@theme/CodeBlock';
import { Charts } from '@site/src/pages/explore/_components/charts';
import { useEventCallback } from '@mui/material';
import TableChart from './charts/TableChart';
import { useUserInfoContext } from '@site/src/context/user';
import { isAxiosError } from '@site/src/utils/error';
import { AxiosError } from 'axios';
import { applyForwardedRef } from '@site/src/utils/ref';

export interface ExecutionContext {
  run: (question?: string) => void;
}

export interface ExecutionProps {
  search: string;
  onLoading?: (loading: boolean) => void;
  onResultLoading?: (loading: boolean) => void;
  onChartLoading?: (loading: boolean) => void;
}

const PENDING_STATE = new Set([QuestionStatus.New, QuestionStatus.Waiting, QuestionStatus.Running]);

export function useQuestion (content: string) {
  const userInfo = useUserInfoContext();
  const { data, loading, error, setAsyncData, clearState } = useAsyncState<Question>();
  const runningQuestion = useRef<string>();

  const run = useEventCallback((question?: string) => {
    if (userInfo.validating && !userInfo.userInfo) {
      userInfo.login();
      return;
    }
    const real = question ?? content;
    runningQuestion.current = real;
    setAsyncData(newQuestion(real));
  });

  useEffect(() => {
    if (runningQuestion.current !== content) {
      clearState();
      runningQuestion.current = undefined;
    }
  }, [content]);

  useEffect(() => {
    if (notNullish(data) && !loading) {
      switch (data.status) {
        case QuestionStatus.New:
        case QuestionStatus.Waiting:
        case QuestionStatus.Running: {
          const h = setTimeout(() => {
            setAsyncData(pollQuestion(data.id));
          }, 1500);
          return () => {
            clearTimeout(h);
          };
        }
        case QuestionStatus.Success:
        case QuestionStatus.Error:
        case QuestionStatus.Cancel:
          break;
      }
    }
  }, [data, loading]);

  const resultPending = isNullish(data) ? false : PENDING_STATE.has(data.status);
  const resultError = data?.status === QuestionStatus.Cancel ? new Error('Execution was canceled') : (data?.error);

  return { run, question: data, loading, resultPending, sqlError: error, resultError };
}

export function isSqlError (error: unknown): error is AxiosError<{ message: string, querySQL: string }> {
  if (isAxiosError(error) && notNullish(error.response)) {
    if (notNullish(error.response.data)) {
      return typeof error.response.data.message === 'string' && typeof error.response.data.querySQL === 'string';
    }
  }
  return false;
}

export default forwardRef<ExecutionContext, ExecutionProps>(function Execution ({ search, onLoading, onResultLoading, onChartLoading }, ref: ForwardedRef<ExecutionContext>) {
  const { question, run, loading, resultPending, sqlError, resultError } = useQuestion(search);

  useEffect(() => {
    onLoading?.(loading);
  }, [loading, onLoading]);

  useEffect(() => {
    applyForwardedRef(ref, { run });
  }, []);

  const formattedSql = useMemo(() => {
    if (notNullish(question)) {
      return format(question.querySQL);
    }
    if (isSqlError(sqlError)) {
      return format(sqlError.response?.data.querySQL ?? '');
    }
  }, [question, sqlError]);

  const waitingResult = useMemo(() => {
    if (isNullish(question)) {
      return false;
    }
    if (loading) {
      return false;
    }
    return resultPending;
  }, [question, loading, resultPending]);

  useEffect(() => {
    onResultLoading?.(waitingResult);
  }, [waitingResult, onResultLoading]);

  const sqlSectionStatus = useMemo(() => {
    if (isNullish(question)) {
      if (loading) {
        return 'loading';
      } else {
        return 'pending';
      }
    }
    return 'success';
  }, [loading, question]);

  const sqlTitle = useMemo(() => {
    if (isNullish(question)) {
      if (loading) {
        return 'Generating SQL...';
      } else if (isNullish(sqlError)) {
        return '';
      } else {
        return 'Failed to generate SQL';
      }
    } else {
      return 'Show SQL';
    }
  }, [question, loading, sqlError]);

  const resultTitle = useMemo(() => {
    if (notNullish(question)) {
      switch (question.status) {
        case QuestionStatus.New:
          return 'Pending...';
        case QuestionStatus.Waiting:
          return 'Waiting execution...';
        case QuestionStatus.Running:
          return 'Running SQL...';
        case QuestionStatus.Success:
          return `${question.result?.rows.length ?? 'NaN'} rows in ${question.spent ?? 'NaN'} seconds`;
        case QuestionStatus.Error:
          return 'Failed to execute SQL';
        case QuestionStatus.Cancel:
          return 'Execution canceled';
        default:
          return 'Unknown state';
      }
    } else {
      return 'Pending...';
    }
  }, [question]);

  const resultStatus = useMemo(() => {
    if (isNullish(question)) {
      if (loading) {
        return 'loading';
      } else {
        return 'pending';
      }
    } else if (resultPending) {
      return 'loading';
    } else {
      return 'success';
    }
  }, [question, waitingResult]);

  const resultExtra = useMemo(() => {
    if (isNullish(question)) {
      return undefined;
    }
    if (question.engines.length > 0) {
      return 'Run with ' + question.engines.join(', ');
    } else {
      return undefined;
    }
  }, [question]);

  const result = question?.result?.rows;

  useEffect(() => {
    clear();
  }, [question]);

  const { data: chartData, loading: chartLoading, error: chartError, run: chartRun, clear } = useAsyncOperation(question?.id, questionToChart, true);
  useEffect(() => {
    onChartLoading?.(chartLoading);
  }, [chartLoading, onChartLoading]);

  useEffect(() => {
    if (notFalsy(search) && notNullish(question?.result)) {
      chartRun();
    }
  }, [search, question?.result]);

  const chartTitle = useMemo(() => {
    return chartLoading ? 'Visualizing...' : 'Visualization';
  }, [chartLoading]);

  const chartStatus = useMemo(() => {
    if (chartLoading) {
      return 'loading';
    } else if (notNullish(result) && notNullish(chartData)) {
      return 'success';
    } else {
      return 'pending';
    }
  }, [chartLoading, result, chartData]);

  return (
    <>
      <Section status={sqlSectionStatus} title={sqlTitle} error={sqlError} errorWithChildren>
        {notFalsy(formattedSql) && (
          <CodeBlock language="sql">
            {formattedSql}
          </CodeBlock>
        )}
      </Section>
      <Section status={resultStatus} title={resultTitle} extra={resultExtra} error={resultError}>
        <TableChart chartName="Table" title="hi" data={result ?? []} fields={question?.result?.fields} />
      </Section>
      <Section status={chartStatus} title={chartTitle} error={chartError} defaultExpanded>
        {(notNullish(chartData) && notNullish(result)) ? <Charts {...chartData} data={result} fields={question?.result?.fields} /> : undefined}
      </Section>
    </>
  );
});
