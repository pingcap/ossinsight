import React from 'react';
import {
  Avatar,
  ButtonBase,
  Menu,
  MenuItem,
  styled,
  useEventCallback,
  Skeleton,
  Box,
} from '@mui/material';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import { Experimental } from '@site/src/components/Experimental';
import { useBoolean } from 'ahooks';
import { useAuth0 } from '@auth0/auth0-react';

// ! to be removed
// const TestCallButton = () => {
//   const domain = "";
//   const { getAccessTokenSilently, getIdTokenClaims, user } = useAuth0();

//   const fetchTest = async () => {
//     // const token = await getAccessTokenSilently();
//     const accessToken = await getAccessTokenSilently({
//       audience: `https://${domain}/api/v2/`,
//       scope: "read:current_user",
//     });
//     // const claims = await getIdTokenClaims();
//     // console.log(accessToken, claims);
//     const response = await fetch("http://localhost:3450/cz", {
//       method: "GET",
//       credentials: "include",
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//       },
//     });
//     const data = await response.json();
//     console.log(data);
//   };

//   const fetchUserMetadata = async () => {
//     const accessToken = await getAccessTokenSilently({
//       audience: `https://${domain}/api/v2/`,
//       scope: "read:current_user",
//     });
//     const userDetailsByIdUrl = `https://${domain}/api/v2/users/${user.sub}`;

//     const metadataResponse = await fetch(userDetailsByIdUrl, {
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//       },
//     });

//     const { user_metadata } = await metadataResponse.json();
//     console.log(`user_metadata`, user_metadata);
//   };

//   return <button onClick={() => fetchTest()}>Test Call</button>;
// };

const StyledButtonBase = styled(ButtonBase)`
  position: relative;
`;

const StyledAvatar = styled(Avatar)`
  width: 28px;
  height: 28px;
`;

function LoginButton () {
  const { loginWithRedirect } = useAuth0();

  return (
    <StyledButtonBase
      disableRipple
      aria-label="login"
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onClick={loginWithRedirect}
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

  console.log('header user ==', user);

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
    isAuthenticated &&
    user && (
      <Box component="span">
        <StyledButtonBase disableRipple ref={setAnchorEl} onClick={handleOpen}>
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
    )
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
