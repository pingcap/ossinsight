import React, { useState } from 'react';
import { Avatar, ButtonBase, Menu, MenuItem, styled, useEventCallback } from '@mui/material';
import { Experimental } from '@site/src/components/Experimental';
import { useUserInfoContext } from '@site/src/context/user';

export default function LoginItem () {
  const { userInfo, logout } = useUserInfoContext();
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
      </StyledButtonBase>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <Experimental feature="milestone-subscription">
          <MenuItem onClick={handleGotoSubscriptionsPage}>My Subscriptions</MenuItem>
        </Experimental>
        <MenuItem onClick={logout}>Logout</MenuItem>
      </Menu>
    </span>
  );
}

const StyledButtonBase = styled(ButtonBase)`
  position: relative;
`;

const StyledAvatar = styled(Avatar)`
  width: 28px;
  height: 28px;
`;
