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
import { useWhenMounted } from '@site/src/hooks/mounted';
import { parseKeywords } from '@site/src/pages/explore/_components/SqlSection/AIMessagesV3';

function getTime (name: string, fallback: number): number {
  if (typeof localStorage === 'undefined') {
    return fallback;
  }
  const i = localStorage.getItem(`ossinsight.explore.ai-message.${name}`);
  if (i) {
    return parseInt(i);
  } else {
    return fallback;
  }
}

const DURATION = getTime('duration', 600);
const DELAY = getTime('delay', 1800);
const SUB_DELAY = getTime('sub-extra-delay', 1200);
const FINISH_STATUSES = [QuestionStatus.Error, QuestionStatus.Cancel, QuestionStatus.Success, QuestionStatus.Summarizing];

export interface AIMessagesV2Props {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  question: Question;
  onStart?: () => void;
  onStop?: () => void;
  prompts?: ReactElement;
}

const spacer = <Box component="span" display="inline-block" width="24px" height="1px" />;

export function joinComma<T> (arr: T[]): Array<T | string> {
  return arr.flatMap(i => [', ', i]).slice(1);
}

export function trimNo (question: string) {
  return question.replace(/^No\s*\d+(:|.)?\s*/i, '');
}

const renderRevisedTitle = (revisedTitle: string, animating: boolean) => {
  return (
    <Line>
      {<BotIcon animated={animating} sx={{ mr: 1 }} />}
      You seem curious about:
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
      Thinking about the details...
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
      And your question becomes:
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

const NORMAL_DELAYED_TIMEOUT = {
  enter: DELAY + DURATION,
  exit: DURATION,
};

const NORMAL_DELAY = {
  enter: DELAY,
  exit: 0,
};

const SUB_QUESTION_DELAYED_TIMEOUT = {
  enter: NORMAL_DELAYED_TIMEOUT.enter + SUB_DELAY,
  exit: DURATION,
};

const SUB_QUESTION_DELAY = {
  enter: NORMAL_DELAY.enter + SUB_DELAY,
  exit: 0,
};

export default function AIMessagesV2 ({ question, prompts, onStop, onStart, collapsed = true, onCollapsedChange }: AIMessagesV2Props) {
  const [animating, setAnimating] = useState(false);
  const [finished, setFinished] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const messagesRef = useRef<ChatMessagesInstance>(null);
  const whenMounted = useWhenMounted();
  const stopTimeoutHandler = useRef<ReturnType<typeof setTimeout>>();
  useDebugValue({ animating, finished, waiting });

  useEffect(() => {
    clearTimeout(stopTimeoutHandler.current);
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
          <DelayedCollapse key="RQ" timeout={NORMAL_DELAYED_TIMEOUT} delay={NORMAL_DELAY}>
            {renderRevisedTitle(question.revisedTitle, animating)}
          </DelayedCollapse>,
        );
      }
      const answer = question.answer;
      if (notNullish(answer)) {
        const keywords = parseKeywords(answer.keywords);
        const links = parseKeywords(answer.links);
        if (nonEmptyArray(keywords)) {
          messages.addMessage(
            <DelayedCollapse key="keywords" timeout={NORMAL_DELAYED_TIMEOUT} delay={NORMAL_DELAY}>
              {renderKeywords(keywords)}
            </DelayedCollapse>,
          );
        }
        if (nonEmptyArray(links)) {
          messages.addMessage(
            <DelayedCollapse key="links" timeout={NORMAL_DELAYED_TIMEOUT} delay={NORMAL_DELAY}>
              {renderLinks(links)}
            </DelayedCollapse>,
          );
        }
        if (nonEmptyArray(answer.subQuestions)) {
          messages.addMessage(
            <DelayedCollapse key="subQuestionsTitle" timeout={NORMAL_DELAYED_TIMEOUT} delay={NORMAL_DELAY}>
              {renderSubQuestionsTitle()}
            </DelayedCollapse>,
          );
          answer.subQuestions.forEach((question, index) => {
            messages.addMessage(
              <DelayedCollapse key={`sub-${index}`} timeout={index > 0 ? SUB_QUESTION_DELAYED_TIMEOUT : NORMAL_DELAYED_TIMEOUT} delay={index > 0 ? SUB_QUESTION_DELAY : NORMAL_DELAY}>
                {renderSubQuestion(question)}
              </DelayedCollapse>,
            );
          });
        }
      }
      // if any sub questions, make next question delayed.
      let shouldDelayNext = nonEmptyArray(answer?.subQuestions);
      if (notNone(question.assumption)) {
        messages.addMessage(
          <DelayedCollapse key="assumption" timeout={shouldDelayNext ? NORMAL_DELAYED_TIMEOUT : SUB_QUESTION_DELAYED_TIMEOUT} delay={shouldDelayNext ? NORMAL_DELAY : SUB_QUESTION_DELAY}>
            {renderAssumption(question.assumption)}
          </DelayedCollapse>,
        );
        shouldDelayNext = false;
      }
      if (notNone(question.combinedTitle)) {
        messages.addMessage(
          <DelayedCollapse key="CQ" timeout={shouldDelayNext ? NORMAL_DELAYED_TIMEOUT : SUB_QUESTION_DELAYED_TIMEOUT} delay={shouldDelayNext ? NORMAL_DELAY : SUB_QUESTION_DELAY}>
            {renderCombinedTitle(question.combinedTitle, false)}
          </DelayedCollapse>,
        );
        messages.addMessage(
          <DelayedCollapse key="append" timeout={NORMAL_DELAYED_TIMEOUT} delay={NORMAL_DELAY}>
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
        const keywords = parseKeywords(answer?.keywords);
        const links = parseKeywords(answer?.links);

        messages.keepMessages(key => key === 'CQ' || key === 'append');
        messages.insertMessage(
          <Collapse key="above" timeout={DURATION}>
            <div>
              {notNone(question.revisedTitle) && renderRevisedTitle(question.revisedTitle, false)}
              {notNullish(answer) && (
                <>
                  {nonEmptyArray(keywords) && renderKeywords(keywords)}
                  {nonEmptyArray(links) && renderLinks(links)}
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

  const handleStop = useMemoizedFn(() => {
    onStop?.();
    stopTimeoutHandler.current = setTimeout(whenMounted(() => {
      setAnimating(false);
      setFinished(true);
    }), DELAY * 2);
  });

  const handleTransitionStart = useMemoizedFn(() => {
    if (!finished) {
      onStart?.();
      setAnimating(true);
    }
  });

  const handleTransitionEnd = useMemoizedFn(() => {
    if (!finished) {
      if (question.status !== QuestionStatus.AnswerGenerating) {
        handleStop();
      } else {
        setWaiting(true);
      }
    }
  });

  useEffect(() => {
    if (waiting && question.status !== QuestionStatus.AnswerGenerating) {
      handleStop();
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

function toTimeout (inProp: boolean | undefined, ts: number | { enter?: number, exit?: number }) {
  if (typeof ts === 'number') {
    return ts;
  } else if (inProp === true) {
    return ts.enter ?? 0;
  } else {
    return ts.exit ?? 0;
  }
}

const DelayedCollapse = styled(Collapse, { shouldForwardProp: key => key !== 'delay' })<{ timeout: number | { enter: number, exit: number }, delay: number | { enter: number, exit: number } }>`
  transition-delay: ${({ in: inProp, delay }) => toTimeout(inProp, delay)}ms;
  transition-duration: ${({ in: inProp, timeout, delay }) => toTimeout(inProp, timeout) - toTimeout(inProp, delay)}ms !important;
`;
