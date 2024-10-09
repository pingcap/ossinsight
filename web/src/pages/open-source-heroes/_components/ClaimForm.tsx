import { Box, Button, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, Skeleton, styled } from '@mui/material';
import { giftClientWithoutCache } from '@site/src/api/client';
import { TiDBCloudButton } from '@site/src/pages/open-source-heroes/_components/TiDBCloudButton';
import { useResponsiveAuth0 } from '@site/src/theme/NavbarItem/useResponsiveAuth0';
import { getErrorMessage } from '@site/src/utils/error';
import { useGtag } from '@site/src/utils/ga';
import { twitterLink } from '@site/src/utils/share';
import React, { type ReactNode, useEffect, useState } from 'react';
import { XIcon } from 'react-share';
import useSWR from 'swr';

type Check = {
  credits: string;
  githubId: number;
  isClaimed: boolean;
  isEligible: boolean;
};

type Tenant = {
  email: string;
  id: string;
  name: string;
};

export function ClaimForm () {
  const [claimedThisSession, setClaimedThisSession] = useState(false);
  const { getAccessTokenSilently } = useResponsiveAuth0();
  const { gtagEvent } = useGtag();

  const { data: check, mutate } = useSWR('/api/v1/serverless-credits-campaign/credits/check', async url => await giftClientWithoutCache.get<any, Check>(url, {
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${await getAccessTokenSilently({ connection: 'github' })}`,
    },
  }).then(res => {
    res = { ...res };
    res.credits = formatCredits(res.credits);
    return res;
  }));

  const { data: tenants } = useSWR('/api/v1/serverless-credits-campaign/tenants', async url => await giftClientWithoutCache.get<any, Tenant[]>(url, {
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${await getAccessTokenSilently({ connection: 'github' })}`,
    },
  }));

  const handleClaim = async (id: string) => {
    gtagEvent('github_campaign_claim', {});
    await giftClientWithoutCache.post('/api/v1/serverless-credits-campaign/credits/claim', {
      selectedTenantId: id,
    }, {
      headers: {
        Authorization: `Bearer ${await getAccessTokenSilently({ connection: 'github' })}`,
      },
    })
      .then(() => {
        setClaimedThisSession(true);
      })
      .finally(() => {
        void mutate();
      });
  };

  let children: ReactNode;

  if (check && tenants) {
    if (check.isClaimed) {
      if (claimedThisSession) {
        children = <ClaimedThisSession check={check} />;
      } else {
        children = <Claimed check={check} />;
      }
    } else if (check.isEligible) {
      if (tenants.length === 0) {
        children = <EligibleNoTenants check={check} />;
      } else {
        children = <Eligible check={check} onClaim={handleClaim} tenants={tenants} />;
      }
    } else {
      if (tenants.length === 0) {
        children = <NotEligibleNoTenant />;
      } else {
        children = <NotEligible tenants={tenants} />;
      }
    }

    // // DEBUG
    // children = (
    //   <>
    //     <ClaimedThisSession check={check} />
    //     <br />
    //     <Claimed check={check} />
    //     <br />
    //     <EligibleNoTenants check={check} />
    //     <br />
    //     <Eligible check={check} onClaim={handleClaim} tenants={tenants} />
    //     <br />
    //     <NotEligibleNoTenant />
    //     <br />
    //     <NotEligible tenants={tenants} />
    //     <br />
    //     <Checking />
    //   </>
    // );
  } else {
    children = <Checking />;
  }

  return (
    <ClaimFormContainer>
      {children}
    </ClaimFormContainer>
  );
}

function Checking () {
  return (
    <>
      <Skeleton variant="circular" width={117} height={117} />
      <Box mt={4} maxWidth="400px" width="100%" display="flex" flexDirection="column" gap={2} alignItems="center">
        <Skeleton sx={{ display: 'block' }} variant="rounded" width="50%" />
        <Skeleton sx={{ display: 'block' }} variant="rounded" width="70%" />
        <Skeleton sx={{ display: 'block' }} variant="rounded" width="60%" />
      </Box>
    </>
  );
}

