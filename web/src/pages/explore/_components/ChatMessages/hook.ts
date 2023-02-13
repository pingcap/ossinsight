import { cloneElement, Key, ReactElement, useEffect, useMemo, useState } from 'react';
import { useMemoizedFn } from 'ahooks';
import { TransitionProps } from 'react-transition-group/Transition';
import { isNullish, notNullish } from '@site/src/utils/value';

export type MessageElement = ReactElement<TransitionProps>;

export default function useChatMessages () {
  const [existingMessages, setExistingMessages] = useState(() => new Set<Key>());
  const [transitioning, setTransitioning] = useState(false);
  const [bufferMessages, setBufferMessages] = useState<MessageElement[]>([]);
  const [messages, setMessages] = useState<MessageElement[]>([]);
  const [prompts, setPrompts] = useState<MessageElement>();

  const addMessage = useMemoizedFn((message: MessageElement) => {
    if (isNullish(message.key)) {
      throw new Error('ChatMessage requires key');
    }
    if (existingMessages.has(message.key)) {
      const updater = ([...messages]: MessageElement[]) => {
        const index = messages.findIndex(({ key }) => key === message.key);
        if (index !== -1) {
          messages.splice(index, 1, message);
        }
        return messages;
      };
      setBufferMessages(updater);
      setMessages(updater);
    } else {
      setBufferMessages(messages => [...messages, message]);
      existingMessages.add(message.key);
    }
  });

  const insertMessage = useMemoizedFn((message: MessageElement, index: number = 0) => {
    if (isNullish(message.key)) {
      throw new Error('ChatMessage requires key');
    }
    if (existingMessages.has(message.key)) {
      const updater = ([...messages]: MessageElement[]) => {
        const index = messages.findIndex(({ key }) => key === message.key);
        if (index !== -1) {
          messages.splice(index, 1, message);
        }
        return messages;
      };
      setBufferMessages(updater);
      setMessages(updater);
    } else {
      setMessages(([...messages]) => {
        messages.splice(index, 0, message);
        return messages;
      });
      existingMessages.add(message.key);
    }
  });

  const keepMessages = useMemoizedFn((filter: (el: Key) => boolean) => {
    setBufferMessages(messages => messages.filter(el => filter(el.key as Key)));
    setMessages(messages => messages.filter(el => filter(el.key as Key)));
    setExistingMessages(messages => new Set([...messages].filter(filter)));
  });

  const onEnter = useMemoizedFn(() => {
    setTransitioning(true);
  });

  const onEntered = useMemoizedFn(() => {
    const message = bufferMessages[0];
    if (isNullish(message)) {
      setTransitioning(false);
      return;
    }
    setBufferMessages(([_, ...messages]) => messages);
    setMessages(messages => [...messages, message]);
  });

  const rewroteMessages = useMemo(() => {
    return messages.map(message => cloneElement(message, {
      onEnter: combineCallback(onEnter, message.props.onEnter),
      onEntered: combineCallback(onEntered, message.props.onEntered),
    })).concat(notNullish(prompts) ? prompts : []);
  }, [messages, prompts]);

  useEffect(() => {
    if (!transitioning && bufferMessages.length > 0) {
      const message = bufferMessages[0];
      setBufferMessages(([_, ...messages]) => messages);
      setMessages(messages => [...messages, message]);
      setTransitioning(true);
    }
  }, [transitioning, bufferMessages.length]);

  return {
    transitioning,
    addMessage,
    insertMessage,
    keepMessages,
    setPrompts,
    messages: rewroteMessages,
  };
}

function combineCallback<F extends (...args: any[]) => void> (f1: F | undefined, f2: F | undefined): F {
  return ((...args: any[]) => {
    f1?.(...args);
    f2?.(...args);
  }) as F;
}
