import { RecommendedSuggestions } from '@site/src/pages/explore/_components/Suggestions';
import { Divider, IconButton, styled, Typography } from '@mui/material';
import { ArrowForward, Cached } from '@mui/icons-material';
import React from 'react';
import Link from '@docusaurus/Link';
import TiDBCloudLink from '@site/src/components/TiDBCloudLink';

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
      <Divider orientation="horizontal" sx={{ my: 2 }} />
      <TiDBCloudLink as={StyledLink}>
        Check out <b>Chat2Query</b> to empower any dataset you want.
        <ArrowForward fontSize="inherit" sx={{
          verticalAlign: 'text-bottom',
          ml: 0.5,
        }} />
      </TiDBCloudLink>
      <Details>
        *Chat2Query: an AI-powered querying tool in TiDB Cloud that generates SQL for your queries.
      </Details>
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
  border-radius: 6px;
  background: linear-gradient(90deg, rgba(67, 142, 255, 0.15) 0%, rgba(132, 56, 255, 0.15) 106.06%);
  opacity: 0.8;
  box-shadow: ${({ theme }) => theme.shadows[0]};

  &:hover {
    opacity: 1;
    box-shadow: ${({ theme }) => theme.shadows[6]};
  }

  transition: ${({ theme }) => theme.transitions.create(['opacity', 'box-shadow'])};
`;

const Details = styled('p')`
  margin-top: 8px;
  font-size: 12px;
  color: #7c7c7c;
`;
