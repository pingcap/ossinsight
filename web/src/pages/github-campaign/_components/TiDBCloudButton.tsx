import { Button } from '@mui/material';
import type { ButtonProps } from '@mui/material/Button';
import React, { type ReactNode } from 'react';

export const GIFT_TIDBCLOUD_BASE_URL = (process.env.GIFT_TIDBCLOUD_BASE_URL ?? '') || 'https://tidbcloud.com';

const utm = '?utm_source=ossinsight&utm_medium=referral&utm_campaign=plg_OSScontribution_credit_05';

export function TiDBCloudButton ({ children, trial = true, mt = 8, ...props }: { children: ReactNode, mt?: number, trial?: boolean } & Pick<ButtonProps<'a'>, 'sx' | 'color' | 'variant'>) {
  return (
    <Button
      sx={{ mt, px: 8, '&:hover': { color: '#1C1E21' } }}
      color="primary"
      variant="outlined"
      {...props}
      component="a"
      href={GIFT_TIDBCLOUD_BASE_URL + (trial ? '/free-trial/' : '/') + utm}
      target="_blank"
    >
      {children}
    </Button>
  );
}
