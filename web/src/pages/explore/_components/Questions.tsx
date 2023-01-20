import { FINAL_PHASES, QuestionLoadingPhase, QuestionManagementContext, useQuestionManagementValues } from '@site/src/pages/explore/_components/useQuestion';
import useUrlSearchState, { nullableStringParam } from '@site/src/hooks/url-search-state';
import React, { useEffect, useRef, useState } from 'react';
import { isBlankString, isNullish, notNullish } from '@site/src/utils/value';
import { Box, NoSsr, styled, useEventCallback } from '@mui/material';
import { ExploreContext } from '@site/src/pages/explore/_components/context';
import { Decorators } from '@site/src/pages/explore/_components/Decorators';
import Layout from '@site/src/pages/explore/_components/Layout';
import Header from '@site/src/pages/explore/_components/Header';
import ExploreSearch from '@site/src/pages/explore/_components/Search';
import SwitchLayout from '@site/src/pages/explore/_components/SwitchLayout';
import Execution from '@site/src/pages/explore/_components/Execution';
import Faq from '@site/src/pages/explore/_components/Faq';
import Side from '@site/src/pages/explore/_components/Side';
import Tips, { TipsRef } from '@site/src/pages/explore/_components/Tips';
import RecommendList from '@site/src/pages/explore/_components/RecommendList';
import { Prompts } from '@site/src/pages/explore/_components/Prompt';

export default function Questions () {
  const { question, loading, load, error, phase, reset, create } = useQuestionManagementValues({ pollInterval: 2000 });
  const [questionId, setQuestionId] = useUrlSearchState('id', nullableStringParam(), true);
  const [value, setValue] = useState('');
  const tipsRef = useRef<TipsRef>(null);

  const isPending = !FINAL_PHASES.has(phase);
  const disableAction = isPending || isBlankString(value);
  const hideExecution = isNullish(question?.id) && !loading && phase !== QuestionLoadingPhase.CREATE_FAILED && isNullish(questionId);
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

  const handleSelectId = useEventCallback((id: string, title?: string) => {
    if (questionId !== id) {
      setValue(title ?? '');
      load(id);
    }
  });

  const showTips = useEventCallback(() => {
    tipsRef.current?.show();
  });

  const showSide = !hideExecution && (phase === QuestionLoadingPhase.READY || phase === QuestionLoadingPhase.SUMMARIZING) && hasResult;

  return (
    <QuestionManagementContext.Provider value={{ phase, question, loading, error, create, load, reset }}>
      <ExploreContext.Provider value={{ search: value, handleSelect, handleSelectId, showTips }}>
        <Decorators />
        <Layout
          showSide={showSide}
          showHeader={hideExecution}
          showFooter={hideExecution}
          header={<Header />}
          side={<Side />}
        >
          <SwitchLayout state={hideExecution ? 'recommend' : 'execution'} direction={hideExecution ? 'down' : 'up'}>
            <Box key="recommend" />
            <PromptsTitle key="execution" source={prompts} interval={4000} prefix={<span><b>📌 Tips:</b></span>} />
          </SwitchLayout>
          <ExploreSearch value={value} onChange={setValue} onAction={handleAction} disableInput={isPending} disableClear={value === ''} disableAction={disableAction} onClear={handleClear} clearState={isPending ? 'stop' : undefined} />
          <SwitchLayout state={hideExecution ? 'recommend' : 'execution'} direction={hideExecution ? 'down' : 'up'}>
            <Box key="execution" sx={{ mt: 1.5 }}>
              <NoSsr>
                <Execution search={value} />
              </NoSsr>
            </Box>
            <Box key="recommend" sx={{ mt: 4 }}>
              <RecommendList />
            </Box>
          </SwitchLayout>
        </Layout>
        <Faq />
        <Tips ref={tipsRef} />
      </ExploreContext.Provider>
    </QuestionManagementContext.Provider>
  );
}

const prompts = [
  'Use a GitHub username instead of a nickname.',
  'Use a GitHub repository\'s full name. For example, change "react" to "facebook/react."',
  'Use GitHub terms like fork, star, and watch.',
  'Use specific phrases. For example, use "by star" or "by fork" to measure repo popularity.',
  'Add your requirement for the result. For example, "group by language."',
];

const PromptsTitle = styled(Prompts)`
  color: #9B9B9B;
  font-style: italic;
  font-size: 12px;
  margin-bottom: 8px;
`;
