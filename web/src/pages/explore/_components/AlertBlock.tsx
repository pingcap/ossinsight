import React, { forwardRef, ReactNode } from 'react';
import { Alert, AlertColor, Stack, styled, useEventCallback } from '@mui/material';
import { SxProps } from '@mui/system';
import { gotoAnchor } from '@site/src/utils/dom';
import { ContactSupport, GitHub } from '@mui/icons-material';

interface AlertBlockProps {
  severity: AlertColor;
  sx?: SxProps;
  createIssueUrl: () => string;
  children: ReactNode;
}

const AlertBlock = forwardRef<HTMLDivElement, AlertBlockProps>(function ({ createIssueUrl, severity, sx, children }, ref) {
  const report = useEventCallback(() => {
    window.open(createIssueUrl(), '_blank');
  });

  return (
    <>
      <StyledAlert
        sx={sx}
        variant="outlined"
        severity={severity}
        ref={ref}
      >
        {children}
        <Stack direction="row" spacing={2} mt={2}>
          <AlertButton onClick={gotoAnchor('data-explorer-faq')}>
            <ContactSupport fontSize="inherit" sx={{ mr: 0.5 }} />
            <span>See FAQ</span>
          </AlertButton>
          <AlertButton onClick={report}>
            <GitHub fontSize="inherit" sx={{ mr: 0.5 }} />
            <span>Report an issue</span>
          </AlertButton>
        </Stack>
      </StyledAlert>
    </>
  );
});

export default AlertBlock;

const StyledAlert = styled(Alert)`
  background: #18191A;
  border-color: transparent;

  a {
    color: currentColor !important;
    text-decoration: underline !important;
  }
`;

const AlertButton = styled('button')`
  appearance: none;
  border: 1px solid #7c7c7c;
  border-radius: 6px;
  outline: none;
  background: none;
  color: #fff;
  opacity: 0.5;
  font-size: inherit;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 12px;
  transition: ${({ theme }) => theme.transitions.create(['opacity'])};

  &:hover, &:focus {
    opacity: 0.7;
  }

  &:not(:first-of-type) {
    margin-left: 16px;
  }
`;
