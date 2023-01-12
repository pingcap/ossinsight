import { RecommendedSuggestions } from '@site/src/pages/explore/_components/Suggestions';
import { Box, Divider, IconButton, styled, Typography } from '@mui/material';
import { ArrowForward, Cached } from '@mui/icons-material';
import React, { useEffect, useState } from 'react';
import Link from '@docusaurus/Link';
import useQuestionManagement from '@site/src/pages/explore/_components/useQuestion';
import { useMemoizedFn } from 'ahooks';

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
            <ColoredLink to="/blog/chat2query-tutorials">
              Get hands-on with your data <ArrowForward color="inherit" />
            </ColoredLink>
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
