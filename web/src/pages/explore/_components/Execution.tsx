import { useAsyncOperation, useAsyncState } from '@site/src/hooks/operation';
import { ChartResult, newQuestion, pollQuestion, Question, QuestionStatus, questionToChart } from '@site/src/api/explorer';
import React, { ForwardedRef, forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { isEmptyArray, isNonemptyString, isNullish, notFalsy, notNullish } from '@site/src/utils/value';
import { format } from 'sql-formatter';
import Section from '@site/src/pages/explore/_components/Section';
import CodeBlock from '@theme/CodeBlock';
import { Charts } from '@site/src/pages/explore/_components/charts';
import { Alert, Divider, styled, ToggleButton, ToggleButtonGroup, Typography, useEventCallback } from '@mui/material';
import { useUserInfoContext } from '@site/src/context/user';
import { getErrorMessage, isAxiosError } from '@site/src/utils/error';
import { AxiosError } from 'axios';
import { applyForwardedRef } from '@site/src/utils/ref';
import { TabContext, TabPanel } from '@mui/lab';
import TableChart from './charts/TableChart';
import { AutoGraph, TableView } from '@mui/icons-material';
import Info from './Info';
import { twitterLink } from '@site/src/utils/share';
import ShareWithTwitter from '@site/src/pages/explore/_components/ShareWithTwitter';

export interface ExecutionContext {
  run: (question: string) => void;
  load: (questionId: string) => void;
  clear: () => void;
}

export interface ExecutionProps {
  search: string;
  questionId?: string;
  onLoading?: (loading: boolean) => void;
  onResultLoading?: (loading: boolean) => void;
  onChartLoading?: (loading: boolean) => void;
  onQuestionChange?: (question: Question) => void;
}

const PENDING_STATE = new Set([QuestionStatus.New, QuestionStatus.Waiting, QuestionStatus.Running]);

export function useQuestion (questionId?: string) {
  const { validating, userInfo, login } = useUserInfoContext();
  const { data, loading, error, setAsyncData, clearState } = useAsyncState<Question>();
  const runningQuestion = useRef<string>();

  const run = useEventCallback((question: string) => {
    if (!validating && !userInfo) {
      login();
      return;
    }
    clearState();
    setAsyncData(newQuestion(question));
  });

  const load = useEventCallback((questionId: string) => {
    if (runningQuestion.current === questionId) {
      return;
    }
    runningQuestion.current = questionId;
    setAsyncData(pollQuestion(questionId).then(question => {
      return question;
    }));
  });

  // only prefetch first question
  useEffect(() => {
    if (notNullish(questionId) && isNullish(data) && !loading) {
      load(questionId);
    }
  }, []);

  // clear state if question id was deleted
  useEffect(() => {
    if (isNullish(questionId)) {
      clearState();
    }
  }, [questionId]);

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

  return { run, load, question: data, loading, resultPending, sqlError: error, resultError, clear: clearState };
}

export function isSqlError (error: unknown): error is AxiosError<{ message: string, querySQL: string }> {
  if (isAxiosError(error) && notNullish(error.response)) {
    if (notNullish(error.response.data)) {
      return typeof error.response.data.message === 'string' && typeof error.response.data.querySQL === 'string';
    }
  }
  return false;
}

export default forwardRef<ExecutionContext, ExecutionProps>(function Execution ({ search, questionId, onLoading, onResultLoading, onChartLoading, onQuestionChange }, ref: ForwardedRef<ExecutionContext>) {
  const { question, run, load, clear, loading, resultPending, sqlError, resultError } = useQuestion(questionId);

  useEffect(() => {
    onLoading?.(loading);
  }, [loading, onLoading]);

  useEffect(() => {
    applyForwardedRef(ref, {
      run,
      load,
      clear () {
        clear();
        chartClear();
      },
    });
  }, []);

  useEffect(() => {
    if (notNullish(question)) {
      onQuestionChange?.(question);
    }
  }, [question, onQuestionChange]);

  const formattedSql = useMemo(() => {
    if (notNullish(question)) {
      return format(question.querySQL);
    }
    if (isSqlError(sqlError)) {
      return format(sqlError.response?.data.querySQL ?? '', { language: 'mysql' });
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
      return 'Generated SQL';
    }
  }, [question, loading, sqlError]);

  const result = question?.result?.rows;

  useEffect(() => {
    chartClear();
  }, [question]);

  const { data: chartData, setData: setChartData, loading: chartLoading, error: chartError, run: chartRun, clear: chartClear } = useAsyncOperation(question?.id, questionToChart);
  useEffect(() => {
    onChartLoading?.(chartLoading);
  }, [chartLoading, onChartLoading]);

  useEffect(() => {
    if (notNullish(question)) {
      if (notNullish(question.chart)) {
        setChartData(question.chart);
      } else if (notNullish(question.result)) {
        chartRun();
      }
    }
  }, [question?.result]);

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
          if (chartLoading) {
            return 'Visualizing...';
          } else {
            return <>{`${question.result?.rows.length ?? 'NaN'} rows in ${question.spent ?? 'NaN'} seconds`}{renderEngines(question)}</>;
          }
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
  }, [question, chartLoading]);

  const resultStatus = useMemo(() => {
    if (isNullish(question)) {
      return 'pending';
    } else if (resultPending || chartLoading) {
      return 'loading';
    } else {
      return 'success';
    }
  }, [question, loading, resultPending || chartLoading]);

  const twitterShareLink = useMemo(() => {
    let url;
    if (typeof location === 'undefined') {
      if (isNonemptyString(questionId)) {
        url = `https://ossinsight.io/explore?id=${questionId}`;
      } else {
        url = 'https://ossinsight.io/explore';
      }
    } else {
      url = twitterLink(location.href, { title: `${search} | OSSInsight Data Explorer\n`, hashtags: ['OpenSource', 'OpenAI', 'TiDBCloud'] });
    }
    return url;
  }, [search]);

  return (
    <>
      <Section
        status={sqlSectionStatus}
        title={sqlTitle}
        extra="auto"
        error={sqlError}
        errorWithChildren
      >
        {notFalsy(formattedSql) && (
          <CodeBlock language="sql">
            {formattedSql}
          </CodeBlock>
        )}
      </Section>
      <Section
        status={resultStatus}
        title={resultTitle}
        extra={<ShareWithTwitter href={twitterShareLink} />}
        error={resultError}
        defaultExpanded
      >
        <Chart chartData={chartData} chartError={chartError} result={result} fields={question?.result?.fields} />
      </Section>
    </>
  );
});

