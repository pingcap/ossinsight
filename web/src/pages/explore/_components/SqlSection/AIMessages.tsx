import { Question, QuestionErrorType, QuestionStatus } from '@site/src/api/explorer';
import React, { cloneElement, ReactElement, ReactNode, useEffect, useMemo, useState } from 'react';
import { isNullish, notFalsy } from '@site/src/utils/value';
import { notNone } from '@site/src/pages/explore/_components/SqlSection/utils';
import { Line, NotClear, Tag } from '@site/src/pages/explore/_components/SqlSection/styled';
import { Alert, Box, Collapse, IconButton, Snackbar, styled, useEventCallback } from '@mui/material';
import BotIcon from '@site/src/pages/explore/_components/BotIcon';
import { TransitionGroup } from 'react-transition-group';
import { ContentCopy } from '@mui/icons-material';
import { useWhenMounted } from '@site/src/hooks/mounted';
import { reactNodeOrFunction } from '@site/src/utils/react';

export interface AIMessagesProps<TitleLineArgs extends any[]> {
  question: Question | undefined;
  hasPrompt: boolean;
  titleLine: (...args: TitleLineArgs) => ReactNode;
  titleLineDeps: TitleLineArgs;
  onStart?: () => void;
  onReady?: () => void;
}

type Message<TitleLineArgs extends any[]> = {
  key: string;
  show: boolean;
  content: ReactElement | ((...args: TitleLineArgs) => ReactElement);
};

export default function AIMessages<TitleLineArgs extends any[]> ({ question, hasPrompt, titleLine, titleLineDeps, onStart, onReady }: AIMessagesProps<TitleLineArgs>) {
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

  const messages: Array<Message<TitleLineArgs>> = useMemo(() => [
    {
      key: 'not-sure',
      show: notNone(question?.notClear) && question?.errorType !== QuestionErrorType.SQL_CAN_NOT_ANSWER,
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
      show: question?.status !== QuestionStatus.AnswerGenerating && !notNone(question?.combinedTitle) && notNone(question?.revisedTitle),
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
      key: 'cq',
      show: notNone(question?.combinedTitle),
      content: (
        <Line>
          - Seems like you are asking about&nbsp;
          <Tag dangerouslySetInnerHTML={{ __html: `${question?.combinedTitle ?? ''}` }} />
          <CopyButton content={question?.combinedTitle} />
        </Line>
      ),
    },
    {
      key: 'tips',
      show: notNone(question?.combinedTitle) && question?.errorType !== QuestionErrorType.SQL_CAN_NOT_ANSWER,
      content: (
        <Line fontSize="14px" fontWeight="normal">- You can copy and revise it based on the question above 👆.</Line>
      ),
    },
    {
      key: 'status',
      show: hasPrompt,
      content: (...titleLineDeps: TitleLineArgs) => (
        <Line mt={2}>
          {titleLine(...titleLineDeps)}
        </Line>
      ),
    },
  ].filter(item => item.show), [question?.status, question?.revisedTitle, question?.combinedTitle, question?.notClear, question?.assumption, question?.errorType]);

  const whenMounted = useWhenMounted();

  useEffect(() => {
    if (!hasPrompt) {
      onReady?.();
      return;
    }
    let internalIndex = index + 1;
    setIndex(internalIndex);
    const h = setInterval(whenMounted(() => {
      setIndex(internalIndex + 1);
      internalIndex += 1;
      if (internalIndex >= messages.length) {
        setTimeout(whenMounted(() => {
          onReady?.();
        }), 600);
        clearInterval(h);
      }
    }), 600);
    onStart?.();
    return () => {
      clearInterval(h);
    };
  }, [messages.length, hasPrompt]);

  const botMessages = useMemo(() => {
    if (hasPrompt) {
      return messages.slice(0, index).map(({ key, show, content }, i) => {
        const el = reactNodeOrFunction(content, ...titleLineDeps);
        const childContent = cloneElement(el, {
          children: (
            <>
              <Indicator bot={i === 0} animated={question?.status === QuestionStatus.AnswerGenerating || index < messages.length} show={i < messages.length - 1} />
              {el.props.children}
            </>
          ),
        });
        return (
          <Collapse key={key} timeout={600}>
            {childContent}
          </Collapse>
        );
      });
    } else {
      return [];
    }
  }, [messages.length, question?.status, hasPrompt, index, ...titleLineDeps]);

  return (
    <TransitionGroup component={AIMessagesRoot}>
      {botMessages}
    </TransitionGroup>
  );
}

const AIMessagesRoot = styled('div')`
  min-height: 40px;
`;

function Indicator ({ bot, show, animated }: { show: boolean, bot: boolean, animated: boolean }) {
  if (bot) {
    return <BotIcon animated={animated} sx={{ mr: 1 }} />;
  } else if (show) {
    return <Box component="span" display="inline-block" width="24px" height="1px" />;
  } else {
    return null;
  }
}

function CopyButton ({ content }: { content: string | undefined }) {
  const [show, setShow] = useState(false);

  const handleHide = useEventCallback(() => {
    setShow(false);
  });

  const handleClick = useEventCallback(() => {
    if (notFalsy(content)) {
      if (content.includes('<b>')) {
        const fake = document.createElement('div');
        fake.innerHTML = content;
        content = fake.innerText;
      }
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
