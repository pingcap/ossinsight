import { AnchorHTMLAttributes, createElement, FC, useContext, useMemo } from 'react';
import { coalesce, isNonemptyString, notNullish } from '@site/src/utils/value';
import { useResponsiveAuth0 } from '@site/src/theme/NavbarItem/useResponsiveAuth0';
import { User } from '@auth0/auth0-react';
import TiDBCloudLinkContext, { TiDBCloudLinkContextValues } from './context';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export interface TiDBCloudLinkProps extends TiDBCloudLinkContextValues, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'rel'> {
  as?: 'a' | FC<AnchorHTMLAttributes<HTMLAnchorElement>>;
}

export default function TiDBCloudLink ({ as = 'a', campaign: propCampaign, trial: propTrial, ...props }: TiDBCloudLinkProps) {
  const { user } = useResponsiveAuth0();
  const { campaign: ctxCampaign, trial: ctxTrail } = useContext(TiDBCloudLinkContext);
  const { siteConfig: { customFields } } = useDocusaurusContext();

  const { campaign, trial } = useMemo(() => {
    return {
      campaign: coalesce(isNonemptyString, propCampaign, ctxCampaign, undefined),
      trial: coalesce(notNullish, propTrial, ctxTrail, false),
    };
  }, [propCampaign, ctxCampaign, propTrial, ctxTrail]);

  const href = useMemo(() => {
    const url = new URL(`https://${customFields?.tidbcloud_host as string}/channel`);
    if (isNonemptyString(campaign)) {
      url.searchParams.set('utm_source', 'ossinsight');
      url.searchParams.set('utm_medium', 'referral');
      url.searchParams.set('utm_campaign', campaign);
    }
    if (trial) {
      const userInfo = getUserInfo(user);
      if (notNullish(userInfo)) {
        url.searchParams.set('email', userInfo.email);
        url.searchParams.set('connection', userInfo.connection);
      }
    }
    return url.toString();
  }, [user, campaign, trial]);

  return createElement(as, {
    href,
    target: '_blank',
    rel: 'noopener',
    ...props,
  });
}

function getUserInfo (user: User | undefined): { email: string, connection: string } | undefined {
  if (notNullish(user) && isNonemptyString(user.email) && isNonemptyString(user.sub)) {
    let connection: string;
    switch (user.sub.split('|')[0]) {
      case 'github':
        connection = 'github';
        break;
      case 'google-oauth2':
        connection = 'google';
        break;
      case 'windowslive':
        connection = 'microsoft';
        break;
      default:
        return undefined;
    }

    return {
      email: user.email,
      connection,
    };
  }
  return undefined;
}
