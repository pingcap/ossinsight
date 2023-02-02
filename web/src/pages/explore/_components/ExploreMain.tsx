import { Box, NoSsr } from '@mui/material';
import Execution, { ExecutionProps } from '@site/src/pages/explore/_components/Execution';
import RecommendList from '@site/src/pages/explore/_components/RecommendList';
import SwitchLayout from '@site/src/pages/explore/_components/SwitchLayout';
import React from 'react';

export interface ExploreMainProps extends ExecutionProps {
  state: 'recommend' | 'execution';
}

export default function ExploreMain ({ state, ...props }: ExploreMainProps) {
  return (
    <SwitchLayout state={state} direction={state === 'recommend' ? 'down' : 'up'}>
      <Box key="execution" sx={{ mt: 1.5 }}>
        <NoSsr>
          <Execution {...props} />
        </NoSsr>
      </Box>
      <Box key="recommend" sx={{ mt: 4 }}>
        <RecommendList />
      </Box>
    </SwitchLayout>
  );
}
