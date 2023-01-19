import { RecommendedSuggestions } from '@site/src/pages/explore/_components/Suggestions';
import { Divider, IconButton, styled, Typography } from '@mui/material';
import { Cached } from '@mui/icons-material';
import React from 'react';
import Ads from '@site/src/pages/explore/_components/Ads';
import Link from '@docusaurus/Link';

export default function Side () {
  return (
    <SideRoot>
      <RecommendedSuggestions
        variant="text" n={4}
        title={(reload, loading) => (
          <Typography variant="h3" mb={0} fontSize={16}>
            💡 Get inspired
            <IconButton onClick={reload} disabled={loading}>
              <Cached fontSize="inherit" />
            </IconButton>
          </Typography>
        )}
      />
      <StyledLink to='/explore/'>&gt; See more</StyledLink>
      <Divider orientation="horizontal" sx={{ my: 2 }} />
      <Ads size='small' />
    </SideRoot>
  );
}

const SideRoot = styled('div')`
  position: sticky;
  top: 92px;
`;

const StyledLink = styled(Link)`
  font-size: 14px;
`;
