import React, { CSSProperties, forwardRef, ReactNode } from 'react';
import { SectionBody, SectionContainer, SectionHeader, SectionRoot } from '@site/src/pages/explore/_components/Section/styled';
import { notFalsy } from '@site/src/utils/value';
import ErrorBlock from '@site/src/pages/explore/_components/ErrorBlock';
import { getErrorMessage } from '@site/src/utils/error';

export const enum SectionStatus {
  pending = 'pending',
  loading = 'loading',
  success = 'success',
  error = 'error',
}

export interface SectionProps {
  className?: string;
  style?: CSSProperties;
  header?: ReactNode;
  children?: ReactNode;
  error: unknown;
  errorMessage?: ReactNode;
  errorTitle: string;
  errorPrompt: string;
  errorWithChildren?: boolean;
}

const Section = forwardRef<HTMLElement, SectionProps>(({
  className,
  style,
  header,
  error,
  errorPrompt,
  errorTitle,
  errorMessage,
  errorWithChildren = false,
  children,
}: SectionProps, ref) => {
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

  return (
    <SectionRoot
      className={className}
      style={style}
      ref={ref}
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
});

export default Section;
