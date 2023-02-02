import React, { ReactNode, TransitionEventHandler, useEffect, useRef, useState } from 'react';
import { SectionBody, sectionClasses, SectionContainer, SectionHeader, SectionRoot } from '@site/src/pages/explore/_components/Section/styled';
import { notFalsy } from '@site/src/utils/value';
import ErrorBlock from '@site/src/pages/explore/_components/ErrorBlock';
import { getErrorMessage } from '@site/src/utils/error';
import clsx from 'clsx';
import { useWhenMounted } from '@site/src/hooks/mounted';
import { useEventCallback } from '@mui/material';

export const enum SectionStatus {
  pending = 'pending',
  loading = 'loading',
  success = 'success',
  error = 'error',
}

export interface SectionProps {
  visible: boolean;
  visibleDelay?: number;
  invisibleDelay?: number;
  header?: ReactNode;
  children?: ReactNode;
  error: unknown;
  errorMessage?: ReactNode;
  errorTitle: string;
  errorPrompt: string;
  errorWithChildren?: boolean;
  onVisible?: () => void;
  onInvisible?: () => void;
  onFullyVisible?: () => void;
  onFullyInvisible?: () => void;
}

export default function Section ({
  visible,
  visibleDelay = 0,
  invisibleDelay = 0,
  header,
  error,
  errorPrompt,
  errorTitle,
  errorMessage,
  errorWithChildren = false,
  onVisible,
  onInvisible,
  onFullyVisible,
  onFullyInvisible,
  children,
}: SectionProps) {
  const [internalVisible, setInternalVisible] = useState(visible);
  const timeoutHandler = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    let h: ReturnType<typeof setTimeout> | undefined;
    if (internalVisible && !visible && invisibleDelay > 0) {
      h = timeoutHandler.current = setTimeout(whenMounted(() => {
        setInternalVisible(visible);
        onInvisible?.();
      }), invisibleDelay);
    } else if (!internalVisible && visible && visibleDelay > 0) {
      h = timeoutHandler.current = setTimeout(whenMounted(() => {
        setInternalVisible(visible);
        onVisible?.();
      }), visibleDelay);
    } else {
      clearTimeout(timeoutHandler.current);
      setInternalVisible(visible);
      if (visible) {
        onVisible?.();
      } else {
        onInvisible?.();
      }
    }
    return () => {
      clearTimeout(h);
    };
  }, [internalVisible, visible]);

  const handleTransitionEnd: TransitionEventHandler = useEventCallback((e) => {
    if (e.propertyName === 'opacity') {
      if (internalVisible) {
        onFullyVisible?.();
      } else {
        onFullyInvisible?.();
      }
    }
  });

  const renderErrorBlock = () => {
    if (notFalsy(error)) {
      return (
        <ErrorBlock
          title={errorTitle}
          prompt={errorPrompt}
          error={getErrorMessage(error)}
          severity="error"
          sx={{ mb: 1 }}
          showSuggestions
        >
          {errorMessage}
        </ErrorBlock>
      );
    }
  };

  const renderChildren = () => {
    if (notFalsy(error)) {
      if (errorWithChildren) {
        return children;
      }
    } else {
      return children;
    }
  };

  const whenMounted = useWhenMounted();

  return (
    <SectionRoot
      className={clsx({
        [sectionClasses.visible]: internalVisible,
      })}
      onTransitionEnd={handleTransitionEnd}
    >
      <SectionContainer>
        <SectionHeader>
          {header}
        </SectionHeader>
        <SectionBody>
          {renderErrorBlock()}
          {renderChildren()}
        </SectionBody>
      </SectionContainer>
    </SectionRoot>
  );
}
