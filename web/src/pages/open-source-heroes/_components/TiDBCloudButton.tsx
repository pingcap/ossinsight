import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { Button } from '@mui/material';
import type { ButtonProps } from '@mui/material/Button';
import React, { type ReactNode } from 'react';

const utm = '?utm_source=ossinsight&utm_medium=referral&utm_campaign=plg_OSScontribution_credit_05';

export function TiDBCloudButton ({ children, trial = true, mt, ...props }: { children: ReactNode, mt?: number, trial?: boolean } & Pick<ButtonProps<'a'>, 'sx' | 'color' | 'variant'>) {
  const {
    siteConfig: { customFields },
  } = useDocusaurusContext();

  return (
    <Button
      sx={{ mt, px: 8, textDecoration: 'underline', '&:hover': props.variant !== 'text' ? { color: '#1C1E21' } : {} }}
      color="primary"
      variant="outlined"
      {...props}
      component="a"
      href={`https://${customFields?.tidbcloud_host as string}` + (trial ? '/free-trial/' : '/') + utm}
      target="_blank"
    >
      {children}
    </Button>
  );
}
