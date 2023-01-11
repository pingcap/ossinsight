import { notFalsy, notNullish } from '@site/src/utils/value';
import CodeBlock from '@theme/CodeBlock';
import Section from '@site/src/pages/explore/_components/Section';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { format } from 'sql-formatter';
import useQuestionManagement, { QuestionLoadingPhase } from '@site/src/pages/explore/_components/useQuestion';
import { AxiosError } from 'axios';
import { isAxiosError } from '@site/src/utils/error';
import { useStateRef } from '@site/src/pages/explore/_components/Search';
import { useInterval } from 'ahooks';
import { randomOf } from '@site/src/utils/generate';

export default function SqlSection () {
  const { question, error, phase } = useQuestionManagement();

  const formattedSql = useMemo(() => {
    try {
      if (notNullish(question)) {
        return format(question.querySQL, { language: 'mysql' });
      }
      if (isSqlError(error)) {
        return format(error.response?.data.querySQL ?? '', { language: 'mysql' });
      }
    } catch (e) {
      return question?.querySQL ?? '';
    }
  }, [question, error]);

  const sqlSectionStatus = useMemo(() => {
    switch (phase) {
      case QuestionLoadingPhase.NONE:
        return 'pending';
      case QuestionLoadingPhase.LOADING:
      case QuestionLoadingPhase.CREATING:
      case QuestionLoadingPhase.GENERATING_SQL:
        return 'loading';
      case QuestionLoadingPhase.GENERATE_SQL_FAILED:
      case QuestionLoadingPhase.LOAD_FAILED:
      case QuestionLoadingPhase.CREATE_FAILED:
        return 'error';
      default:
        return 'success';
    }
  }, [phase]);

  const sqlTitle = useMemo(() => {
    switch (phase) {
      case QuestionLoadingPhase.NONE:
        return '';
      case QuestionLoadingPhase.LOADING:
        return 'Loading question...';
      case QuestionLoadingPhase.CREATING:
        return 'Creating question...';
      case QuestionLoadingPhase.GENERATING_SQL:
        return <GeneratingSqlPrompts />;
      case QuestionLoadingPhase.LOAD_FAILED:
        return 'Question not found';
      case QuestionLoadingPhase.GENERATE_SQL_FAILED:
      case QuestionLoadingPhase.CREATE_FAILED:
        return 'Failed to generate SQL';
      default:
        return 'Generated SQL';
    }
  }, [phase]);

  const sqlSectionError = useMemo(() => {
    if (sqlSectionStatus === 'error') {
      return error;
    }
  }, [sqlSectionStatus, error]);

  const showBot = phase === QuestionLoadingPhase.CREATED || phase === QuestionLoadingPhase.GENERATING_SQL;

  return (
    <Section
      status={sqlSectionStatus}
      title={sqlTitle}
      icon={showBot ? 'bot' : 'default'}
      extra="auto"
      error={sqlSectionError}
      errorWithChildren
      errorTitle="Failed to generate SQL"
      errorPrompt="Hi, it's failed to generate SQL for"
    >
      {notFalsy(formattedSql) && (
        <CodeBlock language="sql">
          {formattedSql}
        </CodeBlock>
      )}
    </Section>
  );
}

function isSqlError (error: unknown): error is AxiosError<{ message: string, querySQL: string }> {
  if (isAxiosError(error) && notNullish(error.response)) {
    if (notNullish(error.response.data)) {
      return typeof error.response.data.message === 'string' && typeof error.response.data.querySQL === 'string';
    }
  }
  return false;
}

const generatingSQLPrompts: string[][] = [
  ['Great question!', 'Interesting question!', 'Awesome question!', 'You asked a winner!'],
  ['Thinking...', 'Brain busting!', 'Creating SQL...'],
  ['Tough, but still trying...', 'Hard, but persevering.', 'Tough, but forging ahead...', 'Challenging, but still striving...', 'Struggling, but pushing on...'],
  ['Mastering the art of turning words into SQL magic…', 'Gaining knowledge from your input...', 'Learning from your question...', 'Getting smarter with your input...'],
  ['Making every effort!', 'Working my hardest', 'Trying my best...', 'Striving for greatness...', 'Trying my best...'],
  ['Almost there…', 'Almost done...', 'Just a second!'],
];

function GeneratingSqlPrompts () {
  const idx = useRef({ group: 0 });
  const [current, setCurrent] = useState(() => randomOf(generatingSQLPrompts[0]));

  useInterval(() => {
    let { group } = idx.current;
    if (group < 5) {
      group += 1;
    } else {
      group = 4;
    }
    setCurrent(randomOf(generatingSQLPrompts[group]));
    idx.current.group = group;
  }, 3000);

  if (notNullish(current)) {
    return <Prompt prompt={current} />;
  } else {
    return <>Generating SQL...</>;
  }
}

function Prompt ({ prompt, avgInterval = 80, maxDiff = 50 }: { prompt: string, avgInterval?: number, maxDiff?: number }) {
  const [len, setLen, lenRef] = useStateRef(0);

  useEffect(() => {
    setLen(0);

    let h: ReturnType<typeof setTimeout>;

    function runNext () {
      h = setTimeout(() => {
        if (lenRef.current >= prompt.length) {
          clearTimeout(h);
        } else {
          setLen(len => len + 1);
          runNext();
        }
      }, avgInterval + (0.5 - Math.random()) * maxDiff);
    }

    runNext();

    return () => {
      clearTimeout(h);
    };
  }, [prompt]);

  return <>{prompt.slice(0, len)}{prompt.length !== len}</>;
}
