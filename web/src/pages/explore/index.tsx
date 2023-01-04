import CustomPage from '@site/src/theme/CustomPage';
import React, { useEffect, useRef } from 'react';
import ExploreSearch, { useStateRef } from '@site/src/pages/explore/_components/Search';
import { Container, Grid, styled, Typography, useEventCallback, useMediaQuery, useTheme } from '@mui/material';
import Execution, { ExecutionContext } from '@site/src/pages/explore/_components/Execution';
import { isFalsy, isNullish } from '@site/src/utils/value';
import Suggestions from '@site/src/pages/explore/_components/Suggestions';
import Faq from '@site/src/pages/explore/_components/Faq';
import Beta from './_components/beta.svg';
import { useExperimental } from '@site/src/components/Experimental';
import NotFound from '@theme/NotFound';
import useForceUpdate from '@site/src/hooks/force-update';
import useUrlSearchState, { nullableStringParam } from '@site/src/hooks/url-search-state';
import { Question } from '@site/src/api/explorer';

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
      <Container maxWidth="xl" sx={{ pt: 8 }}>
        <Typography variant="h1" textAlign="center">
          Data Explorer
          <StyledBeta />
        </Typography>
        <Typography variant="body2" textAlign="center" mt={1} mb={2} color="#7C7C7C">Analyze 5+ billion GitHub data from natural language, no prerequisite knowledge of SQL or plotting libraries necessary.</Typography>
        <ExploreSearch value={value} onChange={setValue} onAction={handleAction} disableInput={loading} disableClear={value === ''} disableAction={loading} onClear={handleClear} clearState={loading ? 'stop' : undefined} />
      </Container>
      <Container maxWidth="xl" sx={{ pb: 8, display: hideExecution ? 'none' : undefined }}>
        <Grid container>
          <Grid item xs={12} md={9} lg={8}>
            <Execution ref={setEc} onLoading={handleLoading} onResultLoading={handleResultLoading} onChartLoading={handleChartLoading} questionId={questionId} onQuestionChange={handleQuestionChange} />
          </Grid>
          <Grid item xs={0} md={3} lg={4} sx={theme => ({ [theme.breakpoints.down('sm')]: { display: 'none' } })}>
            <Typography variant="h5" mx={4} my={2}>🔥 Try other questions</Typography>
            <Suggestions onSelect={handleSelect} dense disabled={loading} />
          </Grid>
        </Grid>
      </Container>
      {hideExecution && (
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Suggestions onSelect={handleSelect} dense={isSm} />
        </Container>
      )}
      <Container maxWidth="lg" sx={{ pb: 8 }}>
        <Faq />
      </Container>
    </CustomPage>
  );
}

const StyledBeta = styled(Beta)`
  margin-left: 8px;
`;
