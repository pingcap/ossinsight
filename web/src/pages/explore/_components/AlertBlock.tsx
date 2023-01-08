import React, { ReactNode } from 'react';
import { Alert, AlertColor, Box, IconButton, Stack, styled, Typography, useEventCallback } from '@mui/material';
import { SxProps } from '@mui/system';
import { createIssueLink } from '@site/src/utils/gh';
import { Cached, ContactSupport, GitHub } from '@mui/icons-material';
import { RecommendedSuggestions } from '@site/src/pages/explore/_components/Suggestions';

interface AlertBlockProps {
  severity: AlertColor;
  sx?: SxProps;
  createIssueUrl?: () => string;
  showSuggestions?: boolean;
  children: ReactNode;
}

export default function AlertBlock ({ severity, sx, children, createIssueUrl = () => createIssueLink('pingcap/ossinsight'), showSuggestions }: AlertBlockProps) {
  const handleJumpFaq = useEventCallback(() => {
    document.getElementById('data-explorer-faq')?.scrollIntoView({
      behavior: 'smooth',
    });
  });

  const report = useEventCallback(() => {
    window.open(createIssueUrl(), '_blank');
  });

  return (
    <>
      <StyledAlert
        sx={sx}
        variant="outlined"
        severity={severity}
      >
        <Typography variant="body1">
          {children}
        </Typography>
        <Stack direction="row" spacing={2} mt={2}>
          <AlertButton onClick={handleJumpFaq}>
            <ContactSupport fontSize="inherit" sx={{ mr: 0.5 }} />
            <span>See faq</span>
          </AlertButton>
          <AlertButton onClick={report}>
            <GitHub fontSize="inherit" sx={{ mr: 0.5 }} />
            <span>Feedback</span>
          </AlertButton>
        </Stack>
      </StyledAlert>
      {showSuggestions && (
        <SuggestionsContainer>
          <RecommendedSuggestions
            title={(reload, loading) => (
              <Box component="p" m={0} mt={2} height="40px">
                How about try other questions? <IconButton onClick={reload} disabled={loading}><Cached /></IconButton>
              </Box>
            )}
            n={5}
            variant="text"
          />
        </SuggestionsContainer>
      )}
    </>
  );
}

const StyledAlert = styled(Alert)`
  background: #18191A;
  border-color: transparent;
`;

const SuggestionsContainer = styled('div')`
  margin-top: 16px;
`;

const AlertButton = styled('button')`
  appearance: none;
  border: none;
  outline: none;
  background: none;
  color: #fff;
  opacity: 0.5;
  font-size: inherit;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 0;
  margin-left: 16px;
  transition: ${({ theme }) => theme.transitions.create('opacity')};

  &:hover, &:focus {
    opacity: 0.7;
  }
  
  &:first-of-type {
    margin-left: 0;
  }
`;
