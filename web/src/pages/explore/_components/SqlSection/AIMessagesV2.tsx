import { Question, QuestionStatus } from '@site/src/api/explorer';
import ChatMessages, { ChatMessagesInstance } from '@site/src/pages/explore/_components/ChatMessages';
import React, { ReactElement, useEffect, useRef, useState } from 'react';
import { isNullish } from '@site/src/utils/value';
import { notNone } from '@site/src/pages/explore/_components/SqlSection/utils';
import { Box, Collapse } from '@mui/material';
import { Assumption, CombinedTitle, Line, RevisedTitle } from '@site/src/pages/explore/_components/SqlSection/styled';
import { useMemoizedFn } from 'ahooks';
import BotIcon from '@site/src/pages/explore/_components/BotIcon';

interface AIMessagesV2Props {
  question: Question;
  onStart?: () => void;
  onStop?: () => void;
  prompts?: ReactElement;
}

const spacer = <Box component="span" display="inline-block" width="24px" height="1px" />;

export default function AIMessagesV2 ({ question, prompts, onStop, onStart }: AIMessagesV2Props) {
  const [animating, setAnimating] = useState(false);
  const [finished, setFinished] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const messagesRef = useRef<ChatMessagesInstance>(null);

  useEffect(() => {
    setAnimating(false);
    setFinished(false);
    setWaiting(false);
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
            <Line>
              <BotIcon animated={animating} sx={{ mr: 1 }} />
              Are you curious about:
              <RevisedTitle>{question.revisedTitle}</RevisedTitle>
            </Line>
          </Collapse>,
        );
      }
      if (notNone(question.assumption)) {
        messages.addMessage(
          <Collapse key="assumption" timeout={600}>
            <Line>
              {spacer}
              I suppose:
              <Assumption>{question.assumption}</Assumption>
            </Line>
          </Collapse>,
        );
      }
      if (notNone(question.combinedTitle)) {
        messages.addMessage(
          <Collapse key="CQ" timeout={600}>
            <Line>
              {spacer}
              Seems like you are asking about:
              <CombinedTitle dangerouslySetInnerHTML={{ __html: question.combinedTitle }} />
            </Line>
          </Collapse>,
        );
      }
    } else if (notNone(question.combinedTitle)) {
      messages.addMessage(
        <Collapse key="CQ" timeout={600}>
          <Line>
            <BotIcon animated={false} sx={{ mr: 1 }} />
            Seems like you are asking about:
            <CombinedTitle dangerouslySetInnerHTML={{ __html: question.combinedTitle }} />
          </Line>
        </Collapse>,
      );
      messages.keepMessages(key => key === 'CQ');
    }
  }, [finished, animating, question.revisedTitle, question.assumption, question.combinedTitle, question.status]);

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
    onStart?.();
    setAnimating(true);
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
