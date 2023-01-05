import { Accordion, AccordionDetails, AccordionSummary, Alert, CircularProgress, Paper, styled, useEventCallback } from '@mui/material';
import React, { ReactNode, useState } from 'react';
import { CheckCircle, Circle, ExpandMore } from '@mui/icons-material';
import { isFalsy, isNullish, notFalsy } from '@site/src/utils/value';
import { getErrorMessage } from '@site/src/utils/error';

export interface SectionProps {
  status: 'pending' | 'loading' | 'success';
  title: ReactNode;
  extra?: ReactNode;
  children: ReactNode;
  error: unknown;
  errorWithChildren?: boolean;
  defaultExpanded?: boolean;
}

export default function Section ({ status, title, defaultExpanded, extra, error, errorWithChildren = false, children }: SectionProps) {
  const [open, setOpen] = useState(false);
  const alwaysOpen = defaultExpanded === true;

  const handleOpenChange = useEventCallback((_, open: boolean) => {
    if (!alwaysOpen) {
      setOpen(open);
    }
  });

  return (
    <SectionContainer className={isNullish(error) ? status : 'error'} elevation={1}>
      <SectionAccordion expanded={alwaysOpen ? true : open} defaultExpanded={defaultExpanded} elevation={0} onChange={handleOpenChange}>
        <SectionAccordionSummary
          alwaysOpen={alwaysOpen}
          expandIcon={isFalsy(defaultExpanded) && <ExpandMore />}
          disabled={status === 'loading'}
        >
          <SectionTitle>
            {status === 'loading'
              ? <CircularProgress size={16} />
              : status === 'success' && isNullish(error)
                ? <CheckCircle color="success" fontSize="inherit" />
                : <Circle color="disabled" fontSize="inherit" />}
            <SectionTitleContent>
              {title}
            </SectionTitleContent>
            {notFalsy(extra)
              ? (
                <>
                  <Spacer />
                  <SectionTitleExtra>
                    {extra === 'auto' ? open ? 'Hide' : 'Show' : extra}
                  </SectionTitleExtra>
                </>
                )
              : undefined}
          </SectionTitle>
        </SectionAccordionSummary>
        <AccordionDetails>
          {errorWithChildren
            ? isNullish(error)
              ? children
              : (
                <>
                  <Alert severity="error" sx={{ mb: 1 }}>{getErrorMessage(error)}</Alert>
                  {children}
                </>
                )
            : isNullish(error) ? children : <Alert severity="error">{getErrorMessage(error)}</Alert>}
        </AccordionDetails>
      </SectionAccordion>
    </SectionContainer>
  );
}

const SectionContainer = styled(Paper)`
  background: linear-gradient(116.45deg, rgba(89, 95, 236, 0.5) 0%, rgba(200, 182, 252, 0.1) 96.73%);
  padding: 1px;
  border-radius: 6px;
  margin-top: 24px;

  transform: translateY(20px);
  opacity: 0;
  transition: all .5s ease;

  &:before {
    display: none;
  }

  &.loading {
    transform: initial;
    opacity: 0.4;
  }

  &.success {
    transform: initial;
    opacity: 1;
  }

  &.error {
    transform: initial;
    opacity: 1;
  }
`;

const SectionAccordion = styled(Accordion)`
  border: none;
  background: rgb(36, 35, 43);
  border-radius: 5px !important;
  padding: 4px 8px;
`;

const SectionAccordionSummary = styled(AccordionSummary, { shouldForwardProp: propName => propName !== 'alwaysOpen' })<{ alwaysOpen: boolean }>`
  .MuiAccordionSummary-content {
    margin-top: 4px;
    margin-bottom: 4px;
  }

  ${({ alwaysOpen }) => alwaysOpen ? 'cursor: default !important;' : ''}
`;

const SectionTitle = styled('h2')`
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  text-align: left;
  display: flex;
  align-items: center;
  margin: 0;
  width: 100%;
`;

const SectionTitleExtra = styled('span')`
  color: #d7d7d7;
  font-weight: normal;
`;

export const SectionTitleContent = styled('span')`
  margin-left: 8px;
`;

const Spacer = styled('span')`
  flex: 1;
`;
