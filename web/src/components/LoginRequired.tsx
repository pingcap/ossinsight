import React, { ReactNode } from 'react';
import { Backdrop, Button, styled } from '@mui/material';
import { SxProps } from '@mui/system';
import { useUserInfoContext } from '@site/src/context/user';

interface LoginRequiredProps {
  promote: string;
  sx?: SxProps;
  children: ReactNode;
}

export function LoginRequired ({ promote, sx, children }: LoginRequiredProps) {
  const { validated, login } = useUserInfoContext();

  return (
    <LoginRequiredContainer sx={sx}>
      {children}
      <Backdrop open={!validated} sx={{ position: 'absolute', backdropFilter: 'blur(2px)', zIndex: 2 }}>
        <Button onClick={login}>{promote}</Button>
      </Backdrop>
    </LoginRequiredContainer>
  );
}

const LoginRequiredContainer = styled('div', { name: 'LoginRequiredContainer' })`
  position: relative;
`;
