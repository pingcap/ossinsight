import CustomPage from '@site/src/theme/CustomPage';
import React, { useEffect, useRef } from 'react';
import ExploreSearch, { useStateRef } from '@site/src/pages/explore/_components/Search';
import { Box, Container, Typography, useEventCallback, useMediaQuery, useTheme } from '@mui/material';
import Execution, { ExecutionContext } from '@site/src/pages/explore/_components/Execution';
import { isFalsy, isNullish } from '@site/src/utils/value';
import Suggestions from '@site/src/pages/explore/_components/Suggestions';
import Faq from '@site/src/pages/explore/_components/Faq';
import { useExperimental } from '@site/src/components/Experimental';
import NotFound from '@theme/NotFound';
import useForceUpdate from '@site/src/hooks/force-update';
import useUrlSearchState, { nullableStringParam } from '@site/src/hooks/url-search-state';
import { Question } from '@site/src/api/explorer';
import ExploreContext from '@site/src/pages/explore/_components/context';
import Header from '@site/src/pages/explore/_components/Header';
import Layout from './_components/Layout';

export default function Page () {
  const [questionId, setQuestionId] = useUrlSearchState('id', nullableStringParam(), true);
  const [value, setValue, valueRef] = useStateRef('');
  const [ec, setEc, ecRef] = useStateRef<ExecutionContext | null>(null);
  const loadingState = useRef({ loading: false, resultLoading: false, chartLoading: false });
  const forceUpdate = useForceUpdate();

  const [enabled] = useExperimental('explore-data');

  const loading = loadingState.current.resultLoading || loadingState.current.loading || loadingState.current.chartLoading;

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
  });

  const handleSelect = useEventCallback((question: string) => {
    ecRef.current?.clear();
    ecRef.current?.run(question);
    setValue(question);
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

  const hideExecution = isFalsy(value) && !isNullish(value) && isNullish(questionId);

  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down('sm'));

  if (!enabled) {
    return <NotFound />;
  }

  return (
    <CustomPage>
      <ExploreContext.Provider value={{ questionId }}>
        <Container maxWidth="xl" sx={{ pt: 4 }}>
          <Layout
            showSide={!hideExecution}
            showHeader={hideExecution}
            header={<Header />}
            side={(
              <>
                <Typography variant="h3" mx={4} mb={2} fontSize={18}>🔥 Try other questions</Typography>
                <Suggestions onSelect={handleSelect} dense disabled={loading} />
              </>
            )}
          >
            <ExploreSearch value={value} onChange={setValue} onAction={handleAction} disableInput={loading} disableClear={value === ''} disableAction={loading} onClear={handleClear} clearState={loading ? 'stop' : undefined} />
            <Box sx={{ pb: 8, mt: 4, display: hideExecution ? 'none' : undefined }}>
              <Execution ref={setEc} questionId={questionId} search={value} onLoading={handleLoading} onResultLoading={handleResultLoading} onChartLoading={handleChartLoading} onQuestionChange={handleQuestionChange} />
            </Box>
            {hideExecution && (
              <Suggestions onSelect={handleSelect} dense={isSm} />
            )}
          </Layout>
        </Container>
        <Container maxWidth="lg" sx={{ pb: 8 }}>
          <Faq />
        </Container>
      </ExploreContext.Provider>
    </CustomPage>
  );
}
