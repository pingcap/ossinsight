import Section from '@site/src/pages/explore/_components/Section';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import useQuestionManagement, { QuestionLoadingPhase } from '@site/src/pages/explore/_components/useQuestion';
import { isEmptyArray, isNonemptyString, isNullish, nonEmptyArray, notNullish } from '@site/src/utils/value';
import { ChartResult, Question, QuestionStatus } from '@site/src/api/explorer';
import Info from '@site/src/pages/explore/_components/Info';
import { Divider, Portal, Stack, styled, ToggleButton, ToggleButtonGroup, Typography, useEventCallback } from '@mui/material';
import { getErrorMessage } from '@site/src/utils/error';
import ErrorBlock from '@site/src/pages/explore/_components/ErrorBlock';
import TableChart from '@site/src/pages/explore/_components/charts/TableChart';
import { Charts } from '@site/src/pages/explore/_components/charts';
import { AutoGraph, TableView } from '@mui/icons-material';
import { TabContext, TabPanel } from '@mui/lab';
import { useExploreContext } from '@site/src/pages/explore/_components/context';
import SummaryCard from '@site/src/pages/explore/_components/SummaryCard';
import { uniqueItems } from '@site/src/utils/generate';
import ShareButtons from './ShareButtons';
import TypewriterEffect from '@site/src/pages/explore/_components/TypewriterEffect';
import { gotoAnchor } from '@site/src/utils/dom';
import TiDBCloudLink from '@site/src/components/TiDBCloudLink';
import Feedback from '@site/src/pages/explore/_components/Feedback';
import { Prompts } from '@site/src/pages/explore/_components/Prompt';

export default function ResultSection () {
  const { question, error, phase } = useQuestionManagement();
  const { search } = useExploreContext();
  const [controlsContainerRef, setControlsContainerRef] = useState<HTMLSpanElement | null>(null);

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
      case QuestionLoadingPhase.SUMMARIZING:
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
        return `${question?.queuePreceding ?? NaN} requests ahead`;
      case QuestionLoadingPhase.EXECUTING:
        return 'Running SQL...';
      case QuestionLoadingPhase.EXECUTE_FAILED:
        return 'Failed to execute SQL';
      case QuestionLoadingPhase.UNKNOWN_ERROR:
        return 'Unknown error';
      case QuestionLoadingPhase.VISUALIZE_FAILED:
      case QuestionLoadingPhase.READY:
      case QuestionLoadingPhase.SUMMARIZING:
        return <>{`${question?.result?.rows.length ?? 'NaN'} rows in ${question?.spent ?? 'NaN'} seconds`}{renderEngines(question)}</>;
      default:
        return 'pending';
    }
  }, [question, phase]);

  const { url, title, hashtags } = useMemo(() => {
    if (isNullish(question)) {
      return {
        url: 'https://ossinsight.io/explore/',
        title: 'Data Explorer',
        hashtags: [],
      };
    }
    let url;
    const title = `${search} | OSSInsight Data Explorer`;
    const hashtags = uniqueItems(question.answerSummary?.hashtags ?? [], ['OpenSource', 'OpenAI', 'TiDBCloud']);
    if (isNonemptyString(question.id)) {
      url = `https://ossinsight.io/explore?id=${question.id}`;
    } else {
      url = 'https://ossinsight.io/explore/';
    }
    return { url, title, hashtags };
  }, [question, search]);

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

  const summaryContent = useMemo(() => {
    if (notNullish(question) && notNullish(question.answerSummary)) {
      if (nonEmptyArray(question.answerSummary.hashtags)) {
        return `${question.answerSummary.content}\n${question.answerSummary.hashtags.map(item => `#${item}`).join(' ')}`;
      } else {
        return question.answerSummary.content;
      }
    }
    return '';
  }, [question?.answerSummary]);

  return (
    <Section
      status={resultStatus}
      title={resultTitle}
      extra={
        <ControlsContainer>
          <span ref={setControlsContainerRef} />
          <ShareButtons url={url} title={title} summary={question?.answerSummary?.content} hashtags={hashtags} />
        </ControlsContainer>
      }
      error={resultSectionError}
      defaultExpanded
      errorTitle="Failed to execute question"
      errorPrompt="Hi, it's failed to execute"
      errorMessage={
        <>
          Oops, something went wrong while executing your SQL query. Please try again.
          If the problem persists, check out <a href="javascript:void(0)" onClick={gotoAnchor('data-explorer-faq')}>FAQ</a>
        </>
      }
    >
      {(notNullish(question?.answerSummary) || question?.status === QuestionStatus.Summarizing) && (
        <SummaryCard loading={question?.status === QuestionStatus.Summarizing}>
          <TypewriterEffect content={summaryContent} maxContinuous={2} avgInterval={40} />
        </SummaryCard>
      )}
      {phase === QuestionLoadingPhase.QUEUEING && <PromptsTitle source={question?.queuePreceding === 0 ? QUEUE_ALMOST_PROMPT_TITLES : QUEUE_PROMPT_TITLES} interval={5000} />}
      {phase === QuestionLoadingPhase.EXECUTING && <PromptsTitle source={RUNNING_PROMPT_TITLES} interval={3000} />}
      <Chart chartData={question?.chart ?? undefined} chartError={chartError} result={result} fields={question?.result?.fields} controlsContainer={controlsContainerRef} />
    </Section>
  );
}

