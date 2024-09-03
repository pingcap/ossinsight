// noinspection CssUnresolvedCustomProperty

import { Button } from '@mui/material';
import { ClaimForm } from '@site/src/pages/github-campaign/_components/ClaimForm';
import { Heading, HeadingContainer, HeadingDescription, HeadingLeft, HeadingLogos, HeadingPrompt, HeadingRight, HeadingSpacing, HeadingTitle, HeadingTitlePrefix } from '@site/src/pages/github-campaign/_components/Heading';
import { useResponsiveAuth0 } from '@site/src/theme/NavbarItem/useResponsiveAuth0';
import React, { useState } from 'react';

declare module 'react' {
  interface CSSProperties {
    '--color1'?: string;
    '--color2'?: string;
  }
}

export function HeadingSection () {
  const { user, isLoading, login } = useResponsiveAuth0();
  const [claiming, setClaiming] = useState(false);

  if (claiming) {
    return <ClaimForm />;
  } else {
    return <PrimaryHeading
      loading={isLoading}
      onClickAction={() => {
        if (isGithubSub(user?.sub)) {
          setClaiming(true);
        } else {
          void login({ connection: 'github' }).then(() => {
            setClaiming(true);
          });
        }
      }}
    />;
  }
}

function PrimaryHeading ({ loading, onClickAction }: { loading: boolean, onClickAction: () => void }) {
  return (
    <HeadingContainer>
      <Heading container columnSpacing={8} rowSpacing={0}>
        <HeadingLeft xs={12} md={7}>
          <div>
            <HeadingTitle>
              <HeadingTitlePrefix>Fuel Your Next Big Idea:</HeadingTitlePrefix>
              <br />
              TiDB Serverless Credits for Open Source Heroes
            </HeadingTitle>
            <HeadingDescription>
              TiDB loves open-source. We contribute code, sponsor projects arround open source community, such as OssInsight, and deeply appreciate developers who actively contribute to the communityhave.
              <br />
              As a token of our appreciation, we&#39;re offering up to $1000 in free TiDB Serverless credits to fuel open-source hero&#39;s next big idea.
            </HeadingDescription>
          </div>
        </HeadingLeft>
        <HeadingRight xs={12} md={5}>
          <HeadingPrompt>
            Simply log in with your GitHub account to calculate and claim your credits.
          </HeadingPrompt>
          <HeadingSpacing />
          <HeadingLogos>
            <img alt="OSSInsight Logo" src={require('../_components/ossi-logo.png').default} height={56} />
            <img alt="TiDB Logo" src={require('../_components/tidb-logo.png').default} height={68} />
          </HeadingLogos>
          <Button id='start-claim-trigger' disabled={loading} color="primary" variant="contained" onClick={() => {
            onClickAction();
          }}>
            Claim Your Credits Now
          </Button>
        </HeadingRight>
      </Heading>
    </HeadingContainer>
  );
}

function isGithubSub (sub: string | undefined) {
  if (!sub) {
    return false;
  }
  return sub.startsWith('github|');
}
