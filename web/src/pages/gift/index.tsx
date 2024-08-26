import CustomPage from '@site/src/theme/CustomPage';
import React, { useState } from 'react';
import { Button, Container, Typography } from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';

export default function Page () {
  const [email, setEmail] = useState();
  const { isLoading: userValidating, isAuthenticated: userValidated } = useAuth0();

  const handleClick = async () => {
    if (userValidated) {
      const res = await fetch('https:/gift.ossinsight.io/api/v1/credits/claim', {
        method: 'POST',
      });
      if (!res.ok) {
        alert('Failed to claim your gift');
        return;
      }
      const data = await res.json();
      setEmail(data?.metadata?.email);
    } else {
      alert('Please login to claim your gift');
    }
  };

  return (
    <CustomPage title="Gift for OSS Contributors">
      <Container maxWidth="sm" sx={{ pt: 6, pb: 12 }}>
        <Typography variant="h1" mb={4}>
          My Gift
        </Typography>
        <Button
          disabled={userValidating}
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
    </CustomPage>
  );
}
