import { isFalsy, isNonemptyString, notFalsy, notNullish } from '@site/src/utils/value';
import CodeBlock from '@theme/CodeBlock';
import Section from '@site/src/pages/explore/_components/Section';
import React, { ReactNode, SyntheticEvent, useMemo, useRef, useState } from 'react';
import { format } from 'sql-formatter';
import useQuestionManagement, { QuestionLoadingPhase } from '@site/src/pages/explore/_components/useQuestion';
import { AxiosError } from 'axios';
import { getAxiosErrorPayload, getErrorMessage, isAxiosError } from '@site/src/utils/error';
import { useInterval } from 'ahooks';
import { randomOf } from '@site/src/utils/generate';
import TypewriterEffect from '@site/src/pages/explore/_components/TypewriterEffect';
import { gotoAnchor } from '@site/src/utils/dom';
import TiDBCloudLink from '@site/src/components/TiDBCloudLink';
import { Alert, Box, Button, IconButton, Snackbar, styled, useEventCallback } from '@mui/material';
import { BoxProps } from '@mui/material/Box';
import { ContentCopy, ExpandMore } from '@mui/icons-material';

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
      case QuestionLoadingPhase.GENERATING_SQL:
        return <GeneratingSqlPrompts />;
      case QuestionLoadingPhase.LOAD_FAILED:
        return 'Question not found';
      case QuestionLoadingPhase.GENERATE_SQL_FAILED:
      case QuestionLoadingPhase.CREATE_FAILED:
        return 'Failed to generate SQL';
      default:
        return 'Ta-da! SQL is written,';
    }
  }, [phase]);

  const sqlSectionError = useMemo(() => {
    if (sqlSectionStatus === 'error') {
      if (phase === QuestionLoadingPhase.GENERATE_SQL_FAILED) {
        return 'Failed to generate SQL';
      }
      return error;
    }
  }, [sqlSectionStatus, phase, error]);

  const showBot = phase !== QuestionLoadingPhase.LOADING;
  const hasPrompt = useMemo(() => {
    return notNullish(question) && (
      notNone(question.revisedTitle) ||
      notNone(question.notClear) ||
      notNone(question.assumption)
    );
  }, [question]);

  const showSqlTitle = sqlSectionStatus !== 'error' || !hasPrompt;

  return (
    <Section
      status={sqlSectionStatus}
      title={(open, toggle) => (
        <StyledTitle>
          {notNone(question?.revisedTitle) && <Line prefix="- Seems like you are asking about ">
            <Tag>
              {question?.revisedTitle}
            </Tag>
            <CopyButton content={question?.revisedTitle} />
          </Line>}
          <Line prefix="- But I’m not sure that: ">{question?.notClear}</Line>
          <Line prefix="- I guess: ">{question?.assumption}</Line>
          {showSqlTitle && (
            <Line prefix={hasPrompt ? '- ' : undefined} mt={hasPrompt ? 2 : undefined}>
              {sqlTitle}
              {sqlSectionStatus === 'success' && (
                <Button size="small" endIcon={<ExpandMore sx={{ rotate: open ? '180deg' : 0, transition: theme => theme.transitions.create('rotate') }} />} sx={{ ml: 1, pointerEvents: 'auto' }}>
                  {open ? 'Hide' : 'Check it out'}
                </Button>
              )}
            </Line>
          )}
        </StyledTitle>
      )}
      icon={showBot ? 'bot' : 'default'}
      extra="auto"
      error={sqlSectionError}
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
      {notFalsy(formattedSql) && isFalsy(sqlSectionError) && (
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

function Line ({ prefix, children, ...props }: { mt?: number, prefix?: ReactNode, children: ReactNode } & BoxProps<'span'>) {
  if (notNone(children)) {
    return (
      <Box component="span" display="block" lineHeight="26px" {...props}>
        {prefix}{children}
      </Box>
    );
  } else {
    return <></>;
  }
}

function CopyButton ({ content }: { content: string | undefined }) {
  const [show, setShow] = useState(false);

  const handleHide = useEventCallback((event: SyntheticEvent) => {
    event.stopPropagation();
    setShow(false);
  });

  const handleClick = useEventCallback((event: SyntheticEvent) => {
    event.stopPropagation();
    if (content) {
      navigator.clipboard.writeText(content).catch(console.error);
      setShow(true);
    }
  });

  return (
    <>
      <IconButton size="small" onClick={handleClick} sx={{ pointerEvents: 'auto', ml: 0.5 }}>
        <ContentCopy fontSize="inherit" />
      </IconButton>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={show}
        onClose={handleHide}
        autoHideDuration={3000}
        sx={{ pointerEvents: 'auto' }}
      >
        <Alert severity="info" onClose={handleHide} sx={{ width: '100%' }}>
          Copied!
        </Alert>
      </Snackbar>
    </>
  );
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

function notNone (value: any): boolean {
  if (isNonemptyString(value)) {
    return !['none', 'n/a'].includes(value.toLowerCase());
  }
  return notFalsy(value);
}
