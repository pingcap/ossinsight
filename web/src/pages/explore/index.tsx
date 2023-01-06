import CustomPage from '@site/src/theme/CustomPage';
import React, { useEffect, useRef, useState } from 'react';
import ExploreSearch, { useStateRef } from '@site/src/pages/explore/_components/Search';
import { Box, Container, Divider, IconButton, Typography, useEventCallback } from '@mui/material';
import Execution, { ExecutionContext } from '@site/src/pages/explore/_components/Execution';
import { isBlankString, isNullish } from '@site/src/utils/value';
import { PresetSuggestions, RecommendedSuggestions } from '@site/src/pages/explore/_components/Suggestions';
import Faq from '@site/src/pages/explore/_components/Faq';
import { useExperimental } from '@site/src/components/Experimental';
import NotFound from '@theme/NotFound';
import useForceUpdate from '@site/src/hooks/force-update';
import useUrlSearchState, { nullableStringParam } from '@site/src/hooks/url-search-state';
import { Question } from '@site/src/api/explorer';
import ExploreContext from '@site/src/pages/explore/_components/context';
import Header from '@site/src/pages/explore/_components/Header';
import Layout from './_components/Layout';
import { Decorators } from '@site/src/pages/explore/_components/Decorators';
import { Cached } from '@mui/icons-material';
import { HighlightCard } from '@site/src/pages/explore/_components/QuestionCard';

export default function Page () {
  const [questionId, setQuestionId] = useUrlSearchState('id', nullableStringParam(), true);
  const [value, setValue, valueRef] = useStateRef('');
  const [hasResult, setHasResult] = useState(false);
  const [ec, setEc] = useState<ExecutionContext | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [question, setQuestion] = useState<Question>();
  const [recommend, setRecommend] = useState(false);
  const loadingState = useRef({ loading: false, resultLoading: false, chartLoading: false });
  const forceUpdate = useForceUpdate();

  const [enabled] = useExperimental('explore-data');

  const loading = loadingState.current.resultLoading || loadingState.current.loading || loadingState.current.chartLoading;
  const disableAction = loading || isBlankString(value);

  useEffect(() => {
    if (isNullish(questionId)) {
      setValue('');
    } else {
      ec?.load(questionId);
    }
  }, [questionId]);

  const handleQuestionChange = useEventCallback((question: Question) => {
    setQuestionId(question.id);
    setValue(question.title);
    setSuggestions(question.recommendedQuestions ?? []);
    setQuestion(question);
  });

  const handleAction = useEventCallback(() => {
    if (loadingState.current.resultLoading || loadingState.current.loading || loadingState.current.chartLoading) {
      return;
    }
    ec?.run(valueRef.current);
  });

  const handleClear = useEventCallback(() => {
    setQuestionId(undefined);
    setValue('');
  });

  const handleLoading = useEventCallback((loading: boolean) => {
    if (loadingState.current.loading !== loading) {
      loadingState.current.loading = loading;
      forceUpdate();
    }
  });

  const handleResultLoading = useEventCallback((loading: boolean) => {
    if (loadingState.current.resultLoading !== loading) {
      loadingState.current.resultLoading = loading;
      forceUpdate();
    }
  });

  const handleChartLoading = useEventCallback((loading: boolean) => {
    if (loadingState.current.chartLoading !== loading) {
      loadingState.current.chartLoading = loading;
      forceUpdate();
    }
  });

  const hideExecution = isNullish(questionId) && !loading;

  if (!enabled) {
    return <NotFound />;
  }

  return (
    <>
      <Decorators />
      <CustomPage>
        <ExploreContext.Provider value={{ questionId, question, executionContext: ec, setQuestion: setValue }}>
          <Container maxWidth="xl" sx={{ pt: 4 }}>
            <Layout
              showSide={!hideExecution && hasResult}
              showHeader={hideExecution}
              header={<Header />}
              side={(
                <>
                  <Typography variant="h3" mb={2} fontSize={18}>🔥 Try other questions</Typography>
                  <PresetSuggestions disabled={loading} questions={suggestions} n={5} variant="text" />
                </>
              )}
            >
              <ExploreSearch value={value} onChange={setValue} onAction={handleAction} disableInput={loading} disableClear={value === ''} disableAction={disableAction} onClear={handleClear} clearState={loading ? 'stop' : undefined} />
              <Box sx={{ pb: 8, mt: 1.5, display: hideExecution ? 'none' : undefined }}>
                <Execution ref={setEc} questionId={questionId} search={value} onLoading={handleLoading} onResultLoading={handleResultLoading} onChartLoading={handleChartLoading} onQuestionChange={handleQuestionChange} onFinished={setHasResult} />
              </Box>
              {hideExecution && (
                <>
                  {recommend
                    ? (
                    <RecommendedSuggestions
                      title={(reload, loading) => (
                        <Box mt={2} height="40px">
                          🤖️ AI-generated questions: 3 random ones for you <IconButton onClick={reload} disabled={loading}><Cached /></IconButton>
                        </Box>
                      )}
                      aiGenerated
                      n={3}
                    />
                      )
                    : <HighlightCard onClick={() => setRecommend(true)} />}
                  <Divider orientation="horizontal" light sx={{ my: 3, backgroundColor: 'transparent' }} />
                  <RecommendedSuggestions
                    title={() => (
                      <Box height="40px">
                        🔥 Popular queries
                      </Box>
                    )}
                    n={9}
                  />
                </>
              )}
            </Layout>
          </Container>
          <Container maxWidth="lg" sx={{ pb: 8 }}>
            <Faq />
          </Container>
        </ExploreContext.Provider>
      </CustomPage>
    </>
  );
}
