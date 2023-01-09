import { ChartResult, Question } from '@site/src/api/explorer';
import React, { useEffect, useMemo, useState } from 'react';
import { isEmptyArray, isNonemptyString, isNullish, notFalsy, notNullish } from '@site/src/utils/value';
import { format } from 'sql-formatter';
import Section from '@site/src/pages/explore/_components/Section';
import CodeBlock from '@theme/CodeBlock';
import { Charts } from '@site/src/pages/explore/_components/charts';
import { Divider, Portal, styled, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { getErrorMessage, isAxiosError } from '@site/src/utils/error';
import { AxiosError } from 'axios';
import { TabContext, TabPanel } from '@mui/lab';
import TableChart from './charts/TableChart';
import { AutoGraph, TableView } from '@mui/icons-material';
import Info from './Info';
import { twitterLink } from '@site/src/utils/share';
import ShareWithTwitter from '@site/src/pages/explore/_components/ShareWithTwitter';
import ErrorBlock from '@site/src/pages/explore/_components/ErrorBlock';
import useQuestionManagement, { QuestionLoadingPhase } from '@site/src/pages/explore/_components/useQuestion';
import PoweredBy from '@site/src/pages/explore/_components/PoweredBy';

export function isSqlError (error: unknown): error is AxiosError<{ message: string, querySQL: string }> {
  if (isAxiosError(error) && notNullish(error.response)) {
    if (notNullish(error.response.data)) {
      return typeof error.response.data.message === 'string' && typeof error.response.data.querySQL === 'string';
    }
  }
  return false;
}

export default function Execution ({ search }: { search: string }) {
  const { question, error, phase } = useQuestionManagement();
  const [controlsContainerRef, setControlsContainerRef] = useState<HTMLSpanElement | null>(null);

  const formattedSql = useMemo(() => {
    try {
      if (notNullish(question)) {
        return format(question.querySQL, { language: 'mysql' });
      }
      if (isSqlError(error)) {
        return format(error.response?.data.querySQL ?? '', { language: 'mysql' });
      }
    } catch (e) {
      return question?.querySQL ?? '';
    }
  }, [question, error]);

  const sqlSectionStatus = useMemo(() => {
    switch (phase) {
      case QuestionLoadingPhase.NONE:
        return 'pending';
      case QuestionLoadingPhase.LOADING:
      case QuestionLoadingPhase.CREATING:
        return 'loading';
      case QuestionLoadingPhase.GENERATE_SQL_FAILED:
      case QuestionLoadingPhase.LOAD_FAILED:
      case QuestionLoadingPhase.CREATE_FAILED:
        return 'error';
      default:
        return 'success';
    }
  }, [phase]);

  const sqlTitle = useMemo(() => {
    switch (phase) {
      case QuestionLoadingPhase.NONE:
        return '';
      case QuestionLoadingPhase.LOADING:
        return 'Loading question...';
      case QuestionLoadingPhase.CREATING:
        return 'Generating SQL...';
      case QuestionLoadingPhase.LOAD_FAILED:
        return 'Question not found';
      case QuestionLoadingPhase.GENERATE_SQL_FAILED:
      case QuestionLoadingPhase.CREATE_FAILED:
        return 'Failed to generate SQL';
      default:
        return 'Generated SQL';
    }
  }, [phase]);

  const result = question?.result?.rows;

  const resultStatus = useMemo(() => {
    switch (phase) {
      case QuestionLoadingPhase.CREATED:
      case QuestionLoadingPhase.QUEUEING:
      case QuestionLoadingPhase.EXECUTING:
        return 'loading';
      case QuestionLoadingPhase.EXECUTE_FAILED:
      case QuestionLoadingPhase.VISUALIZE_FAILED:
      case QuestionLoadingPhase.UNKNOWN_ERROR:
        return 'error';
      case QuestionLoadingPhase.READY:
        return 'success';
      default:
        return 'pending';
    }
  }, [phase]);

  const resultTitle = useMemo(() => {
    switch (phase) {
      case QuestionLoadingPhase.CREATED:
        return 'Pending...';
      case QuestionLoadingPhase.QUEUEING:
        return `Waiting execution in queue (currently in position ${question?.queuePreceding ?? NaN})...`;
      case QuestionLoadingPhase.EXECUTING:
        return 'Running SQL...';
      case QuestionLoadingPhase.EXECUTE_FAILED:
        return 'Failed to execute SQL';
      case QuestionLoadingPhase.UNKNOWN_ERROR:
        return 'Unknown error';
      case QuestionLoadingPhase.VISUALIZE_FAILED:
      case QuestionLoadingPhase.READY:
        return <>{`${question?.result?.rows.length ?? 'NaN'} rows in ${question?.spent ?? 'NaN'} seconds`}{renderEngines(question)}</>;
      default:
        return 'pending';
    }
  }, [question, phase]);

  const twitterShareLink = useMemo(() => {
    if (isNullish(question)) {
      return twitterLink(location.href, { title: 'OSSInsight Data Explorer', hashtags: ['OpenSource', 'OpenAI', 'TiDBCloud'] });
    }
    let url;
    if (typeof location === 'undefined') {
      if (isNonemptyString(question.id)) {
        url = `https://ossinsight.io/explore?id=${question.id}`;
      } else {
        url = 'https://ossinsight.io/explore';
      }
    } else {
      url = twitterLink(location.href, { title: `${search} | OSSInsight Data Explorer\n`, hashtags: ['OpenSource', 'OpenAI', 'TiDBCloud'] });
    }
    return url;
  }, [question, search]);

  const sqlSectionError = useMemo(() => {
    if (sqlSectionStatus === 'error') {
      return error;
    }
  }, [sqlSectionStatus, error]);

  const resultSectionError = useMemo(() => {
    if (resultStatus === 'error') {
      return error;
    }
  }, [resultStatus, error]);

  const chartError = useMemo(() => {
    if (phase === QuestionLoadingPhase.VISUALIZE_FAILED) {
      return error;
    }
  }, [phase, error]);

  return (
    <>
      <Section
        status={sqlSectionStatus}
        title={sqlTitle}
        extra="auto"
        error={sqlSectionError}
        errorWithChildren
        errorTitle="Failed to generate SQL"
        errorPrompt="Hi, it's failed to generate SQL for"
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
        extra={
          <ControlsContainer>
            <span ref={setControlsContainerRef} />
            <ShareWithTwitter href={twitterShareLink} />
          </ControlsContainer>
        }
        error={resultSectionError}
        defaultExpanded
        errorTitle="Failed to execute question"
        errorPrompt="Hi, it's failed to execute"
      >
        <Chart chartData={question?.chart ?? undefined} chartError={chartError} result={result} fields={question?.result?.fields} controlsContainer={controlsContainerRef} />
      </Section>
      {phase === QuestionLoadingPhase.READY && <PoweredBy sx={{ mt: 2 }} />}
    </>
  );
};

function renderEngines (question: Question | undefined) {
  if (notNullish(question) && !isEmptyArray(question.engines)) {
    return (
      <>
        , Running on
        <EngineTag>{question.engines.map(replaceEngineName).join(', ')}</EngineTag>
        <Info>
          <Typography variant="body1">
            <b>tikv</b>: row storage engine
            <br />
            <b>tiflash</b>: columnar storage engine
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
      return 'columnar storage';
    case 'tikv':
      return 'row storage';
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

function Chart ({ chartData, chartError, fields, result, controlsContainer }: { chartData: ChartResult | undefined, chartError: unknown, result: Array<Record<string, any>> | undefined, fields: Array<{ name: string }> | undefined, controlsContainer: HTMLSpanElement | null }) {
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
    const errMsg = getErrorMessage(chartError);
    const renderError = (margin = false, recommend = false) => {
      return (
        <ErrorBlock
          title="Unable to generate chart"
          prompt="Hi, it's failed to generate chart for"
          error={errMsg}
          severity="warning"
          sx={margin ? { mb: 2 } : undefined}
          showSuggestions={recommend}
        />
      );
    };

    if (isNullish(result)) {
      if (notNullish(chartError)) {
        return renderError(false, true);
      }
      return null;
    }

    const renderTips = () => {
      return (
        <Typography variant="body2" color="#D1D1D1" mt={2}>
          🤔 Confused with this answer? Try to tiny your words and help the AI identify your question, for example, you can try to use ‘@repo_name/user_name’ to narrow down your query. If you have more questions about the accuracy of the answers, see FAQ here.
        </Typography>
      );
    };

    const renderTable = () => {
      return (
        <>
          <TableChart chartName="Table" title="" data={result} fields={fields} />
          {renderTips()}
        </>
      );
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
      return (
        <>
          <Charts {...chartData} data={result} fields={fields} />
          {renderTips()}
        </>
      );
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
      <>
        <Portal container={controlsContainer}>
          <Controls className="chart-controls">
            <ToggleButtonGroup size="small" value={tab} onChange={handleTabChange} exclusive color="primary">
              <ToggleButton value="visualization" size="small" sx={{ padding: '5px' }}>
                <AutoGraph fontSize="small" />
              </ToggleButton>
              <ToggleButton value="raw" size="small" sx={{ padding: '5px' }}>
                <TableView fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>
          </Controls>
        </Portal>
        <TabContext value={tab}>
          <StyledTabPanel value="visualization">
            {renderChart()}
          </StyledTabPanel>
          <StyledTabPanel value="raw">
            {renderTable()}
          </StyledTabPanel>
        </TabContext>
      </>
    );
  }, [tab, chartData, chartError, result, fields]);
}

const Controls = styled('div')`
  display: inline-flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 0;
  transition: opacity .2s ease;
  margin-right: 12px;
  padding-right: 12px;
  border-right: 1px solid #3c3c3c;
`;

const ControlsContainer = styled('span')`
  display: inline-flex;
  align-items: center;
`;

const StyledTabPanel = styled(TabPanel)`
  padding: 0;
`;
