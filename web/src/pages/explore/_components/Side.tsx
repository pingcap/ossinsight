import { RecommendedSuggestions } from '@site/src/pages/explore/_components/Suggestions';
import { Box, Divider, IconButton, styled, Typography } from '@mui/material';
import { ArrowForward, Cached } from '@mui/icons-material';
import React, { useEffect, useState } from 'react';
import Link from '@docusaurus/Link';
import useQuestionManagement from '@site/src/pages/explore/_components/useQuestion';
import { useMemoizedFn } from 'ahooks';
import TiDBCloudLink from '@site/src/components/TiDBCloudLink';

export default function Side () {
  const { question } = useQuestionManagement();
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(false);
  }, [question?.id]);

  const wrapHandleClick = useMemoizedFn((handle: () => void) => () => {
    handle();
    setShow(true);
  });

  return (
    <SideRoot>
      <RecommendedSuggestions
        variant="text" n={4}
        title={(reload, loading) => (
          <Typography variant="h3" mb={0} fontSize={16}>
            💡 Get inspired
            <IconButton onClick={wrapHandleClick(reload)} disabled={loading}>
              <Cached fontSize="inherit" />
            </IconButton>
          </Typography>
        )}
      />
      {show && (
        <>
          <Divider orientation="horizontal" sx={{ my: 2 }} />
          <Box>
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
          </Box>
        </>
      )}
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

  &:hover {
    background-color: #3c3c3c;
  }
`;

const Details = styled('p')`
  margin-top: 8px;
  font-size: 12px;
  color: #7c7c7c;
`;
