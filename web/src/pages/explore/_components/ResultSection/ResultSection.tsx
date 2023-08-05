import Link from '@docusaurus/Link';
import { ArrowRightAlt, AutoGraph, TableView } from '@mui/icons-material';
import { TabContext, TabPanel } from '@mui/lab';
import { Box, Divider, Portal, Stack, styled, ToggleButton, ToggleButtonGroup, Typography, useEventCallback } from '@mui/material';
import { ChartResult, Question, QuestionStatus } from '@site/src/api/explorer';
import Anchor from '@site/src/components/Anchor';
import { Charts } from '@site/src/pages/explore/_components/charts';
import TableChart from '@site/src/pages/explore/_components/charts/TableChart';
import { useExploreContext } from '@site/src/pages/explore/_components/context';
import ErrorBlock from '@site/src/pages/explore/_components/ErrorBlock';
import Feedback from '@site/src/pages/explore/_components/Feedback';
import Info from '@site/src/pages/explore/_components/Info';
import { Prompts } from '@site/src/pages/explore/_components/Prompt';
import ErrorMessage from '@site/src/pages/explore/_components/ResultSection/ErrorMessage';
import ShowExecutionInfoButton from '@site/src/pages/explore/_components/ResultSection/ShowExecutionInfoButton';
import Section, { SectionProps, SectionStatus, SectionStatusIcon } from '@site/src/pages/explore/_components/Section';
import SummaryCard from '@site/src/pages/explore/_components/SummaryCard';
import TypewriterEffect from '@site/src/pages/explore/_components/TypewriterEffect';
import { QuestionLoadingPhase } from '@site/src/pages/explore/_components/useQuestion';
import { uniqueItems } from '@site/src/utils/generate';
import { isEmptyArray, isNonemptyString, isNullish, nonEmptyArray, notFalsy, notNullish } from '@site/src/utils/value';
import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { makeIssueTemplate } from '../issueTemplates';
import ShareButtons from '../ShareButtons';

const ENABLE_SUMMARY = false;

interface ResultSectionProps extends Pick<SectionProps, 'style' | 'className'> {
  question: Question | undefined;
  phase: QuestionLoadingPhase;
  error: unknown;
}

const ResultSection = forwardRef<HTMLElement, ResultSectionProps>(({ question, phase, error, ...props }, ref) => {
  const { search } = useExploreContext();
  const [controlsContainerRef, setControlsContainerRef] = useState<HTMLSpanElement | null>(null);

  const result = question?.result?.rows;

  const status: SectionStatus = useMemo(() => {
    switch (phase) {
      case QuestionLoadingPhase.CREATED:
      case QuestionLoadingPhase.QUEUEING:
      case QuestionLoadingPhase.EXECUTING:
        return SectionStatus.loading;
      case QuestionLoadingPhase.EXECUTE_FAILED:
      case QuestionLoadingPhase.VISUALIZE_FAILED:
      case QuestionLoadingPhase.UNKNOWN_ERROR:
        return SectionStatus.error;
      case QuestionLoadingPhase.READY:
      case QuestionLoadingPhase.SUMMARIZING:
        return SectionStatus.success;
      default:
        return SectionStatus.pending;
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
        return question?.status === 'cancel' ? 'Execution canceled' : 'Failed to execute SQL';
      case QuestionLoadingPhase.UNKNOWN_ERROR:
        return 'Unknown error';
      case QuestionLoadingPhase.VISUALIZE_FAILED:
      case QuestionLoadingPhase.READY:
      case QuestionLoadingPhase.SUMMARIZING:
        return (
          <>
            {`${question?.result?.rows.length ?? 'NaN'} rows in ${question?.spent ?? 'NaN'} seconds`}
            {renderEngines(question)}
            {renderExecutionPlan(question)}
          </>);
      default:
        return 'pending';
    }
  }, [question, phase]);

  const { url, title, hashtags } = useMemo(() => {
    if (isNullish(question)) {
      return {
        url: 'https://ossinsight.io/explore/',
        title: 'GitHub Data Explorer',
        hashtags: [],
      };
    }
    let url;
    const title = `${search} | OSSInsight GitHub Data Explorer`;
    const hashtags = uniqueItems(question.answerSummary?.hashtags ?? [], ['OpenSource', 'OpenAI', 'TiDBCloud']);
    if (isNonemptyString(question.id)) {
      url = `https://ossinsight.io/explore?id=${question.id}`;
    } else {
      url = 'https://ossinsight.io/explore/';
    }
    return { url, title, hashtags };
  }, [question, search]);

  const resultSectionError = useMemo(() => {
    if (status === 'error') {
      return error;
    }
  }, [status, error]);

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

  if (isNullish(question)) {
    return <section ref={ref} hidden />;
  }

  return (
    <Section
      ref={ref}
      {...props}
      header={
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap">
          <span>
            <SectionStatusIcon status={status} />
            {resultTitle}
          </span>
          {status !== SectionStatus.error && <ControlsContainer>
            <span ref={setControlsContainerRef} />
            <ShareButtons url={url} title={title} summary={question?.answerSummary?.content} hashtags={hashtags} />
          </ControlsContainer>}
        </Stack>
      }
      error={resultSectionError}
      errorIn={notFalsy(resultSectionError)}
      errorMessage={<ErrorMessage />}
      issueTemplate={question?.errorType ?? undefined}
    >
      {ENABLE_SUMMARY && (notNullish(question?.answerSummary) || question?.status === QuestionStatus.Summarizing) && (
        <SummaryCard loading={question?.status === QuestionStatus.Summarizing}>
          <TypewriterEffect content={summaryContent} maxContinuous={2} avgInterval={40} />
        </SummaryCard>
      )}
      {phase === QuestionLoadingPhase.QUEUEING && <PromptsTitle source={question?.queuePreceding === 0 ? QUEUE_ALMOST_PROMPT_TITLES : QUEUE_PROMPT_TITLES} interval={5000} />}
      {phase === QuestionLoadingPhase.EXECUTING && <PromptsTitle source={RUNNING_PROMPT_TITLES} interval={3000} />}
      <Chart question={question} chartData={question?.chart ?? undefined} chartError={chartError} result={result} fields={question?.result?.fields} controlsContainer={controlsContainerRef} />
      <Box height="16px" />
    </Section>
  );
});

