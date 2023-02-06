import { isFalsy, notFalsy, notNullish } from '@site/src/utils/value';
import CodeBlock from '@theme/CodeBlock';
import Section, { SectionProps, SectionStatus } from '@site/src/pages/explore/_components/Section';
import React, { forwardRef, useMemo } from 'react';
import { format } from 'sql-formatter';
import { QuestionLoadingPhase } from '@site/src/pages/explore/_components/useQuestion';
import { isAxiosError } from '@site/src/utils/error';
import { useBoolean } from 'ahooks';
import TiDBCloudLink from '@site/src/components/TiDBCloudLink';
import { Collapse } from '@mui/material';
import Anchor from '@site/src/components/Anchor';
import { extractTime, isSqlError } from './utils';
import Header from './Header';
import { Question } from '@site/src/api/explorer';

export interface SqlSectionProps extends Pick<SectionProps, 'style' | 'className'> {
  question: Question | undefined;
  phase: QuestionLoadingPhase;
  error: unknown;
  onPromptsStart?: () => void;
  onPromptsReady?: () => void;
}

const SqlSection = forwardRef<HTMLElement, SqlSectionProps>(({ question, phase, error, onPromptsReady, onPromptsStart, ...props }, ref) => {
  const [open, { toggle: toggleOpen }] = useBoolean(false);

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

  return (
    <Section
      ref={ref}
      {...props}
      header={
        <Header
          sqlSectionStatus={sqlSectionStatus}
          open={open}
          toggleOpen={toggleOpen}
          onMessagesReady={onPromptsReady}
          onMessagesStart={onPromptsStart}
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
      <Collapse in={open}>
        {notFalsy(formattedSql) && isFalsy(sqlSectionError) && (
          <CodeBlock language="sql">
            {formattedSql}
          </CodeBlock>
        )}
      </Collapse>
    </Section>
  );
});

export default SqlSection;
