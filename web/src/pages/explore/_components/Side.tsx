import { RecommendedSuggestions } from '@site/src/pages/explore/_components/Suggestions';
import { Box, Divider, IconButton, styled, Typography } from '@mui/material';
import { Cached } from '@mui/icons-material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import React from 'react';
import Link from '@docusaurus/Link';

export default function Side () {
  return (
    <SideRoot>
      <RecommendedSuggestions
        variant="text" n={4}
        title={(reload, loading) => (
          <Typography variant="h3" mb={0} fontSize={16}>
            <KeyboardDoubleArrowLeftIcon fontSize="medium" sx={{ verticalAlign: 'middle' }} />
            Get inspired
            <IconButton onClick={reload} disabled={loading}>
              <Cached fontSize="inherit" />
            </IconButton>
          </Typography>
        )}
      />
      <Divider orientation="horizontal" sx={{ my: 2 }} />
      <Box>
        <StyledLink to="/blog/chat2query-tutorials" target='_blank'>
          🧐 GitHub data is just the beginning. Uncover hidden insights in your <b>OWN</b> data!
          <ArrowForwardIcon fontSize='inherit' sx={{
            verticalAlign: 'text-bottom',
            ml: 0.5,
          }} />
        </StyledLink>
      </Box>
    </SideRoot>
  );
}

const SideRoot = styled('div')`
  position: sticky;
  top: 92px;
`;

const StyledLink = styled(Link)`
  display: block;
  color: white !important;
  text-decoration: none !important;
  margin-top: 20px;
  font-size: 14px;
  padding: 8px 12px;
  background-color: #2c2c2c;
  border-radius: 6px;

  &:hover {
    background-color: #3c3c3c;    
  }
`;