export default ResultSection;

const TidbLogo = styled('img')`
  height: 18px;
  vertical-align: text-bottom;
  margin-right: 4px;
`;

function renderEngines (question: Question | undefined) {
  if (notNullish(question) && !isEmptyArray(question.engines)) {
    return (
      <>
        . Running on&nbsp;
        <EngineTag>
          <TidbLogo src="/img/tidb-cloud-logo-t.svg" alt="TiDB" />
          {question.engines.map(replaceEngineName).join(', ')}
        </EngineTag>
        <Info>
          TiDB&apos;s optimizer selects the engine for all queries on its single service:
          <ul>
            <li><Link href="https://docs.pingcap.com/tidb/stable/tiflash-overview/?utm_source=ossinsight&utm_medium=referral&utm_campaign=chat2query_202301" target="_blank" rel="noopener"> The columnar engine </Link>for complex and heavy OLAP queries.</li>
            <li><Link href="https://docs.pingcap.com/tidb/stable/tikv-overview/?utm_source=ossinsight&utm_medium=referral&utm_campaign=chat2query_202301" target="_blank" rel="noopener"> The row-based engine </Link>for low-latency high-concurrency OLTP queries.</li>
          </ul>
        </Info>
      </>
    );
  }
  return null;
}

function renderExecutionPlan (question: Question | undefined) {
  if (notNullish(question) && !isEmptyArray(question.plan)) {
    return (
      <ShowExecutionInfoButton question={question}>
        Explain SQL <ArrowRightAlt />
      </ShowExecutionInfoButton>
    );
  }
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

function Chart ({ question, chartData, chartError, fields, result, controlsContainer }: { question: Question | undefined, chartData: ChartResult | undefined, chartError: unknown, result: Array<Record<string, any>> | undefined, fields: Array<{ name: string }> | undefined, controlsContainer: HTMLSpanElement | null }) {
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
    const renderError = (margin = false, recommend = false) => {
      return (
        <ErrorBlock
          severity="warning"
          sx={margin ? { mb: 2 } : undefined}
        >
          <Typography variant="body1">
            Oh no, visualization didn&apos;t work.
            <br />
            You can still check your results using the table.
          </Typography>
        </ErrorBlock>
      );
    };

    if (isNullish(question)) {
      return null;
    }

    const issueTemplate = makeIssueTemplate(question);

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
            🤔 Not exactly what you&apos;re looking for? Check out our <Anchor anchor="data-explorer-faq">FAQ</Anchor> for help. If the problem persists, please <Link href={issueTemplate()} target="_blank" rel="noopener">report an issue</Link> to us.
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
  }, [tab, chartData, chartError, result, fields, controlsContainer]);
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
