import React, { ReactNode } from 'react';
import { Alert, AlertColor, Box, Button, IconButton, Stack, styled, Typography, useEventCallback } from '@mui/material';
import { SxProps } from '@mui/system';
import { createIssueLink } from '@site/src/utils/gh';
import { Cached, GitHub } from '@mui/icons-material';
import { RecommendedSuggestions } from '@site/src/pages/explore/_components/Suggestions';

interface AlertBlockProps {
  severity: AlertColor;
  sx?: SxProps;
  createIssueUrl?: () => string;
  showSuggestions?: boolean;
  children: ReactNode;
}

export default function AlertBlock ({ severity, sx, children, createIssueUrl = () => createIssueLink('pingcap/ossinsight'), showSuggestions }: AlertBlockProps) {
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
          <Button variant="outlined" size="small" color='inherit'>See faq</Button>
          <Button variant="outlined" size="small" startIcon={<GitHub />} onClick={report} color='inherit'>Feedback</Button>
        </Stack>
      </StyledAlert>
      {showSuggestions && (
        <SuggestionsContainer>
          <RecommendedSuggestions
            title={(reload, loading) => (
              <Box component='p' m={0} mt={2} height="40px">
                How about try other questions? <IconButton onClick={reload} disabled={loading}><Cached /></IconButton>
              </Box>
            )}
            n={3}
            aiGenerated
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

  & > div {
    display: flex;

    > * {
      flex: 1;
    }
  }

  ${({ theme }) => theme.breakpoints.down('md')} {
    & > div {
      flex-direction: column;
    }
  }
`;
