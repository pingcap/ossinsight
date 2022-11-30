import React, { useState } from 'react';
import { useUserInfo } from '@site/src/api/user';
import { Avatar, Backdrop, ButtonBase, CircularProgress, Menu, MenuItem, styled, useEventCallback } from '@mui/material';

export default function LoginItem () {
  const { userInfo, validating, logout } = useUserInfo();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [open, setOpen] = useState(false);

  const handleOpen = useEventCallback(() => {
    setOpen(true);
  });

  const handleGotoSubscriptionsPage = useEventCallback(() => {
    window.open('/subscriptions', '_blank');
  });

  if (!userInfo) {
    return <></>;
  }

  return (
    <span>
      <StyledButtonBase disableRipple ref={setAnchorEl} onClick={handleOpen}>
        <StyledAvatar src={`https://github.com/${userInfo.githubLogin}.png`} />
        <StyledBackdrop open={validating}>
          <CircularProgress size={12} />
        </StyledBackdrop>
      </StyledButtonBase>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={logout}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem onClick={handleGotoSubscriptionsPage}>My Subscriptions</MenuItem>
        <MenuItem onClick={logout}>Logout</MenuItem>
      </Menu>
    </span>
  );
}

const StyledButtonBase = styled(ButtonBase)`
  position: relative;
`;

const StyledBackdrop = styled(Backdrop)`
  position: absolute;
  border-radius: 50%;
`;

const StyledAvatar = styled(Avatar)`
  width: 28px;
  height: 28px;
`;
