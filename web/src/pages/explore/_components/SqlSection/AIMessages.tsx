import { Question } from '@site/src/api/explorer';
import React, { cloneElement, ReactNode, useEffect, useMemo, useState } from 'react';
import { isNullish } from '@site/src/utils/value';
import { notNone } from '@site/src/pages/explore/_components/SqlSection/utils';
import { Line, NotClear, Tag } from '@site/src/pages/explore/_components/SqlSection/styled';
import { Alert, Box, Collapse, IconButton, Snackbar, styled, useEventCallback } from '@mui/material';
import BotIcon from '@site/src/pages/explore/_components/BotIcon';
import { TransitionGroup } from 'react-transition-group';
import { ContentCopy } from '@mui/icons-material';

export default function AIMessages ({ question, hasPrompt, titleLine }: { question: Question | undefined, hasPrompt: boolean, titleLine: ReactNode }) {
  const [index, setIndex] = useState(0);

  const fullRevisedTitle = useMemo(() => {
    if (isNullish(question)) {
      return '';
    }
    if (!notNone(question.revisedTitle)) {
      return '';
    }
    let result = question.revisedTitle as string;
    if (notNone(question.assumption)) {
      result += ` (${question.assumption as string})`;
    }
    return result;
  }, [question?.revisedTitle, question?.assumption]);

  const messages = useMemo(() => [
    {
      key: 'not-sure',
      show: notNone(question?.notClear),
      content: (
        <Line>
          - But I’m not sure that:&nbsp;
          <NotClear>
            {question?.notClear}
          </NotClear>
        </Line>
      ),
    },
    {
      key: 'rq',
      show: notNone(question?.revisedTitle),
      content: (
        <Line>
          - Seems like you are asking about&nbsp;
          <Tag>
            {question?.revisedTitle}
            {notNone(question?.assumption) && (
              <i> ({question?.assumption})</i>
            )}
          </Tag>
          <CopyButton content={fullRevisedTitle} />
        </Line>
      ),
    },
    {
      key: 'tips',
      show: true,
      content: (
        <Line fontSize="14px" fontWeight="normal">- You can copy and revise it based on the question above 👆.</Line>
      ),
    },
    {
      key: 'status',
      show: true,
      content: (
        <Line mt={2}>
          {titleLine}
        </Line>
      ),
    },
  ], [question?.revisedTitle, question?.notClear, question?.assumption]);

  useEffect(() => {
    if (!hasPrompt) {
      return;
    }
    setIndex(1);
    const h = setInterval(() => {
      setIndex(index => {
        if (index >= messages.length - 1) {
          clearInterval(h);
        }
        return index + 1;
      });
    }, 600);
    return () => {
      clearInterval(h);
    };
  }, [messages, hasPrompt]);

  const botMessages = useMemo(() => {
    if (hasPrompt) {
      return messages.filter(i => i.show).map(({ key, show, content }, i, total) => (
        <Collapse key={key} timeout={600}>
          {cloneElement(content, {
            children: (
              <>
                {i === 0
                  ? <BotIcon animated={index < messages.length} sx={{ mr: 1 }} />
                  : i < total.length - 1
                    ? <Box component="span" display="inline-block" width="24px" height="1px" />
                    : undefined}
                {content.props.children}
              </>
            ),
          })}
        </Collapse>
      )).slice(0, index);
    } else {
      return [];
    }
  }, [messages, hasPrompt, index]);

  return (
    <TransitionGroup component={AIMessagesRoot}>
      {botMessages}
    </TransitionGroup>
  );
}

const AIMessagesRoot = styled('div')`
  min-height: 40px;
`;

function CopyButton ({ content }: { content: string | undefined }) {
  const [show, setShow] = useState(false);

  const handleHide = useEventCallback(() => {
    setShow(false);
  });

  const handleClick = useEventCallback(() => {
    if (content) {
      navigator.clipboard.writeText(content).catch(console.error);
      setShow(true);
    }
  });

  return (
    <>
      <IconButton size="small" onClick={handleClick} sx={{ ml: 0.5 }}>
        <ContentCopy fontSize="inherit" />
      </IconButton>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={show}
        onClose={handleHide}
        autoHideDuration={3000}
      >
        <Alert severity="info" onClose={handleHide} sx={{ width: '100%' }}>
          Copied!
        </Alert>
      </Snackbar>
    </>
  );
}
