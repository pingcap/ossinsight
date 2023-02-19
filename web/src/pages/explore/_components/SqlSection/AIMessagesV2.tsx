import { Question, QuestionStatus } from '@site/src/api/explorer';
import ChatMessages, { ChatMessagesInstance } from '@site/src/pages/explore/_components/ChatMessages';
import React, { ReactElement, useDebugValue, useEffect, useRef, useState } from 'react';
import { isNullish, nonEmptyArray, notFalsy, notNullish } from '@site/src/utils/value';
import { notNone } from '@site/src/pages/explore/_components/SqlSection/utils';
import { Box, Collapse, IconButton, styled } from '@mui/material';
import { Assumption, CombinedTitle, Line, ListItem, RevisedTitle, Strong } from '@site/src/pages/explore/_components/SqlSection/styled';
import { useMemoizedFn } from 'ahooks';
import BotIcon from '@site/src/pages/explore/_components/BotIcon';
import CopyButton from './CopyButton';
import { ExpandMore } from '@mui/icons-material';

const DURATION = 600;
const DELAY = 1500;
const DELAYED_DURATION = DURATION + DELAY;
const FINISH_STATUSES = [QuestionStatus.Error, QuestionStatus.Cancel, QuestionStatus.Success, QuestionStatus.Summarizing];

interface AIMessagesV2Props {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  question: Question;
  onStart?: () => void;
  onStop?: () => void;
  prompts?: ReactElement;
}

const spacer = <Box component="span" display="inline-block" width="24px" height="1px" />;

function joinComma<T> (arr: T[]): Array<T | string> {
  return arr.flatMap(i => [', ', i]).slice(1);
}

function trimNo (question: string) {
  return question.replace(/^No\s*\d+(:|.)?\s*/i, '');
}

const renderRevisedTitle = (revisedTitle: string, animating: boolean) => {
  return (
    <Line>
      {<BotIcon animated={animating} sx={{ mr: 1 }} />}
      Are you curious about:
      <RevisedTitle>{revisedTitle}</RevisedTitle>
    </Line>
  );
};

const renderKeywords = (keywords: string[]) => {
  return (
    <Line className="light">
      {spacer}
      Extracting key words: {joinComma(keywords.map(keyword => <Strong key={keyword}>{keyword}</Strong>))}
    </Line>
  );
};

const renderLinks = (links: string[]) => {
  return (
    <Line className="light">
      {spacer}
      Might be the key player: {joinComma(links.map(link => <a key={link} href={link} target="_blank" rel="noreferrer">{link}</a>))}
    </Line>
  );
};

const renderSubQuestionsTitle = () => {
  return (
    <Line className="light">
      {spacer}
      Thinking about the details:
    </Line>
  );
};

const renderSubQuestion = (question: string) => {
  return (
    <ListItem className="light">
      {spacer}
      {spacer}
      •&nbsp;
      {trimNo(question)}
    </ListItem>
  );
};

const renderAssumption = (assumption: string) => {
  return (
    <Line>
      {spacer}
      I suppose:
      <Assumption>{assumption}</Assumption>
    </Line>
  );
};

const renderCombinedTitle = (combinedTitle: string, bot: boolean, collapsed?: boolean, onCollapsedChange?: (value: boolean) => void) => {
  return (
    <Line>
      {bot ? <BotIcon animated={false} sx={{ mr: 1 }} /> : spacer}
      Seems like you are asking about:
      <CombinedTitle dangerouslySetInnerHTML={{ __html: combinedTitle }} />
      <CopyButton content={combinedTitle} />
      <IconButton disabled={isNullish(collapsed)} size="small" onClick={() => onCollapsedChange?.(!collapsed)}>
        <ExpandMore sx={{ rotate: notFalsy(collapsed) ? 0 : '180deg', transition: theme => theme.transitions.create('rotate') }} />
      </IconButton>
    </Line>
  );
};

const renderAppends = () => {
  return (
    <Line className="light">
      {spacer}
      You can copy and revise it based on the question above 👆.
    </Line>
  );
};