function ClaimedThisSession ({ check }: { check: Check }) {
  const { user } = useResponsiveAuth0();

  return (
    <>
      {successIcon}
      <ClaimContent>
        Hi <em>{user?.nickname ?? user?.name}</em>
        <br />
        Successfully claimed <strong>{check.credits} in TiDB Serverless</strong> credits, you can go to
        <br />
        TiDB Cloud to check it out and use it.
      </ClaimContent>
      <Box sx={{ position: 'relative', width: 'max-content', maxWidth: '100%', mt: 8, display: 'flex', gap: 2, px: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <ShareButton />
        <TiDBCloudButton variant="contained" mt={0}>
          Start Building with TiDB Cloud!
        </TiDBCloudButton>
      </Box>
    </>
  );
}

function Claimed ({ check }: { check: Check }) {
  const { user } = useResponsiveAuth0();

  return (
    <>
      {successIcon}
      <ClaimContent>
        Hi <em>{user?.nickname ?? user?.name}</em>
        <br />
        Thanks for being an open-source hero and claiming <strong>{check.credits} in TiDB Serverless</strong> credits for your contributions to the open-source community.
        <br />
        We are proud of you! Share this great news with friends and start building something amazing together.
      </ClaimContent>
      <Box sx={{ position: 'relative', width: 'max-content', maxWidth: '100%', mt: 8, display: 'flex', gap: 2, px: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <ShareButton />
        <TiDBCloudButton variant="contained" mt={0}>
          Start Building with TiDB Cloud!
        </TiDBCloudButton>
      </Box>
    </>
  );
}

function NotEligible ({ tenants }: { tenants: Tenant[] }) {
  const { user } = useResponsiveAuth0();

  return (
    <>
      {badIcon}
      <ClaimContent>
        Hi <em>{user?.nickname ?? user?.name}</em>
        <br />
        Thanks for being an open-source hero! As a token of our appreciation, you have 25GB of free storage and 250 million reads available on TiDB Serverless.
        <br />
        Share this great news with your friends and start building something amazing together.
      </ClaimContent>
      <Box sx={{ position: 'relative', width: 'max-content', maxWidth: '100%', mt: 8, display: 'flex', gap: 2, px: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <ShareButton />
        <TiDBCloudButton mt={0} variant="contained">
          Login to TiDB Cloud
        </TiDBCloudButton>
      </Box>
    </>
  );
}

function NotEligibleNoTenant () {
  const { user } = useResponsiveAuth0();

  return (
    <>
      {badIcon}
      <ClaimContent>
        Hi <em>{user?.nickname ?? user?.name}</em>
        <br />
        Want to try TiDB Serverless for free?
        <br />
        Create a new TiDB Cloud account and enjoy 25GB of free storage to start building your applications.
      </ClaimContent>
      <Box sx={{ position: 'relative', width: 'max-content', maxWidth: '100%', mt: 8, display: 'flex', gap: 2, px: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TiDBCloudButton mt={0} variant="contained">
          Create TiDB Cloud Account
        </TiDBCloudButton>
        <ShareButton />
      </Box>
    </>
  );
}

function EligibleNoTenants ({ check }: { check: Check }) {
  const { user } = useResponsiveAuth0();

  return (
    <>
      {starIcon}
      <ClaimContent>
        Hi <em>{user?.nickname ?? user?.name}</em>
        <br />
        Awesome! You&#39;re eligible for <strong>{check.credits} in TiDB Serverless</strong> credits for your contributions to the open-source community.
        <br />
        Create a new TiDB Cloud account and your credits will be waiting for you.
      </ClaimContent>
      <TiDBCloudButton
        variant="contained"
        sx={{ background: 'white', mt: 8, '&:hover': { background: 'rgba(255,255,255,0.8)', color: 'black' } }}
      >
        Sign up to TiDB Cloud
      </TiDBCloudButton>
      <Button sx={{ mt: 4, px: 8 }} color="primary" variant="contained" disabled>
        Claim Credits
      </Button>
    </>
  );
}

function Eligible ({ tenants, check, onClaim }: { tenants: Tenant[], check: Check, onClaim: (id: string) => Promise<void> }) {
  const { user } = useResponsiveAuth0();
  const [value, setValue] = useState<string>('');
  const [claiming, setClaiming] = useState(false);
  const [, setClaimError] = useState<unknown>();

  useEffect(() => {
    if (tenants.length > 0) {
      setValue(tenants[0].id);
    } else {
      setValue('');
    }
  }, [tenants]);

  const handleClaim = () => {
    if (value) {
      setClaiming(true);
      onClaim(value)
        .catch(error => {
          alert(getErrorMessage(error));
          setClaimError(error);
        })
        .finally(() => {
          setClaiming(false);
        });
    }
  };

  return <>
    {starIcon}
    <ClaimContent>
      Hi <em>{user?.nickname ?? user?.name}</em>
      <br />
      Congratulations! You&#39;re eligible for <strong>{check.credits} in TiDB Serverless</strong> credits for your contributions to the open-source community.
      <br />
      Please select your existing TiDB Cloud account to apply these credits.
    </ClaimContent>
    <FormControl sx={{ mt: 8 }} disabled={claiming}>
      <FormLabel sx={{ fontSize: 18 }}>Select your TiDB Cloud account to claim the credits</FormLabel>
      <RadioGroup
        sx={{ mt: 4 }}
        value={value}
        onChange={(_, value) => setValue(value)}
      >
        {tenants.map(tenant => (
          <FormControlLabel
            key={tenant.id}
            sx={{
              '&:not(:first-of-type)': {
                mt: 2,
              },
              marginLeft: 'unset',
              marginRight: 'unset',
              background: 'white',
              borderRadius: 1,
              color: 'black',
              py: 1,
            }}
            value={tenant.id}
            label={(
              <>
                <TenantName>{tenant.name}</TenantName>
                <TenantEmail>{tenant.email}</TenantEmail>
              </>
            )}
            control={<Radio sx={{ color: 'black', '&.Mui-checked': { color: 'black' } }} />}
          />
        ))}
      </RadioGroup>
    </FormControl>
    <Button sx={{ mt: 8, px: 8 }} color="primary" variant="contained" disabled={claiming || !value} onClick={handleClaim}>
      Claim Credits
    </Button>
  </>;
}

function ShareButton ({ check }: { check?: Check }) {
  let title: string;
  let url: string;
  const hashtags = ['TiDB', 'OpenSource', 'CloudComputing'];

  if (check?.isClaimed) {
    title = `I just claimed ${check.credits} in TiDB Serverless credits for my open-source contributions! Proud to be an open-source hero. Curious about your own GitHub contributions? See how many free TiDB Serverless credits you can claim: `;
    url = 'https://ossinsight.io/open-source-heroes/?utm_source=twitter&utm_medium=social&utm_campaign=plg_OSScontribution_credit_05';
  } else {
    title = 'Excited to share that I received 25GB of free storage and 250 million reads on TiDB Serverless for my open-source contributions! Want to know how many free TiDB Serverless credits your GitHub contributions can earn? Check it out: ';
    url = 'https://ossinsight.io/open-source-heroes/?utm_source=twitter&utm_medium=social&utm_campaign=plg_OSScontribution_credit_05';
  }

  return (
    <Button component="a" sx={{ position: [undefined, undefined, 'absolute'], left: [undefined, undefined, '100%'], whiteSpace: 'nowrap', color: 'white !important' }} target="_blank" href={twitterLink(url, {
      title,
      hashtags,
    })}>
      {'Share via '}
      <XIcon round size={24} bgStyle={{ fill: 'transparent' }} iconFillColor="white" />
    </Button>
  );
}

const ClaimFormContainer = styled('div')`
  background: #212122;
  min-height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24;
`;

const ClaimContent = styled('div')`
  text-align: center;
  font-size: 36px;
  font-weight: 400;
  line-height: 50px;
  max-width: 1200px;
  margin: 0 auto;

  strong {
    font-weight: 700;
    color: #FFE895;
  }

  em {
    color: #73D9B4;
    font-style: normal;
  }
`;

const TenantName = styled('div')`

`;

const TenantEmail = styled('div')`
  color: ${({ theme }) => theme.palette.grey['500']};
  font-size: 12px;
`;

const starIcon = <svg style={{ display: 'block', margin: '0 auto' }} width="117" height="117" viewBox="0 0 117 117" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="58.5" cy="58.5" r="58.5" fill="#EEC73B" />
  <path
    d="M51.1671 26.5293L45.4849 37.9682C45.1446 38.6605 44.4873 39.1352 43.7136 39.2464L31.0114 41.0826C24.3061 42.0505 21.6234 50.2407 26.4782 54.939L35.6704 63.8331C36.2251 64.3727 36.4768 65.1461 36.3463 65.8986L34.1741 78.4768C33.0368 85.1179 40.0404 90.1751 46.0396 87.0398L57.4016 81.1119C57.7394 80.9355 58.1154 80.8433 58.497 80.8433C58.8787 80.8433 59.2546 80.9355 59.5924 81.1119L70.9521 87.0491C76.9536 90.182 83.9666 85.1202 82.8199 78.4838L80.6477 65.9102C80.5149 65.1484 80.7666 64.3819 81.3236 63.8401L90.5228 54.9367C95.3753 50.2407 92.695 42.0505 85.9896 41.0826L73.2828 39.2464C72.9051 39.191 72.5466 39.0453 72.2381 38.8218C71.9295 38.5984 71.6802 38.3039 71.5115 37.9636L65.834 26.5293C62.8274 20.4902 54.1736 20.4902 51.1671 26.5293ZM60.6086 29.0949L66.2908 40.5292C66.8776 41.7092 67.7438 42.7302 68.8151 43.5046C69.8864 44.2789 71.1307 44.7835 72.4414 44.9751L85.1506 46.8114C85.5845 46.8736 85.9922 47.0553 86.3276 47.3357C86.6631 47.6162 86.9128 47.9844 87.0486 48.3985C87.1844 48.8127 87.2008 49.2563 87.0961 49.6792C86.9913 50.1022 86.7695 50.4876 86.4558 50.7918L77.2566 59.6952C76.3059 60.6149 75.595 61.7508 75.1853 63.0048C74.7755 64.2587 74.6793 65.5929 74.905 66.892L77.0771 79.4656C77.1505 79.895 77.1015 80.3362 76.9358 80.7394C76.7701 81.1426 76.4943 81.4918 76.1395 81.7475C75.7846 82.0032 75.3649 82.1553 74.9277 82.1866C74.4905 82.218 74.0531 82.1272 73.665 81.9247L62.303 75.9853C61.1295 75.3727 59.8238 75.0527 58.4982 75.0527C57.1726 75.0527 55.8669 75.3727 54.6934 75.9853L43.329 81.9178C42.9403 82.1199 42.5024 82.2102 42.0648 82.1782C41.6272 82.1463 41.2073 81.9935 40.8524 81.737C40.4976 81.4806 40.222 81.1307 40.0567 80.7269C39.8914 80.3231 39.843 79.8814 39.9169 79.4517L42.0891 66.8827C42.3135 65.5843 42.2167 64.2512 41.807 62.9982C41.3973 61.7452 40.6871 60.6101 39.7374 59.6906L30.5453 50.7895C30.2308 50.4854 30.0084 50.0998 29.9033 49.6765C29.7981 49.2532 29.8144 48.8091 29.9502 48.3946C30.0861 47.98 30.3361 47.6115 30.672 47.3309C31.0078 47.0502 31.4161 46.8687 31.8504 46.8067L44.5573 44.9728C45.8713 44.7838 47.119 44.2789 48.192 43.5022C49.2651 42.7254 50.1311 41.7001 50.7149 40.5153L56.3924 29.0926C56.5861 28.7008 56.8865 28.3708 57.2595 28.1401C57.6325 27.9094 58.0631 27.7873 58.5024 27.7875C58.9418 27.7878 59.3722 27.9104 59.7449 28.1415C60.1177 28.3726 60.4177 28.7029 60.6109 29.0949H60.6086Z"
    fill="white" />
</svg>;

const badIcon = <svg width="117" height="117" viewBox="0 0 117 117" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="58.5" cy="58.5" r="58.5" fill="#04CB83" />
  <path
    d="M84.0378 48.4149C82.2492 46.0834 79.5263 44.7208 76.576 44.677L68.5364 44.552C69.1388 41.7267 69.3601 39.1889 69.1941 36.9761C68.9974 34.3321 68.2537 32.1193 66.9814 30.4129C66.1147 29.244 65.033 28.3439 63.7729 27.7501C62.4637 27.1313 61.3205 27 60.5891 27C56.1821 27 52.5987 30.3691 52.5987 34.5071C52.5987 41.2329 48.3453 46.7022 43.1085 46.7022H35.6713C33.0959 46.7022 31 48.8337 31 51.4528V77.2495C31 79.8685 33.0959 82 35.6713 82H72.0584C74.2588 82 76.4162 81.2499 78.1372 79.8935C79.8767 78.5246 81.106 76.5869 81.5977 74.4429L85.7588 56.2908C86.3919 53.5343 85.765 50.6652 84.0378 48.4149ZM40.902 77.4932H35.6713C35.5361 77.4932 35.4255 77.3807 35.4255 77.2432V51.4528C35.4255 51.3153 35.5361 51.2028 35.6713 51.2028H40.902V77.4932ZM81.4502 55.2657L77.289 73.4178C77.0247 74.5617 76.367 75.593 75.4328 76.3306C74.4801 77.0807 73.2877 77.4932 72.0645 77.4932H45.3274V50.9902C46.4829 50.7714 47.6016 50.3777 48.6834 49.8151C50.3491 48.9462 51.8304 47.7149 53.1027 46.1459C55.635 43.0143 57.0303 38.8826 57.0303 34.4946C57.0303 32.8382 58.6283 31.488 60.5952 31.488C60.7673 31.488 62.2793 31.5318 63.4533 33.1132C65.2297 35.5072 65.2788 40.1327 63.5885 46.1334C63.398 46.8085 63.5271 47.5336 63.9389 48.0961C64.3507 48.6587 64.9961 48.9962 65.6845 49.0025L76.5207 49.1713C78.1249 49.1963 79.6001 49.9276 80.5651 51.184C81.4625 52.3716 81.7821 53.8218 81.4502 55.2657Z"
    fill="white" />
</svg>;

const successIcon = <svg width="117" height="117" viewBox="0 0 117 117" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="58.5" cy="58.5" r="58.5" fill="#E6A1B5" />
  <path d="M51.7701 82C50.4492 82 49.1335 81.489 48.1258 80.4721L27.5076 59.5827C25.4975 57.5438 25.4975 54.2352 27.5076 52.1963C29.5229 50.1574 32.7861 50.1574 34.7963 52.1963L51.7701 69.3926L84.2037 36.5331C86.2138 34.489 89.477 34.489 91.4924 36.5331C93.5025 38.572 93.5025 41.8754 91.4924 43.9142L55.4145 80.4721C54.4068 81.489 53.0859 82 51.7701 82Z" fill="white" />
</svg>;

const nf = new Intl.NumberFormat('en');

const formatCredits = (value: string) => {
  return `$${nf.format(parseInt(value))} USD`;
};