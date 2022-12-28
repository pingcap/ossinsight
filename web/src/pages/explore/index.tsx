import CustomPage from '@site/src/theme/CustomPage';
import React, { useState } from 'react';
import ExploreSearch from '@site/src/pages/explore/_components/Search';
import { Box, Container, styled, Typography } from '@mui/material';
import Execution, { ExecutionContext } from '@site/src/pages/explore/_components/Execution';
import { notFalsy } from '@site/src/utils/value';
import Suggestions from '@site/src/pages/explore/_components/Suggestions';
import Faq from '@site/src/pages/explore/_components/Faq';
import Beta from './_components/beta.svg';
import { useExperimental } from '@site/src/components/Experimental';
import NotFound from '@theme/NotFound';

export default function Page () {
  const [value, setValue] = useState('');
  const [ec, setEc] = useState<ExecutionContext | null>(null);

  const [enabled] = useExperimental('explore-data');

  if (!enabled) {
    return <NotFound />;
  }

  return (
    <CustomPage>
      <Container maxWidth="lg" sx={{ pt: 8 }}>
        <Typography variant='h1' textAlign='center'>
          Data Explorer
          <StyledBeta />
        </Typography>
        <Typography variant='body2' textAlign='center' mt={1} mb={2} color='#7C7C7C'>Quickly get insights from your GitHub data with our easy-to-use Query Tool.</Typography>
        <ExploreSearch value={value} onChange={setValue} onAction={ec?.run} />
      </Container>
      {notFalsy(value)
        ? (
        <Container maxWidth="lg" sx={{ pb: 8 }}>
          <Execution search={value} ref={setEc} />
        </Container>
          )
        : (
        <Box py={4}>
          <Suggestions onSelect={setValue} />
        </Box>
          )}
      <Container maxWidth="lg" sx={{ pb: 8 }}>
        <Faq />
      </Container>
    </CustomPage>
  );
}

const StyledBeta = styled(Beta)`
  margin-left: 8px;
`;