function renderEngines (question: Question | undefined) {
  if (notNullish(question) && !isEmptyArray(question.engines)) {
    return (
      <>
        . Running on <EngineTag>{question.engines.map(replaceEngineName).join(', ')}</EngineTag>
        <Info>
          All queries run on <b>ONE</b> TiDB service. The TiDB SQL optimizer decides which engine to use for executing queries:
          <ul>
            <li>Complex and heavy OLAP queries are executed by the columnar engine.</li>
            <li>Low-latency high-concurrency OLTP queries are executed by the row-based engine.</li>
          </ul>
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
  color: #B0B8FF;
`;

function Chart ({ chartData, chartError, fields, result, controlsContainer }: { chartData: ChartResult | undefined, chartError: unknown, result: Array<Record<string, any>> | undefined, fields: Array<{ name: string }> | undefined, controlsContainer: HTMLSpanElement | null }) {
  const [tab, setTab] = useState('visualization');
  const defaultTabRef = useRef('visualization');

  useEffect(() => {
    setTab(defaultTabRef.current);
  }, [chartData]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: string | undefined) => {
    if (isNonemptyString(newValue)) {
      setTab(newValue);
    }
  };

  const handleChartPrepared = useEventCallback((error: boolean) => {
    if (error) {
      defaultTabRef.current = 'raw';
    } else {
      defaultTabRef.current = 'visualization';
    }
  });

  const handleChartExit = useEventCallback(() => {
    defaultTabRef.current = 'visualization';
  });

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
        <>
          <Stack direction="row" justifyContent="center" alignItems="center" flexWrap="wrap" spacing={0.5} py={1} mt={2} fontSize="inherit" bgcolor="#323140">
            <Typography variant="body1" mr={2}>Do you like the result?</Typography>
            <Feedback />
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Typography component="div" variant="body2" color="#D1D1D1">
            🤔 Not exactly what you&apos;re looking for?
            <ul>
              <li>AI can write SQL effectively, but remember that it&apos;s still a work in progress with limitations.</li>
              <li>Clear and specific language will help the AI understand your needs. Eg. use &apos;@facebook/react&apos; instead of &apos;react&apos;. Check out <a href="javascript:void(0)" onClick={gotoAnchor('data-explorer-faq')}>FAQ</a> for more tips.</li>
              <li>GitHub data is not your focus? <TiDBCloudLink>Use Chat2Query to empower your data exploration</TiDBCloudLink> on any dataset.
              </li>
            </ul>
          </Typography>
        </>
      );
    };

    const renderTable = () => {
      return (
        <>
          <VisualizationContainer>
            <TableChart chartName="Table" title="" data={result} fields={fields} />
          </VisualizationContainer>
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
          <VisualizationContainer>
            <Charts {...chartData} data={result} fields={fields} onPrepared={handleChartPrepared} onExit={handleChartExit} />
          </VisualizationContainer>
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

const QUEUE_PROMPT_TITLES = [
  'So many people are just as curious as you are.',
  'Do you know how many types of events on GitHub? - 17 types!',
  'GitHub generates over 4 million new events each day. We synchronize with them in real time and insert updates in milliseconds.',
  'In 2022, 95% of the top 20 most active developers on GitHub are bots.',
  'Python has been the most used back-end programming language for years on GitHub.',
];

const QUEUE_ALMOST_PROMPT_TITLES = [
  'Almost there! Can\'t wait to see your result!',
];

const RUNNING_PROMPT_TITLES = [
  <>Querying <b>5+ billion</b> rows of GitHub data...</>,
  <>We stay in sync with GitHub event data for <b>real-time</b> insights!</>,
  <>We can handle <b>complex queries</b> with a powerful database, even those generated by AI.</>,
  <><b>👀 Tips</b>: Click <b>Show</b> in the upper right corner to check the SQL query generated by AI.</>,
];

const PromptsTitle = styled(Prompts)`
  min-height: 42px;
  min-width: 1px;
`;

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

const VisualizationContainer = styled('div')`
  position: relative;
`;
