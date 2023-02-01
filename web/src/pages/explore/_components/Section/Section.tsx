import React, { ReactNode } from 'react';
import { SectionBody, sectionClasses, SectionContainer, SectionHeader, SectionRoot } from '@site/src/pages/explore/_components/Section/styled';
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
  status: SectionStatus;
  header?: ReactNode;
  children?: ReactNode;
  error: unknown;
  errorMessage?: ReactNode;
  errorTitle: string;
  errorPrompt: string;
  errorWithChildren?: boolean;
}

export default function Section ({
  status,
  header,
  error,
  errorPrompt,
  errorTitle,
  errorMessage,
  errorWithChildren = false,
  children,
}: SectionProps) {
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
      className={sectionClasses[status]}
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
