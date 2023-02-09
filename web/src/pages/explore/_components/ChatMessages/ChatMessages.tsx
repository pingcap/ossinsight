import { TransitionGroup } from 'react-transition-group';
import React, { forwardRef, Key, useEffect, useRef } from 'react';
import useChatMessages, { MessageElement } from './hook';
import { applyForwardedRef } from '@site/src/utils/ref';

export interface ChatMessagesInstance {
  addMessage: (message: MessageElement) => void;

  keepMessages: (filter: (el: Key) => boolean) => void;

  setPrompts: (message: MessageElement | undefined) => void;
}

export interface ChatMessagesProps {
  onTransitionStart?: () => void;
  onTransitionEnd?: () => void;
}

const ChatMessages = forwardRef<ChatMessagesInstance, ChatMessagesProps>(({
  onTransitionStart,
  onTransitionEnd,
},
ref,
) => {
  const { transitioning, messages, addMessage, keepMessages, setPrompts } = useChatMessages();
  const initRef = useRef(false);

  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;
      return;
    }
    if (transitioning) {
      onTransitionStart?.();
    } else {
      onTransitionEnd?.();
    }
  }, [transitioning]);

  useEffect(() => {
    applyForwardedRef(ref, {
      addMessage,
      keepMessages,
      setPrompts,
    });
  }, []);

  return (
    <TransitionGroup>
      {messages}
    </TransitionGroup>
  );
});

export default ChatMessages;
