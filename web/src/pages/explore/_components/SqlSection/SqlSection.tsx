import { isFalsy, notBlankString, notFalsy, notNullish } from '@site/src/utils/value';
import CodeBlock from '@theme/CodeBlock';
import Section, { SectionProps, SectionStatus } from '@site/src/pages/explore/_components/Section';
import React, { forwardRef, useEffect, useMemo, useState } from 'react';
import { format } from 'sql-formatter';
import { hasAIPrompts, QuestionLoadingPhase } from '@site/src/pages/explore/_components/useQuestion';
import { useBoolean, useMemoizedFn } from 'ahooks';
import { Box, Collapse, Fade, Skeleton } from '@mui/material';
import { isSqlError } from './utils';
import Header from './Header';
import { Question } from '@site/src/api/explorer';
import { useWhenMounted } from '@site/src/hooks/mounted';
import ErrorMessage from '@site/src/pages/explore/_components/SqlSection/ErrorMessage';

export interface SqlSectionProps extends Pick<SectionProps, 'style' | 'className' | 'onErrorMessageReady' | 'onErrorMessageStart'> {
  question: Question | undefined;
  phase: QuestionLoadingPhase;
  error: unknown;
  onPromptsStart?: () => void;
  onPromptsReady?: () => void;
}

const SqlSection = forwardRef<HTMLElement, SqlSectionProps>(({ question, phase, error, onPromptsReady, onPromptsStart, ...props }, ref) => {
  const [open, { toggle: toggleOpen }] = useBoolean(false);
  const [messagesTransition, setMessagesTransition] = useState(false);
  const [messagesTransitionDone, setMessagesTransitionDone] = useState(false);

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

  useEffect(() => {
    const hasPrompts = notNullish(question) && hasAIPrompts(question);
    setMessagesTransitionDone(!hasPrompts);
  }, [question?.status]);

  const sqlSectionStatus: SectionStatus = useMemo(() => {
    switch (phase) {
      case QuestionLoadingPhase.NONE:
        return SectionStatus.pending;
      case QuestionLoadingPhase.LOADING:
      case QuestionLoadingPhase.CREATING:
      case QuestionLoadingPhase.GENERATING_SQL:
        return SectionStatus.loading;
      case QuestionLoadingPhase.GENERATE_SQL_FAILED:
      case QuestionLoadingPhase.VALIDATE_SQL_FAILED:
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
      } else if (phase === QuestionLoadingPhase.VALIDATE_SQL_FAILED) {
        return 'Failed to validate SQL';
      }
      return error;
    }
  }, [sqlSectionStatus, phase, error]);

  const whenMounted = useWhenMounted();

  const handleMessagesReady = useMemoizedFn(() => {
    setMessagesTransition(false);
    setMessagesTransitionDone(true);
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
          question={question}
          phase={phase}
          sqlSectionStatus={sqlSectionStatus}
          open={open}
          toggleOpen={toggleOpen}
          onMessagesReady={handleMessagesReady}
          onMessagesStart={handleMessagesStart}
        />
      }
      error={messagesTransitionDone ? sqlSectionError : undefined}
      errorIn={messagesTransitionDone && notFalsy(sqlSectionError)}
      errorMessage={<ErrorMessage error={sqlSectionError} />}
      afterErrorBlock={notBlankString(formattedSql) && (
        <CodeBlock language="sql">
          {formattedSql}
        </CodeBlock>
      )}
      issueTemplate={question?.errorType ?? undefined}
    >
      <Collapse in={sqlSectionStatus !== SectionStatus.loading && !messagesTransition} timeout={400}>
        <Collapse in={open} collapsedSize={52}>
          {hasSql && (
            <CodeBlock language="sql">
              {formattedSql}
            </CodeBlock>
          )}
          <Fade in={!open && hasSql && sqlSectionStatus === SectionStatus.success && !messagesTransition} unmountOnExit>
            <Box position="absolute" bottom="-1px" left="0" width="100%" height="1px" boxShadow="0 0 15px 12px #1c1c1c" />
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
