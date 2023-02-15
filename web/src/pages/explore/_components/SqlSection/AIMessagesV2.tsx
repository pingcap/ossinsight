import { Question, QuestionStatus } from '@site/src/api/explorer';
import ChatMessages, { ChatMessagesInstance } from '@site/src/pages/explore/_components/ChatMessages';
import React, { ReactElement, useEffect, useRef, useState } from 'react';
import { isNullish, nonEmptyArray, notNullish } from '@site/src/utils/value';
import { notNone } from '@site/src/pages/explore/_components/SqlSection/utils';
import { Box, Collapse, IconButton } from '@mui/material';
import { Assumption, CombinedTitle, Line, ListItem, RevisedTitle, Strong } from '@site/src/pages/explore/_components/SqlSection/styled';
import { useMemoizedFn } from 'ahooks';
import BotIcon from '@site/src/pages/explore/_components/BotIcon';
import CopyButton from './CopyButton';
import { ExpandMore } from '@mui/icons-material';

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

function trimGithub (link: string) {
  return link.replace(/^https:\/\/github\.com\//, '');
}

function trimNo (question: string) {
  return question.replace(/^No\s*\d+:?\s*/i, '');
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
      Might be the key player: {joinComma(links.map(link => <a key={link} href={link} target="_blank" rel="noreferrer">{trimGithub(link)}</a>))}
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
      {notNullish(collapsed) && (
        <IconButton size="small" onClick={() => onCollapsedChange?.(!collapsed)}>
          <ExpandMore sx={{ rotate: collapsed ? 0 : '180deg', transition: theme => theme.transitions.create('rotate') }} />
        </IconButton>
      )}
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
    // if (question.status === QuestionStatus.AnswerGenerating) {
    if (!finished) {
      if (notNone(question.revisedTitle)) {
        messages.addMessage(
          <Collapse key="RQ" timeout={600}>
            {renderRevisedTitle(question.revisedTitle, animating)}
          </Collapse>,
        );
      }
      const answer = question.answer;
      if (notNullish(answer)) {
        if (nonEmptyArray(answer.keywords)) {
          messages.addMessage(
            <Collapse key="keywords" timeout={600}>
              {renderKeywords(answer.keywords)}
            </Collapse>,
          );
        }
        if (nonEmptyArray(answer.links)) {
          messages.addMessage(
            <Collapse key="links" timeout={600}>
              {renderLinks(answer.links)}
            </Collapse>,
          );
        }
        if (nonEmptyArray(answer.subQuestions)) {
          messages.addMessage(
            <Collapse key="subQuestionsTitle" timeout={600}>
              {renderSubQuestionsTitle()}
            </Collapse>,
          );
          answer.subQuestions.forEach((question, index) => {
            messages.addMessage(
              <Collapse key={`sub-${index}`} timeout={600}>
                {renderSubQuestion(question)}
              </Collapse>,
            );
          });
        }
      }
      if (notNone(question.assumption)) {
        messages.addMessage(
          <Collapse key="assumption" timeout={600}>
            {renderAssumption(question.assumption)}
          </Collapse>,
        );
      }
      if (notNone(question.combinedTitle)) {
        messages.addMessage(
          <Collapse key="CQ" timeout={600}>
            {renderCombinedTitle(question.combinedTitle, false)}
          </Collapse>,
        );
        messages.addMessage(
          <Collapse key="append" timeout={600}>
            {renderAppends()}
          </Collapse>,
        );
      }
    } else if (notNone(question.combinedTitle)) {
      if (collapsed) {
        messages.keepMessages(key => key === 'CQ' || key === 'append');
        messages.addMessage(
          <Collapse key="CQ" timeout={600}>
            {renderCombinedTitle(question.combinedTitle, true, collapsed, onCollapsedChange)}
          </Collapse>,
        );
        messages.addMessage(
          <Collapse key="append" timeout={600}>
            {renderAppends()}
          </Collapse>,
        );
      } else {
        const answer = question.answer;
        messages.keepMessages(key => key === 'CQ' || key === 'append');
        messages.insertMessage(
          <Collapse key="above" timeout={600}>
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
          <Collapse key="CQ" timeout={600}>
            {renderCombinedTitle(question.combinedTitle, false, collapsed, onCollapsedChange)}
          </Collapse>,
        );
        messages.addMessage(
          <Collapse key="append" timeout={600}>
            {renderAppends()}
          </Collapse>,
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
