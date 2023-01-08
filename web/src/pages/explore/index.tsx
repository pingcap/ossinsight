import CustomPage from '@site/src/theme/CustomPage';
import React, { useEffect, useState } from 'react';
import ExploreSearch from '@site/src/pages/explore/_components/Search';
import { Box, Container, Typography, useEventCallback } from '@mui/material';
import Execution from '@site/src/pages/explore/_components/Execution';
import { isBlankString, isNullish, notNullish } from '@site/src/utils/value';
import { PresetSuggestions } from '@site/src/pages/explore/_components/Suggestions';
import Faq from '@site/src/pages/explore/_components/Faq';
import { useExperimental } from '@site/src/components/Experimental';
import NotFound from '@theme/NotFound';
import useUrlSearchState, { nullableStringParam } from '@site/src/hooks/url-search-state';
import Header from '@site/src/pages/explore/_components/Header';
import Layout from './_components/Layout';
import { Decorators } from '@site/src/pages/explore/_components/Decorators';
import { FINAL_PHASES, QuestionLoadingPhase, QuestionManagementContext, useQuestionManagementValues } from '@site/src/pages/explore/_components/useQuestion';
import { SuggestionsContext } from '@site/src/pages/explore/_components/context';
import Recommends from '@site/src/pages/explore/_components/Recommends';
import SwitchLayout from '@site/src/pages/explore/_components/SwitchLayout';

export default function Page () {
  const { question, loading, load, error, phase, reset, create } = useQuestionManagementValues({ pollInterval: 2000 });
  const [questionId, setQuestionId] = useUrlSearchState('id', nullableStringParam(), true);
  const [value, setValue] = useState('');

  const [enabled] = useExperimental('explore-data');

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

  if (!enabled) {
    return <NotFound />;
  }

  return (
    <QuestionManagementContext.Provider value={{ phase, question, loading, error, create, load, reset }}>
      <SuggestionsContext.Provider value={{ handleSelect }}>
        <Decorators />
        <CustomPage
          title="Data Explorer: Open Source Explorer powered by TiDB Cloud"
          description="The ultimate query tool for accessing and analyzing data on GitHub. Analyze 5+ billion GitHub data from natural language, no prerequisite knowledge of SQL or plotting libraries necessary."
          keywords="GitHub data,text to SQL,query tool,Data Explorer"
          image="/img/data-thumbnail.png"
        >
          <Container maxWidth="xl" sx={{ pt: 4 }}>
            <Layout
              showSide={!hideExecution && phase === QuestionLoadingPhase.READY && hasResult}
              showHeader={hideExecution}
              header={<Header />}
              side={(
                <>
                  <Typography variant="h3" mb={2} fontSize={18}>💡 Get inspired</Typography>
                  <PresetSuggestions disabled={isPending} questions={question?.recommendedQuestions ?? []} n={5} variant="text" />
                </>
              )}
            >
              <ExploreSearch value={value} onChange={setValue} onAction={handleAction} disableInput={isPending} disableClear={value === ''} disableAction={disableAction} onClear={handleClear} clearState={isPending ? 'stop' : undefined} />
              <SwitchLayout state={hideExecution ? 'recommend' : 'execution'} direction={hideExecution ? 'down' : 'up'}>
                <Box key="execution" sx={{ pb: 8, mt: 1.5 }}>
                  <Execution search={value} />
                </Box>
                <Recommends key="recommend" />
              </SwitchLayout>
            </Layout>
          </Container>
          <Container maxWidth="lg" sx={{ pb: 8 }}>
            <Faq />
          </Container>
        </CustomPage>
      </SuggestionsContext.Provider>
    </QuestionManagementContext.Provider>
  );
}
