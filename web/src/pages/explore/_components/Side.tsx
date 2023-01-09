import { RecommendedSuggestions } from '@site/src/pages/explore/_components/Suggestions';
import { Box, Divider, IconButton, styled, Typography } from '@mui/material';
import { ArrowLeft, ArrowRightAlt, Cached } from '@mui/icons-material';
import React from 'react';
import { array } from '@site/src/utils/generate';
import Link from '@docusaurus/Link';

export default function Side () {
  return (
    <SideRoot>
      <RecommendedSuggestions
        variant="text" n={4}
        title={(reload, loading) => (
          <Typography variant="h3" mb={0} fontSize={16}>
            <Arrows />
            Get inspired
            <IconButton onClick={reload} disabled={loading}>
              <Cached fontSize="inherit" />
            </IconButton>
          </Typography>
        )}
      />
      <Divider orientation="horizontal" sx={{ my: 2 }} />
      <Box>
        <ColoredLink to="/blog/chat2query-tutorials">
          Get hands-on with your data <ArrowRightAlt color="inherit" />
        </ColoredLink>
        <Details>
          Get hands-on with your data Get hands-on with your data
        </Details>
      </Box>
    </SideRoot>
  );
}

function Arrows () {
  return (
    <>
      {array(3).map(i => (
        <StyledArrow key={i} color="primary" fontSize="inherit" sx={{ verticalAlign: 'text-bottom' }} />
      ))}
    </>
  );
}

const SideRoot = styled('div')`
  position: sticky;
  top: 92px;
`;

const StyledArrow = styled(ArrowLeft)`
  vertical-align: text-bottom;
  margin-left: -12px;

  &:first-of-type {
    margin-left: -6px;
  }
`;

const ColoredLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  font-size: 14px;
  background: linear-gradient(90deg, #BAC1FD 0%, #DAC4FF 106.06%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;

  &, &:hover, &:visited, &:active {
    color: #DAC4FF;
  }
`;

const Details = styled('p')`
  margin-top: 8px;
  font-size: 12px;
`;
