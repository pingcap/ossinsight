import { Button, Container, Typography } from '@mui/material';
import React, { useState } from 'react';
import { giftClientWithoutCache } from '@site/src/api/client';
import { useRequireLogin } from '@site/src/context/user';

export function ClaimCredits () {
  const [email, setEmail] = useState();
  const requireLogin = useRequireLogin();
  const handleClick = async () => {
    let accessToken: string;
    try {
      accessToken = await requireLogin('gift');
    } catch (e) {
      console.error('Failed to get the access token.', e);
      return;
    }

    const res = await giftClientWithoutCache.post<any, any>(
      '/api/v1/credits/claim',
      {},
      {
        withCredentials: true,
        oToken: accessToken,
      },
    );

    setEmail(res?.metadata?.email);
  };

  return (<>
    <Container maxWidth="sm" sx={{ pt: 6, pb: 12 }}>
        <Typography variant="h1" mb={4}>
            My Gift
        </Typography>
        <Button
            variant="contained"
            onClick={() => {
              handleClick().catch((err) => {
                console.error(err);
                alert('Failed to claim your gift');
              });
            }}>
            Claim
        </Button>
        <p>{email}</p>
    </Container>
    </>);
}
