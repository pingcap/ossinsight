import { FINAL_PHASES, QuestionLoadingPhase, QuestionManagementContext, useQuestionManagementValues } from '@site/src/pages/explore/_components/useQuestion';
import useUrlSearchState, { nullableStringParam } from '@site/src/hooks/url-search-state';
import React, { useEffect, useRef, useState } from 'react';
import { isBlankString, isNullish, notNullish } from '@site/src/utils/value';
import { Box, Container, styled, useEventCallback } from '@mui/material';
import { ExploreContext } from '@site/src/pages/explore/_components/context';
import { Decorators } from '@site/src/pages/explore/_components/Decorators';
import Layout from '@site/src/pages/explore/_components/Layout';
import Header from '@site/src/pages/explore/_components/Header';
import ExploreSearch from '@site/src/pages/explore/_components/Search';
import SwitchLayout from '@site/src/pages/explore/_components/SwitchLayout';
import Execution from '@site/src/pages/explore/_components/Execution';
import Recommends from '@site/src/pages/explore/_components/Recommends';
import Faq from '@site/src/pages/explore/_components/Faq';
import Side from '@site/src/pages/explore/_components/Side';
import PoweredBy from '@site/src/pages/explore/_components/PoweredBy';
import Link from '@docusaurus/Link';
import { ArrowRightAlt } from '@mui/icons-material';
import Tips, { TipsRef } from '@site/src/pages/explore/_components/Tips';

export default function Questions () {
  const { question, loading, load, error, phase, reset, create } = useQuestionManagementValues({ pollInterval: 2000 });
  const [questionId, setQuestionId] = useUrlSearchState('id', nullableStringParam(), true);
  const [value, setValue] = useState('');
  const tipsRef = useRef<TipsRef>(null);

  const isPending = !FINAL_PHASES.has(phase);
  const disableAction = isPending || isBlankString(value);
  const hideExecution = isNullish(question?.id) && !loading;
  const hasResult = (question?.result?.rows.length ?? 0) > 0;

  useEffect(() => {
    if (notNullish(question)) {
      setValue(question.title);
    }
  }, [question?.title]);

  // reload or clear only if browser history changed the question id.
  useEffect(() => {
    if (notNullish(questionId)) {
      load(questionId);
    } else {
      handleClear();
    }
  }, [questionId]);

  // when question API was finished, set new question id
  useEffect(() => {
    if (notNullish(question?.id)) {
      setQuestionId(question?.id);
    }
  }, [loading, question?.id]);

  const handleAction = useEventCallback(() => {
    if (isPending) {
      return;
    }
    create(value);
  });

  const handleClear = useEventCallback(() => {
    reset();
    setValue('');
    setQuestionId(undefined);
  });

  const handleSelect = useEventCallback((title: string) => {
    setValue(title);
    create(title);
  });

  const showTips = useEventCallback(() => {
    tipsRef.current?.show();
  });

  const showSide = !hideExecution && (phase === QuestionLoadingPhase.READY || phase === QuestionLoadingPhase.SUMMARIZING) && hasResult;

  return (
    <QuestionManagementContext.Provider value={{ phase, question, loading, error, create, load, reset }}>
      <ExploreContext.Provider value={{ search: value, handleSelect, showTips }}>
        <Decorators />
        <Layout
          showSide={showSide}
          showHeader={hideExecution}
          showFooter={hideExecution}
          header={<Header />}
          side={<Side />}
          footer={(
            <Box mt={2}>
              <PoweredBy align="center" />
              <StyledLink to="/blog/chat2query-tutorials" target="_blank">
                🧐 GitHub data is just the beginning. Uncover hidden insights in your OWN data!
                <ArrowRightAlt fontSize="inherit" sx={{ verticalAlign: 'text-bottom', ml: 0.5 }} />
              </StyledLink>
            </Box>
          )}
        >
          <ExploreSearch value={value} onChange={setValue} onAction={handleAction} disableInput={isPending} disableClear={value === ''} disableAction={disableAction} onClear={handleClear} clearState={isPending ? 'stop' : undefined} />
          <SwitchLayout state={hideExecution ? 'recommend' : 'execution'} direction={hideExecution ? 'down' : 'up'}>
            <Box key="execution" sx={{ mt: 1.5 }}>
              <Execution search={value} />
            </Box>
            <Box key="recommend" sx={{ mt: 4 }}>
              <Recommends />
            </Box>
          </SwitchLayout>
        </Layout>
        <Container maxWidth="lg" sx={{ pb: 8 }}>
          <Faq />
        </Container>
        <Tips ref={tipsRef} />
      </ExploreContext.Provider>
    </QuestionManagementContext.Provider>
  );
}

const StyledLink = styled(Link)`
  display: block;
  text-align: center;
  color: white !important;
  text-decoration: none !important;
  margin-top: 20px;
  font-size: 16px;
`;
