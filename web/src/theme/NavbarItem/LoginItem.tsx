import React, { useEffect } from 'react';
import { Avatar, Box, ButtonBase, Menu, MenuItem, Skeleton, styled, useEventCallback } from '@mui/material';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import { Experimental } from '@site/src/components/Experimental';
import { useBoolean } from 'ahooks';
import { useAuth0 } from '@auth0/auth0-react';

const StyledButtonBase = styled(ButtonBase)`
  position: relative;
`;

const StyledAvatar = styled(Avatar)`
  width: 28px;
  height: 28px;
`;

function LoginButton () {
  const { loginWithPopup } = useAuth0();

  return (
    <StyledButtonBase
      disableRipple
      aria-label="login"
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onClick={loginWithPopup}
    >
      <StyledAvatar
        sx={{
          background: 'transparent',
          color: '#fff',
        }}
      >
        <LoginRoundedIcon />
      </StyledAvatar>
    </StyledButtonBase>
  );
}

export default function UserMenu () {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [open, { setTrue: handleOpen, setFalse: handleClose }] =
    useBoolean(false);

  const { user, isAuthenticated, isLoading, logout } = useAuth0();

  useEffect(() => {
    (window as any).gtag('set', { user_id: user?.sub });
  }, [user?.sub]);

  const handleGotoSubscriptionsPage = useEventCallback(() => {
    window.open('/subscriptions', '_blank');
  });

  if (isLoading) {
    return <Skeleton variant="circular" width={28} height={28} />;
  }

  if (!user && !isLoading) {
    return <LoginButton />;
  }

  return (
    <>
      {isAuthenticated && user && (
        <Box component="span">
          <StyledButtonBase
            disableRipple
            ref={setAnchorEl}
            onClick={handleOpen}
          >
            <StyledAvatar src={user?.picture} {...stringAvatar(user?.name)} />
          </StyledButtonBase>
          <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              'aria-labelledby': 'basic-button',
            }}
          >
            <Experimental feature="milestone-subscription">
              <MenuItem onClick={handleGotoSubscriptionsPage}>
                My Subscriptions
              </MenuItem>
            </Experimental>
            <MenuItem onClick={() => logout()}>Logout</MenuItem>
          </Menu>
        </Box>
      )}
    </>
  );
}

function stringAvatar (name = 'ossinsight') {
  const nameList = name.split(' ');
  const abbr: string[] = [];
  if (nameList.length > 1) {
    abbr.push(nameList[0][0]);
    abbr.push(nameList[1][0]);
  } else {
    abbr.push(nameList[0][0]);
    abbr.push(nameList[0][1]);
  }
  return {
    children: abbr.join('').toUpperCase(),
  };
}
