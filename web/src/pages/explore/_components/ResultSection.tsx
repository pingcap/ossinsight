import Section from '@site/src/pages/explore/_components/Section';
import ShareWithTwitter from '@site/src/pages/explore/_components/ShareWithTwitter';
import React, { useEffect, useMemo, useState } from 'react';
import useQuestionManagement, { QuestionLoadingPhase } from '@site/src/pages/explore/_components/useQuestion';
import { isEmptyArray, isNonemptyString, isNullish, notNullish } from '@site/src/utils/value';
import { twitterLink } from '@site/src/utils/share';
import { ChartResult, Question, QuestionStatus } from '@site/src/api/explorer';
import Info from '@site/src/pages/explore/_components/Info';
import { Portal, styled, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { getErrorMessage } from '@site/src/utils/error';
import ErrorBlock from '@site/src/pages/explore/_components/ErrorBlock';
import Feedback from '@site/src/pages/explore/_components/Feedback';
import TableChart from '@site/src/pages/explore/_components/charts/TableChart';
import { Charts } from '@site/src/pages/explore/_components/charts';
import { AutoGraph, TableView } from '@mui/icons-material';
import { TabContext, TabPanel } from '@mui/lab';
import { useExploreContext } from '@site/src/pages/explore/_components/context';
import { useInterval } from 'ahooks';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import SummaryCard from '@site/src/pages/explore/_components/SummaryCard';
import { uniqueItems } from '@site/src/utils/generate';

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

  const twitterShareLink = useMemo(() => {
    if (isNullish(question)) {
      return twitterLink(location.href, { title: 'OSSInsight Data Explorer', hashtags: ['OpenSource', 'OpenAI', 'TiDBCloud'] });
    }
    let url;
    const title = question.answerSummary?.content ?? search;
    const hashtags = uniqueItems(question.answerSummary?.hashtags ?? [], ['OpenSource', 'OpenAI', 'TiDBCloud']);
    if (typeof location === 'undefined') {
      if (isNonemptyString(question.id)) {
        url = `https://ossinsight.io/explore?id=${question.id}`;
      } else {
        url = 'https://ossinsight.io/explore';
      }
    } else {
      url = twitterLink(location.href, { title: `${title} | OSSInsight Data Explorer\n`, hashtags });
    }
    return url;
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

  return (
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
      {(notNullish(question?.answerSummary) || question?.status === QuestionStatus.Summarizing) && (
        <SummaryCard loading={question?.status === QuestionStatus.Summarizing}>{question?.answerSummary?.content}</SummaryCard>
      )}
      {phase === QuestionLoadingPhase.QUEUEING && <PromptTitle source={question?.queuePreceding === 0 ? QUEUE_ALMOST_PROMPT_TITLES : QUEUE_PROMPT_TITLES} interval={3000} />}
      {phase === QuestionLoadingPhase.EXECUTING && <PromptTitle source={RUNNING_PROMPT_TITLES} interval={2000} />}
      <Chart chartData={question?.chart ?? undefined} chartError={chartError} result={result} fields={question?.result?.fields} controlsContainer={controlsContainerRef} />
    </Section>
  );
}

function renderEngines (question: Question | undefined) {
  if (notNullish(question) && !isEmptyArray(question.engines)) {
    return (
      <>
        , Running on
        <EngineTag>{question.engines.map(replaceEngineName).join(', ')}</EngineTag>
        <Info>
          All queries to 5 billion rows of GitHub event data are running on ONE TiDB server.
          <br />
          <a href="https://docs.pingcap.com/tidb/stable/dev-guide-hybrid-oltp-and-olap-queries" target="_blank" rel="noreferrer">TiDB optimizer</a> intelligently determines whether to use a row-based (OLTP-friendly) or columnar (OLAP-friendly) storage engine.
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
        <Typography component="div" variant="body2" color="#D1D1D1" mt={2}>
          🤔 Not exactly what you&apos;re looking for?
          <ul>
            <li>Try specifying the repo path or user id(NOT name) to help AI understand your question better. For more tips, check out our FAQ.</li>
            <li>AI-generated SQL is still a work in progress and may have limitations</li>
            <li>If you Find answers in your own data using natural language.</li>
          </ul>
        </Typography>
      );
    };

    const renderTable = () => {
      return (
        <>
          <VisualizationContainer>
            <TableChart chartName="Table" title="" data={result} fields={fields} />
            <Feedback />
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
            <Charts {...chartData} data={result} fields={fields} />
            <Feedback />
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
  'Do you know how many types of events on GitHub? 17.',
  'GitHub accumulates over 4 million new events each day. We synchronize these data in real time.',
  'In 2022, 95% of the top 20 most active developers on GitHub are bots.',
  'Python has been the most used back-end programming language for years on GitHub.',
];

const QUEUE_ALMOST_PROMPT_TITLES = [
  'Almost there! Can\'t wait to see your result!',
];

const RUNNING_PROMPT_TITLES = [
  'GitHub has an incredible 5+ billion rows of event data waiting for you to explore.',
  'Perhaps AI generates a complex SQL.',
  'Are you curious about the complex SQL generated by AI?',
];

const PromptTitle = ({ source, interval }: { source: string[], interval: number }) => {
  const [index, setIndex] = useState(0);

  useInterval(() => {
    setIndex(index => (index + 1) % source.length);
  }, interval);

  return (
    <TransitionGroup component={PromptTitleContainer}>
      <CSSTransition key={index} timeout={400} classNames="item">
        <Prompt>
          {source[index]}
        </Prompt>
      </CSSTransition>
    </TransitionGroup>
  );
};

const PromptTitleContainer = styled('span')`
  position: relative;
  display: block;
  min-height: 42px;
  min-width: 1px;
`;

const Prompt = styled('span')`
  display: inline-block;
  width: max-content;
  transition: ${({ theme }) => theme.transitions.create(['opacity', 'transform'], { duration: 400 })};

  &.item-enter {
    opacity: 0;
    transform: translate3d(-10%, 0, 0) scale(0.85);
  }

  &.item-enter-active {
    position: absolute;
    opacity: 1;
    transform: none;
  }

  &.item-exit {
    opacity: 1;
    transform: none;
  }

  &.item-exit-active {
    position: absolute;
    opacity: 0;
    transform: translate3d(10%, 0, 0) scale(0.85);
  }
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
