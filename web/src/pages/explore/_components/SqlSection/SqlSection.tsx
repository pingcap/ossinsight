import { isFalsy, notFalsy, notNullish } from '@site/src/utils/value';
import CodeBlock from '@theme/CodeBlock';
import Section, { SectionProps, SectionStatus } from '@site/src/pages/explore/_components/Section';
import React, { forwardRef, useMemo, useState } from 'react';
import { format } from 'sql-formatter';
import { QuestionLoadingPhase } from '@site/src/pages/explore/_components/useQuestion';
import { isAxiosError } from '@site/src/utils/error';
import { useBoolean, useMemoizedFn } from 'ahooks';
import TiDBCloudLink from '@site/src/components/TiDBCloudLink';
import { Box, Collapse, Fade, Skeleton } from '@mui/material';
import Anchor from '@site/src/components/Anchor';
import { extractTime, isSqlError } from './utils';
import Header from './Header';
import { Question } from '@site/src/api/explorer';
import { useWhenMounted } from '@site/src/hooks/mounted';

export interface SqlSectionProps extends Pick<SectionProps, 'style' | 'className'> {
  question: Question | undefined;
  phase: QuestionLoadingPhase;
  error: unknown;
  onPromptsStart?: () => void;
  onPromptsReady?: () => void;
}

const SqlSection = forwardRef<HTMLElement, SqlSectionProps>(({ question, phase, error, onPromptsReady, onPromptsStart, ...props }, ref) => {
  const [open, { toggle: toggleOpen }] = useBoolean(false);
  const [messagesTransition, setMessagesTransition] = useState(false);

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

  const sqlSectionStatus: SectionStatus = useMemo(() => {
    switch (phase) {
      case QuestionLoadingPhase.NONE:
        return SectionStatus.pending;
      case QuestionLoadingPhase.LOADING:
      case QuestionLoadingPhase.CREATING:
      case QuestionLoadingPhase.GENERATING_SQL:
        return SectionStatus.loading;
      case QuestionLoadingPhase.GENERATE_SQL_FAILED:
      case QuestionLoadingPhase.LOAD_FAILED:
      case QuestionLoadingPhase.CREATE_FAILED:
        return SectionStatus.error;
      default:
        return SectionStatus.success;
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

  const whenMounted = useWhenMounted();

  const handleMessagesReady = useMemoizedFn(() => {
    setMessagesTransition(false);
    setTimeout(whenMounted(() => {
      onPromptsReady?.();
    }), 400);
  });

  const handleMessagesStart = useMemoizedFn(() => {
    setMessagesTransition(true);
    onPromptsStart?.();
  });

  const hasSql = notFalsy(formattedSql) && isFalsy(sqlSectionError);

  return (
    <Section
      ref={ref}
      {...props}
      header={
        <Header
          sqlSectionStatus={sqlSectionStatus}
          open={open}
          toggleOpen={toggleOpen}
          onMessagesReady={handleMessagesReady}
          onMessagesStart={handleMessagesStart}
        />
      }
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
              Check out <Anchor anchor="faq-failed-to-generate-sql">potential reasons</Anchor> and try again later.
            </>
            )
      }
    >
      <Collapse in={sqlSectionStatus !== SectionStatus.loading && !messagesTransition} timeout={400}>
        <Collapse in={open} collapsedSize={36}>
          {hasSql && (
            <CodeBlock language="sql">
              {formattedSql}
            </CodeBlock>
          )}
          <Fade in={!open && hasSql && sqlSectionStatus === SectionStatus.success && !messagesTransition} unmountOnExit>
            <Box position='absolute' bottom='-1px' left='0' width='100%' height='1px' boxShadow='0 0 15px 12px #1c1c1c' />
          </Fade>
          {sqlSectionStatus === SectionStatus.loading && (
            <Skeleton />
          )}
        </Collapse>
      </Collapse>
    </Section>
  );
});

export default SqlSection;
