import React, { useState } from 'react';
import { useUserInfo } from '@site/src/api/user';
import { Avatar, ButtonBase, Menu, MenuItem, styled, useEventCallback } from '@mui/material';
import { Experimental } from '@site/src/components/Experimental';

export default function LoginItem () {
  const { userInfo, logout } = useUserInfo();
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
    <Experimental feature='milestone-subscription'>
      <span>
        <StyledButtonBase disableRipple ref={setAnchorEl} onClick={handleOpen}>
          <StyledAvatar src={`https://github.com/${userInfo.githubLogin}.png`} />
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
    </Experimental>
  );
}

const StyledButtonBase = styled(ButtonBase)`
  position: relative;
`;

const StyledAvatar = styled(Avatar)`
  width: 28px;
  height: 28px;
`;
