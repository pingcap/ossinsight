import React, { ReactNode } from 'react';
import { Backdrop, Button, styled } from '@mui/material';
import { SxProps } from '@mui/system';
import { useResponsiveAuth0 } from '@site/src/theme/NavbarItem/useResponsiveAuth0';

interface LoginRequiredProps {
  promote: string;
  sx?: SxProps;
  children: ReactNode;
}

export function LoginRequired ({ promote, sx, children }: LoginRequiredProps) {
  const { isAuthenticated, login } = useResponsiveAuth0();

  return (
    <LoginRequiredContainer sx={sx}>
      {children}
      <Backdrop
        open={!isAuthenticated}
        sx={{ position: 'absolute', backdropFilter: 'blur(2px)', zIndex: 2 }}
      >
        <Button
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onClick={login}
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
