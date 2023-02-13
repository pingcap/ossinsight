import { Question, QuestionStatus } from '@site/src/api/explorer';
import ChatMessages, { ChatMessagesInstance } from '@site/src/pages/explore/_components/ChatMessages';
import React, { ReactElement, useEffect, useRef, useState } from 'react';
import { isNullish, notNullish } from '@site/src/utils/value';
import { notNone } from '@site/src/pages/explore/_components/SqlSection/utils';
import { Box, Collapse, IconButton } from '@mui/material';
import { Assumption, CombinedTitle, Line, RevisedTitle } from '@site/src/pages/explore/_components/SqlSection/styled';
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

const renderRevisedTitle = (revisedTitle: string, animating: boolean) => {
  return (
    <Line>
      {<BotIcon animated={animating} sx={{ mr: 1 }} />}
      Are you curious about:
      <RevisedTitle>{revisedTitle}</RevisedTitle>
    </Line>
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
        messages.keepMessages(key => key === 'CQ' || key === 'append');
        messages.insertMessage(
          <Collapse key="above" timeout={600}>
            <div>
              {notNone(question.revisedTitle) && renderRevisedTitle(question.revisedTitle, false)}
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
  }, [finished, animating, collapsed, question.revisedTitle, question.assumption, question.combinedTitle, question.status]);

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
