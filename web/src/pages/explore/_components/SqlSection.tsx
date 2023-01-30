import { notFalsy, notNullish } from '@site/src/utils/value';
import CodeBlock from '@theme/CodeBlock';
import Section from '@site/src/pages/explore/_components/Section';
import React, { ReactNode, useMemo, useRef, useState } from 'react';
import { format } from 'sql-formatter';
import useQuestionManagement, { QuestionLoadingPhase } from '@site/src/pages/explore/_components/useQuestion';
import { AxiosError } from 'axios';
import { getAxiosErrorPayload, getErrorMessage, isAxiosError } from '@site/src/utils/error';
import { useInterval } from 'ahooks';
import { randomOf } from '@site/src/utils/generate';
import TypewriterEffect from '@site/src/pages/explore/_components/TypewriterEffect';
import { gotoAnchor } from '@site/src/utils/dom';
import TiDBCloudLink from '@site/src/components/TiDBCloudLink';
import { Box, styled } from '@mui/material';
import { BoxProps } from '@mui/material/Box';

export default function SqlSection () {
  const { question, error, phase } = useQuestionManagement();

  const formattedSql = useMemo(() => {
    try {
      if (notNullish(question)) {
        return format(`
        -- AI Prompts
        --
        -- Assumption: ${question.assumption ?? 'N/A'}
        -- Not Clear: ${question.notClear ?? 'N/A'}
        -- Revised Title: ${question.revisedTitle ?? 'N/A'}
        ----------------------------------------------------------------------------------------
        ${question.querySQL}`, { language: 'mysql' });
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
        return 'Generating SQL...';
      case QuestionLoadingPhase.GENERATING_SQL:
        return <GeneratingSqlPrompts />;
      case QuestionLoadingPhase.LOAD_FAILED:
        return 'Question not found';
      case QuestionLoadingPhase.GENERATE_SQL_FAILED:
      case QuestionLoadingPhase.CREATE_FAILED:
        return 'Failed to generate SQL';
      default:
        return 'Finished writing SQL';
    }
  }, [phase]);

  const sqlSectionError = useMemo(() => {
    if (sqlSectionStatus === 'error') {
      return error;
    }
  }, [sqlSectionStatus, error]);

  const showBot = phase !== QuestionLoadingPhase.CREATING && phase !== QuestionLoadingPhase.LOADING;

  return (
    <Section
      status={sqlSectionStatus}
      title={
        <StyledTitle>
          {notFalsy(question?.revisedTitle) && <Line prefix="- Are you looking for the answer of ">
            <Tag>
              {question?.revisedTitle}
            </Tag>
          </Line>}
          <Line prefix="- I am not very clear with: ">{question?.notClear}</Line>
          <Line prefix="- I guess: ">{question?.assumption}</Line>
          <Line prefix="- " mt={2}>{sqlTitle}</Line>
        </StyledTitle>
      }
      icon={showBot ? 'bot' : 'default'}
      extra="auto"
      error={sqlSectionError}
      errorWithChildren
      errorTitle="Failed to generate SQL"
      errorPrompt="Hi, it's failed to generate SQL for"
      errorMessage={
        isAxiosError(sqlSectionError) && sqlSectionError.response?.status === 429
          ? (
            <>
              Wow, you&apos;re a natural explorer! But it&apos;s a little tough to keep up!
              <br />
              Take a break and try again in {extractTime(sqlSectionError)}.
              <br />
              Check out <TiDBCloudLink>Chat2Query</TiDBCloudLink> if you want to try AI-generated SQL in any other dataset <b>within 5 minutes</b>.
            </>
            )
          : (
            <>
              Whoops! No SQL query is generated.
              Check out <a href="javascript:void(0)" onClick={gotoAnchor('faq-failed-to-generate-sql')}>potential reasons</a> and try again later.
            </>
            )
      }
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
  ['Sometimes I\'m not smart enough...', 'Sometimes it\'s difficult for me...', 'Not always generate perfect SQL...', 'Struggling with SQL accuracy...'],
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
    return <TypewriterEffect content={current} />;
  } else {
    return <>Generating SQL...</>;
  }
}

const FALSY_VALUES: any[] = ['none', 'n/a'];

function Line ({ prefix, children, ...props }: { mt?: number, prefix?: ReactNode, children: ReactNode } & BoxProps<'span'>) {
  if (notFalsy(children) && !FALSY_VALUES.includes(String(children).toLowerCase())) {
    return (
      <Box component="span" display="block" lineHeight='26px' {...props}>
        {prefix}{children}
      </Box>
    );
  } else {
    return <></>;
  }
}

const StyledTitle = styled('div')`
  font-weight: normal;
  font-size: 14px;
  color: #D1D1D1;
`;

const Tag = styled('span')`
  display: inline-block;
  background: #383744;
  border-radius: 6px;
  padding: 6px;
  line-height: 1;
`;

export function extractTime (error: AxiosError) {
  const payload = getAxiosErrorPayload(error) as any;
  if (notNullish(payload?.waitMinutes)) {
    return `${payload?.waitMinutes as string} minutes`;
  }
  const res = getErrorMessage(error).match(/please wait (.+)\./);
  if (notNullish(res)) {
    return res[1];
  }
  return '30 minutes';
}