function renderEngines (question: Question | undefined) {
  if (notNullish(question) && !isEmptyArray(question.engines)) {
    return (
      <>
        , Running on
        <EngineTag>{question.engines.map(replaceEngineName).join(', ')}</EngineTag>
        <Info>
          <Typography variant="body1">
            <b>tikv</b>: row-store engine
            <br />
            <b>tiflash</b>: column-store engine
          </Typography>
          <Divider orientation="horizontal" sx={{ my: 1.5 }} light />
          <Typography variant="body2">
            Intelligent query processing in <a>TiDB optimizer</a>.
          </Typography>
        </Info>
      </>
    );
  }
  return null;
}

function replaceEngineName (name: string) {
  switch (name) {
    case 'tiflash':
      return 'column-store';
    case 'tikv':
      return 'row-store';
    default:
      return name;
  }
}

const EngineTag = styled('span')`
  color: #5667FF;
  border: 1px solid #5667FF80;
  border-radius: 2px;
  padding: 4px 8px;
  margin: 0 4px;
`;

function Chart ({ chartData, chartError, fields, result }: { chartData: ChartResult | undefined, chartError: unknown, result: Array<Record<string, any>> | undefined, fields: Array<{ name: string }> | undefined }) {
  const [tab, setTab] = useState('visualization');

  useEffect(() => {
    setTab('visualization');
  }, [chartData]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: string | undefined) => {
    if (isNonemptyString(newValue)) {
      setTab(newValue);
    }
  };

  return useMemo(() => {
    const renderError = (margin = false) => {
      return (
        <Alert severity="warning" sx={margin ? { mb: 2 } : undefined}>
          Unable to generate chart: {getErrorMessage(chartError)}
        </Alert>
      );
    };

    if (isNullish(result)) {
      if (notNullish(chartError)) {
        return renderError();
      }
      return null;
    }

    const renderTable = () => {
      return <TableChart chartName="Table" title="" data={result} fields={fields} />;
    };

    if (isNullish(chartData)) {
      if (notNullish(chartError)) {
        return (
          <>
            {renderError(true)}
            {renderTable()}
          </>
        );
      }
      return null;
    }

    const renderChart = () => {
      return <Charts {...chartData} data={result} fields={fields} />;
    };

    if (notNullish(chartError)) {
      return (
        <>
          {renderError(true)}
          {renderTable()}
        </>
      );
    }

    if (chartData.chartName === 'Table') {
      return renderChart();
    }

    return (
      <ChartContainer>
        <Controls className="chart-controls">
          <ToggleButtonGroup size="small" value={tab} onChange={handleTabChange} exclusive color="primary">
            <ToggleButton value="visualization">
              <AutoGraph />
            </ToggleButton>
            <ToggleButton value="raw">
              <TableView />
            </ToggleButton>
          </ToggleButtonGroup>
        </Controls>
        <TabContext value={tab}>
          <StyledTabPanel value="visualization">
            {renderChart()}
          </StyledTabPanel>
          <StyledTabPanel value="raw">
            {renderTable()}
          </StyledTabPanel>
        </TabContext>
      </ChartContainer>
    );
  }, [tab, chartData, chartError, result, fields]);
}

const Controls = styled('div')`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 8px;
  opacity: 0;
  position: absolute;
  right: 0;
  top: -16px;
  z-index: 1000;
  transition: opacity .2s ease;
`;

const ChartContainer = styled('div')`
  position: relative;

  &:hover > .chart-controls {
    opacity: 1;
  }
`;

const StyledTabPanel = styled(TabPanel)`
  padding: 0;
`;
