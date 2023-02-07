import React, { CSSProperties, forwardRef, ReactNode } from 'react';
import { SectionBody, SectionContainer, SectionHeader, SectionRoot } from '@site/src/pages/explore/_components/Section/styled';
import { notFalsy } from '@site/src/utils/value';
import ErrorBlock from '@site/src/pages/explore/_components/ErrorBlock';
import { Collapse } from '@mui/material';
import { QuestionErrorType } from '@site/src/api/explorer';

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
  errorIn?: boolean;
  errorMessage?: ReactNode;
  onErrorMessageStart?: () => void;
  onErrorMessageReady?: () => void;
  afterErrorBlock?: ReactNode;
  issueTemplate?: QuestionErrorType;
  errorWithChildren?: boolean;
}

const Section = forwardRef<HTMLElement, SectionProps>(({
  className,
  style,
  header,
  error,
  errorIn = true,
  errorMessage,
  afterErrorBlock,
  onErrorMessageStart,
  onErrorMessageReady,
  errorWithChildren = false,
  children,
}: SectionProps, ref) => {
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
          <Collapse in={errorIn} timeout="auto" unmountOnExit onEnter={onErrorMessageStart} onEntered={onErrorMessageReady}>
            <div>
              <ErrorBlock
                severity="error"
                sx={{ mb: 2 }}
              >
                {errorMessage}
              </ErrorBlock>
              {afterErrorBlock}
            </div>
          </Collapse>
          {renderChildren()}
        </SectionBody>
      </SectionContainer>
    </SectionRoot>
  );
});

export default Section;