export default function AIMessagesV2 ({ question, prompts, onStop, onStart, collapsed = true, onCollapsedChange }: AIMessagesV2Props) {
  const [animating, setAnimating] = useState(false);
  const [finished, setFinished] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const messagesRef = useRef<ChatMessagesInstance>(null);
  useDebugValue({ animating, finished, waiting });

  useEffect(() => {
    setAnimating(false);
    setFinished(false);
    setWaiting(false);
    onCollapsedChange?.(true);
  }, [question.id]);

  useEffect(() => {
    const messages = messagesRef.current;
    if (isNullish(messages)) {
      return;
    }
    const notDone = !finished || !FINISH_STATUSES.includes(question.status);
    // if (question.status === QuestionStatus.AnswerGenerating) {
    if (notDone) {
      if (notNone(question.revisedTitle)) {
        messages.addMessage(
          <DelayedCollapse key="RQ" timeout={DELAYED_DURATION} delay={DELAY}>
            {renderRevisedTitle(question.revisedTitle, animating)}
          </DelayedCollapse>,
        );
      }
      const answer = question.answer;
      if (notNullish(answer)) {
        if (nonEmptyArray(answer.keywords)) {
          messages.addMessage(
            <DelayedCollapse key="keywords" timeout={DELAYED_DURATION} delay={DELAY}>
              {renderKeywords(answer.keywords)}
            </DelayedCollapse>,
          );
        }
        if (nonEmptyArray(answer.links)) {
          messages.addMessage(
            <DelayedCollapse key="links" timeout={DELAYED_DURATION} delay={DELAY}>
              {renderLinks(answer.links)}
            </DelayedCollapse>,
          );
        }
        if (nonEmptyArray(answer.subQuestions)) {
          messages.addMessage(
            <DelayedCollapse key="subQuestionsTitle" timeout={DELAYED_DURATION} delay={DELAY}>
              {renderSubQuestionsTitle()}
            </DelayedCollapse>,
          );
          answer.subQuestions.forEach((question, index) => {
            messages.addMessage(
              <DelayedCollapse key={`sub-${index}`} timeout={DELAYED_DURATION} delay={DELAY}>
                {renderSubQuestion(question)}
              </DelayedCollapse>,
            );
          });
        }
      }
      if (notNone(question.assumption)) {
        messages.addMessage(
          <DelayedCollapse key="assumption" timeout={DELAYED_DURATION} delay={DELAY}>
            {renderAssumption(question.assumption)}
          </DelayedCollapse>,
        );
      }
      if (notNone(question.combinedTitle)) {
        messages.addMessage(
          <DelayedCollapse key="CQ" timeout={DELAYED_DURATION} delay={DELAY}>
            {renderCombinedTitle(question.combinedTitle, false)}
          </DelayedCollapse>,
        );
        messages.addMessage(
          <DelayedCollapse key="append" timeout={DELAYED_DURATION} delay={DELAY}>
            {renderAppends()}
          </DelayedCollapse>,
        );
      }
    } else if (notNone(question.combinedTitle)) {
      if (collapsed) {
        messages.keepMessages(key => key === 'CQ' || key === 'append');
        messages.addMessage(
          <DelayedCollapse key="CQ" timeout={DURATION} delay={0}>
            {renderCombinedTitle(question.combinedTitle, true, collapsed, onCollapsedChange)}
          </DelayedCollapse>,
        );
        messages.addMessage(
          <DelayedCollapse key="append" timeout={DURATION} delay={0}>
            {renderAppends()}
          </DelayedCollapse>,
        );
      } else {
        const answer = question.answer;
        messages.keepMessages(key => key === 'CQ' || key === 'append');
        messages.insertMessage(
          <Collapse key="above" timeout={DURATION}>
            <div>
              {notNone(question.revisedTitle) && renderRevisedTitle(question.revisedTitle, false)}
              {notNullish(answer) && (
                <>
                  {nonEmptyArray(answer.keywords) && renderKeywords(answer.keywords)}
                  {nonEmptyArray(answer.links) && renderLinks(answer.links)}
                  {nonEmptyArray(answer.subQuestions) && (
                    <>
                      {renderSubQuestionsTitle()}
                      {answer.subQuestions.map(renderSubQuestion)}
                    </>
                  )}
                </>
              )}
              {notNone(question.assumption) && renderAssumption(question.assumption)}
            </div>
          </Collapse>,
        );
        messages.addMessage(
          <DelayedCollapse key="CQ" timeout={DURATION} delay={0}>
            {renderCombinedTitle(question.combinedTitle, false, collapsed, onCollapsedChange)}
          </DelayedCollapse>,
        );
        messages.addMessage(
          <DelayedCollapse key="append" timeout={DURATION} delay={0}>
            {renderAppends()}
          </DelayedCollapse>,
        );
      }
    }
  }, [finished, animating, collapsed, question.revisedTitle, question.assumption, question.combinedTitle, question.status, JSON.stringify(question.answer)]);

  useEffect(() => {
    if (isNullish(messagesRef.current)) {
      return;
    }
    if (isNullish(prompts)) {
      messagesRef.current.setPrompts(undefined);
    } else {
      messagesRef.current.setPrompts((
        <Collapse key="prompts" timeout={600}>
          {prompts}
        </Collapse>
      ));
    }
  }, [prompts]);

  const handleTransitionStart = useMemoizedFn(() => {
    if (!finished) {
      onStart?.();
      setAnimating(true);
    }
  });

  const handleTransitionEnd = useMemoizedFn(() => {
    if (!finished) {
      if (question.status !== QuestionStatus.AnswerGenerating) {
        onStop?.();
        setAnimating(false);
        setFinished(true);
      } else {
        setWaiting(true);
      }
    }
  });

  useEffect(() => {
    if (waiting && question.status !== QuestionStatus.AnswerGenerating) {
      onStop?.();
      setAnimating(false);
      setFinished(true);
      setWaiting(false);
    }
  }, [waiting, question.status]);

  return (
    <ChatMessages
      ref={messagesRef}
      onTransitionStart={handleTransitionStart}
      onTransitionEnd={handleTransitionEnd}
    />
  );
}

const DelayedCollapse = styled(Collapse, { shouldForwardProp: key => key !== 'delay' })<{ timeout: number, delay: number }>`
  transition-delay: ${({ delay }) => delay}ms;
  transition-duration: ${({ timeout, delay }) => timeout - delay}ms !important;
`;
