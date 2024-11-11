// noinspection CssUnresolvedCustomProperty

import { ArrowCircleRightOutlined } from '@mui/icons-material';
import { Button } from '@mui/material';
import { ClaimForm } from '@site/src/pages/open-source-heroes/_components/ClaimForm';
import { Heading, HeadingContainer, HeadingDescription, HeadingLogos, HeadingPrompt, HeadingSpacing, HeadingTitle, HeadingTitlePrefix, MobileHeading } from '@site/src/pages/open-source-heroes/_components/Heading';
import { useResponsiveAuth0 } from '@site/src/theme/NavbarItem/useResponsiveAuth0';
import { useGtag } from '@site/src/utils/ga';
import React, { useState } from 'react';
import GetCredits from './GetCredits.svg';

declare module 'react' {
  interface CSSProperties {
    '--color1'?: string;
    '--color2'?: string;
  }
}

declare global {
  interface Window {
    __trigger?: string | undefined;
  }
}

export function HeadingSection () {
  const { user, isLoading, login, getIdTokenClaims } = useResponsiveAuth0();
  const [claiming, setClaiming] = useState(false);
  const { gtagEvent } = useGtag();

  if (claiming) {
    return <ClaimForm />;
  } else {
    return <PrimaryHeading
      loading={isLoading}
      onClickAction={() => {
        const trigger = window.__trigger ?? 'cta-claim-top';
        window.__trigger = undefined;
        gtagEvent('github_campaign_action', { trigger_by: trigger });
        if (isGithubSub(user?.sub)) {
          setClaiming(true);
        } else {
          void login({ connection: 'github' }).then(async () => {
            const idc = await getIdTokenClaims();
            if (idc != null) {
              setClaiming(true);
            }
          });
        }
      }}
    />;
  }
}

function PrimaryHeading ({ loading, onClickAction }: { loading: boolean, onClickAction: () => void }) {
  return (
    <HeadingContainer>
      <Heading>
        <HeadingTitle>
          <HeadingTitlePrefix>Fuel Your Next Big Idea:</HeadingTitlePrefix>
          <br />
          TiDB Serverless Credits for Open Source Heroes
        </HeadingTitle>
        <HeadingDescription>
          TiDB loves open-source. We contribute code, sponsor projects and deeply appreciate developers who actively contribute to the community.
          <br />
          As a token of our appreciation, we&#39;re offering up to $2000 in free TiDB Serverless credits to fuel open-source hero&#39;s next big idea.
        </HeadingDescription>
        <HeadingPrompt>
          Simply log in with your GitHub account to calculate and claim your credits.
        </HeadingPrompt>
        <Button
          id="start-claim-trigger"
          sx={{ width: ['100%', '100%', 'max-content'], mt: 4, mx: 'auto', display: 'flex' }}
          disabled={loading}
          color="primary"
          variant="contained"
          onClick={() => {
            onClickAction();
          }}
        >
          Claim Your Credits Now
          <ArrowCircleRightOutlined sx={{ ml: 0.5 }} />
        </Button>
        <HeadingSpacing />
        <HeadingLogos>
          <span>Sponsored by</span>
          <img alt="TiDB Logo" src={require('../_components/tidb-logo.png').default} height={68} />
        </HeadingLogos>
        <div style={{ maxWidth: 812, margin: '0 auto' }}>
          <GetCredits style={{ width: '100%' }} />
        </div>
      </Heading>
      <MobileHeading>
        <h1><span>Free Database Credits</span> for Open Source Heroes</h1>
        <p>
          TiDB loves open-source. We contribute code, sponsor projects, and appreciate developers who do so.
          <br />
          As a token of our appreciation, we&#39;re offering up to $2000 free TiDB Serverless credits to fuel open-source hero&#39;s next big idea.
        </p>
        <p className="action-prompt">
          Log in with GitHub account to claim your credits.
        </p>
        <Button
          id="start-claim-trigger-mobile"
          disabled={loading}
          color="primary"
          variant="contained"
          onClick={() => {
            onClickAction();
          }}
        >
          Claim Now
          <ArrowCircleRightOutlined sx={{ ml: 0.5 }} />
        </Button>
      </MobileHeading>
    </HeadingContainer>
  );
}

function isGithubSub (sub: string | undefined) {
  if (!sub) {
    return false;
  }
  return sub.startsWith('github|');
}
