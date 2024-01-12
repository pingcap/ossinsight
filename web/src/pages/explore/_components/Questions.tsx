import { isEmptyResult, QuestionLoadingPhase, QuestionManagementContext, useQuestionManagementValues } from '@site/src/pages/explore/_components/useQuestion';
import useUrlSearchState, { nullableStringParam } from '@site/src/hooks/url-search-state';
import React, { SetStateAction, useEffect, useMemo, useState } from 'react';
import { isBlankString, isNullish, notNullish } from '@site/src/utils/value';
import { useEventCallback } from '@mui/material';
import { ExploreContext } from '@site/src/pages/explore/_components/context';
import { Decorators } from '@site/src/pages/explore/_components/Decorators';
import Layout from '@site/src/pages/explore/_components/Layout';
import Header from '@site/src/pages/explore/_components/Header';
import ExploreSearch from '@site/src/pages/explore/_components/Search';
import Faq from '@site/src/pages/explore/_components/Faq';
import Side from '@site/src/pages/explore/_components/Side';
import ExploreMain from '@site/src/pages/explore/_components/ExploreMain';

export default function Questions () {
  const [search, setSearch] = useState('');
  const { questionId, handleClear, handleAction, handleSelect, handleSelectId, questionValues } = useAutoRouteQuestion([search, setSearch]);
  const { question, loading, phase, isResultPending } = questionValues;

  // computed status
  const disableAction = isResultPending || isBlankString(search);
  const disableClear = search === '';
  const hideExecution = isNullish(question?.id) && isNullish(questionId) && !loading && phase !== QuestionLoadingPhase.CREATE_FAILED;
  const showSide = !hideExecution;
  const showSideAds = useMemo(() => {
    if (phase === QuestionLoadingPhase.CREATE_FAILED ||
      phase === QuestionLoadingPhase.EXECUTE_FAILED ||
      phase === QuestionLoadingPhase.VALIDATE_SQL_FAILED ||
      phase === QuestionLoadingPhase.GENERATE_SQL_FAILED
    ) {
      return false;
    }
    if (notNullish(question)) {
      return !isEmptyResult(question);
    }
    return true;
  }, [phase, question]);

  return (
    <QuestionManagementContext.Provider value={questionValues}>
      <ExploreContext.Provider value={{ search, handleSelect, handleSelectId }}>
        <Decorators />
        <Layout
          showSide={showSide}
          showHeader={hideExecution}
          header={<Header />}
          side={(headerHeight) => <Side headerHeight={headerHeight} showAds={showSideAds} />}
        >
          <ExploreSearch
            value={search}
            onChange={setSearch}
            onAction={handleAction}
            disableInput={isResultPending}
            disableClear={disableClear}
            disableAction={disableAction}
            onClear={handleClear}
            clearState={isResultPending ? 'stop' : undefined}
          />
          <ExploreMain
            state={hideExecution ? 'recommend' : 'execution'}
          />
        </Layout>
        <Faq />
      </ExploreContext.Provider>
    </QuestionManagementContext.Provider>
  );
}

function useAutoRouteQuestion ([search, setSearch]: [search: string, setSearch: (search: SetStateAction<string>) => void]) {
  const questionValues = useQuestionManagementValues({ pollInterval: 2000 });
  const [questionId, setQuestionId] = useUrlSearchState('id', nullableStringParam(), true);

  const { question, loading, load, reset, create, isResultPending } = questionValues;

  useEffect(() => {
    if (notNullish(question)) {
      setSearch(question.title);
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

  const handleAction = useEventCallback((ignoreCache: boolean) => {
    if (isResultPending) {
      return;
    }
    create(search, ignoreCache);
  });

  const handleClear = useEventCallback(() => {
    reset();
    setSearch('');
    setQuestionId(undefined);
  });

  const handleSelect = useEventCallback((title: string) => {
    setSearch(title);
    create(title, false);
  });

  const handleSelectId = useEventCallback((id: string, title?: string) => {
    if (questionId !== id) {
      setSearch(title ?? '');
      load(id);
    }
  });

  return {
    questionValues,
    handleClear,
    handleAction,
    handleSelect,
    handleSelectId,
    questionId,
  };
}
