import CustomPage from '@site/src/theme/CustomPage';
import React, { useRef, useState } from 'react';
import ExploreSearch from '@site/src/pages/explore/_components/Search';
import { Box, Container, styled, Typography, useEventCallback } from '@mui/material';
import Execution, { ExecutionContext } from '@site/src/pages/explore/_components/Execution';
import { notFalsy } from '@site/src/utils/value';
import Suggestions from '@site/src/pages/explore/_components/Suggestions';
import Faq from '@site/src/pages/explore/_components/Faq';
import Beta from './_components/beta.svg';
import { useExperimental } from '@site/src/components/Experimental';
import NotFound from '@theme/NotFound';
import useForceUpdate from '@site/src/hooks/force-update';

export default function Page () {
  const [value, setValue] = useState('');
  const [ec, setEc] = useState<ExecutionContext | null>(null);
  const loadingState = useRef({ loading: false, resultLoading: false, chartLoading: false });
  const forceUpdate = useForceUpdate();

  const [enabled] = useExperimental('explore-data');

  const actionDisabled = loadingState.current.resultLoading || loadingState.current.loading || loadingState.current.chartLoading;

  const handleAction = useEventCallback(() => {
    if (loadingState.current.resultLoading || loadingState.current.loading || loadingState.current.chartLoading) {
      return;
    }
    ec?.run();
  });

  const handleClear = useEventCallback(() => {
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

  if (!enabled) {
    return <NotFound />;
  }

  return (
    <CustomPage>
      <Container maxWidth="lg" sx={{ pt: 8 }}>
        <Typography variant="h1" textAlign="center">
          Data Explorer
          <StyledBeta />
        </Typography>
        <Typography variant="body2" textAlign="center" mt={1} mb={2} color="#7C7C7C">Quickly get insights from your GitHub data with our easy-to-use Query Tool.</Typography>
        <ExploreSearch value={value} onChange={setValue} onAction={handleAction} disableInput={actionDisabled} disableClear={value === ''} disableAction={actionDisabled} onClear={handleClear} clearState={actionDisabled ? 'stop' : undefined} />
      </Container>
      {notFalsy(value)
        ? (
          <Container maxWidth="lg" sx={{ pb: 8 }}>
            <Execution search={value} ref={setEc} onLoading={handleLoading} onResultLoading={handleResultLoading} onChartLoading={handleChartLoading} />
          </Container>
          )
        : (
          <Box py={4}>
            <Suggestions onSelect={setValue} />
          </Box>
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
