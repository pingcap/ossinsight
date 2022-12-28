import { useAsyncOperation } from '@site/src/hooks/operation';
import { ask, getResult, guessChart, isWaiting } from '@site/src/api/explorer';
import React, { ForwardedRef, forwardRef, useEffect, useMemo } from 'react';
import { isNullish, notFalsy, notNullish } from '@site/src/utils/value';
import { format } from 'sql-formatter';
import Section from '@site/src/pages/explore/_components/Section';
import CodeBlock from '@theme/CodeBlock';
import { Charts } from '@site/src/pages/explore/_components/charts';

export interface ExecutionContext {
  run: () => void;
}

export interface ExecutionProps {
  search: string;
}

export default forwardRef<ExecutionContext, ExecutionProps>(function Execution ({ search }, ref: ForwardedRef<ExecutionContext>) {
  const { data, loading, run, error } = useAsyncOperation(search, ask, true);
  const { data: resultData, loading: resultLoading, run: resultRun, error: resultError } = useAsyncOperation(data?.execution.id, getResult, true);

  useEffect(() => {
    if (typeof ref === 'function') {
      ref({
        run,
      });
    } else if (notNullish(ref)) {
      ref.current = { run };
    }
  }, []);

  useEffect(() => {
    if (notNullish(data)) {
      if (isWaiting(data) && isNullish(error)) {
        resultRun();
      }
    }
  }, [data, error]);

  useEffect(() => {
    if (notNullish(resultData)) {
      if (isWaiting(resultData) && isNullish(resultError)) {
        const h = setTimeout(resultRun, 1000);
        return () => {
          clearTimeout(h);
        };
      }
    }
  }, [resultData, resultError]);

  const sqlSectionStatus = useMemo(() => {
    if (loading) {
      return 'loading';
    } else if (isNullish(data)) {
      return 'pending';
    } else {
      return 'success';
    }
  }, [loading, data]);

  const formattedSql = useMemo(() => {
    if (notNullish(data)) {
      return format(data.sql);
    }
  }, [data]);

  const result = useMemo(() => {
    if (notNullish(data) && !isWaiting(data)) {
      return data;
    } else if (notNullish(resultData) && !isWaiting(resultData)) {
      return resultData;
    } else {
      return undefined;
    }
  }, [data, resultData]);

  const waitingResult = useMemo(() => {
    if (isNullish(data)) {
      return false;
    }
    if (loading) {
      return false;
    }
    if (isWaiting(data)) {
      return isNullish(resultData) || isWaiting(resultData);
    } else {
      return false;
    }
  }, [result, data, resultData, loading, resultLoading]);

  const resultStatus = useMemo(() => {
    if (waitingResult) {
      return 'loading';
    } else if (isNullish(result)) {
      return 'pending';
    } else {
      return 'success';
    }
  }, [result, waitingResult]);

  const resultTitle = useMemo(() => {
    if (isNullish(result)) {
      return 'Waiting execution...';
    } else {
      return `${result.data.length} results in ${result.spent} seconds`;
    }
  }, [result]);

  const resultExtra = useMemo(() => {
    if (isNullish(result)) {
      return undefined;
    }
    if (result.execution.engines.length > 0) {
      return 'Run with ' + result.execution.engines.join(', ');
    } else {
      return undefined;
    }
  }, [result]);

  const { data: chartData, loading: chartLoading, error: chartError, run: chartRun } = useAsyncOperation({ question: search, data: result?.data }, guessChart, true);
  useEffect(() => {
    if (notFalsy(search) && notNullish(result?.data)) {
      chartRun();
    }
  }, [search, result?.data]);

  const chartTitle = useMemo(() => {
    return chartLoading ? 'Drawing chart...' : 'Chart view';
  }, [chartLoading]);

  const chartStatus = useMemo(() => {
    if (chartLoading) {
      return 'loading';
    } else if (notNullish(chartData)) {
      return 'success';
    } else {
      return 'pending';
    }
  }, [chartLoading, chartData]);

  return (
      <>
        <Section status={sqlSectionStatus} title="Your AI generated SQL Query" error={error}>
          <CodeBlock language="sql">
            {formattedSql}
          </CodeBlock>
        </Section>
        <Section status={resultStatus} title={resultTitle} extra={resultExtra} error={resultError}>
          <pre>{JSON.stringify(result?.data, undefined, 2)}</pre>
        </Section>
        <Section status={chartStatus} title={chartTitle} error={chartError} defaultExpanded>
          {notNullish(chartData) && notNullish(result) ? <Charts {...chartData} data={result.data} /> : undefined}
        </Section>
      </>
  );
},
);
