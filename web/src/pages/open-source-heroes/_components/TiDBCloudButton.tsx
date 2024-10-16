import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { Button } from '@mui/material';
import type { ButtonProps } from '@mui/material/Button';
import React, { type ReactNode, useState } from 'react';

const utm = '?utm_source=ossinsight&utm_medium=referral&utm_campaign=plg_OSScontribution_credit_05';

interface TiDBCloudButtonProps extends Pick<ButtonProps<'a'>, 'sx' | 'color' | 'variant' | 'onClick'> {
  children: ReactNode;
  mt?: number;
  trial?: boolean;
  link?: boolean;
  org?: number;
  pop?: boolean;
}

const chars = 'abcdef1234567890';

export function TiDBCloudButton ({
  children,
  trial = true,
  link,
  org,
  mt,
  pop = false,
  onClick,
  ...props
}: TiDBCloudButtonProps) {
  const [state] = useState(() => Array(6).fill(0).map(_ => chars[Math.round(Math.random() * (chars.length - 1))]).join(''));

  const {
    siteConfig: { customFields },
  } = useDocusaurusContext();

  let href = `https://${customFields?.tidbcloud_host as string}`;

  if (org != null) {
    href += `/console/clusters/?orgId=${org}`;
  } else if (link) {
    href += '/oauth/authorize/';
  } else if (trial) {
    href += '/free-trial/';
  } else {
    href += '/';
  }

  href += utm;

  if (link) {
    href += `&response_type=code&client_id=OSSInsight&scope=org:owner&state=${state}&redirect_uri=${encodeURIComponent(location.origin + '/open-source-heroes/tidbcloud/oauth/callback/')}`;
  }

  return (
    <Button
      sx={{ mt, px: 8, textDecoration: 'underline', '&:hover': props.variant !== 'text' ? { color: '#1C1E21' } : {} }}
      color="primary"
      variant="outlined"
      {...props}
      component="a"
      href={href}
      target="_blank"
      onClick={
        pop
          ? (event) => {
              onClick?.(event);
              if (!event.isDefaultPrevented()) {
                event.preventDefault();
                window.open(href, 'Connnect to TiDB Cloud', 'width=600,height=600,resizable,scrollbars=yes,status=1');
              }
            }
          : onClick}
    >
      {children}
    </Button>
  );
}
