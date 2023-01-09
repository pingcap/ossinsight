import React, { ReactNode } from 'react';
import { Backdrop, Button, styled } from '@mui/material';
import { SxProps } from '@mui/system';
import { useAuth0 } from '@auth0/auth0-react';

interface LoginRequiredProps {
  promote: string;
  sx?: SxProps;
  children: ReactNode;
}

export function LoginRequired ({ promote, sx, children }: LoginRequiredProps) {
  const { isAuthenticated, loginWithPopup } = useAuth0();

  return (
    <LoginRequiredContainer sx={sx}>
      {children}
      <Backdrop
        open={!isAuthenticated}
        sx={{ position: 'absolute', backdropFilter: 'blur(2px)', zIndex: 2 }}
      >
        <Button
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onClick={loginWithPopup}
        >
          {promote}
        </Button>
      </Backdrop>
    </LoginRequiredContainer>
  );
}

const LoginRequiredContainer = styled('div', { name: 'LoginRequiredContainer' })`
  position: relative;
`;
