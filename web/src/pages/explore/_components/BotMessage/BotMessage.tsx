import React, { ReactNode } from 'react';
import { Stack } from '@mui/material';
import BotIcon from '@site/src/pages/explore/_components/BotIcon';

export interface BotMessageProps {
  animated?: boolean;
  botMt?: number | string;
  children?: ReactNode;
}

export default function BotMessage ({ animated = false, botMt, children }: BotMessageProps) {
  return (
    <Stack direction='row' spacing={1}>
      <BotIcon animated={animated} sx={{ minWidth: '16px', mt: botMt }} />
      <div>
        {children}
      </div>
    </Stack>
  );
}
