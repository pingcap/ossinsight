import React, { useCallback, useMemo, useState } from 'react';
import { CircularProgress, FormControlLabel, styled, Switch } from '@mui/material';
import { notFalsy } from '@site/src/utils/value';
import { clientWithoutCache } from '@site/src/api/client';
import { useUserInfoContext } from '@site/src/context/user';
// import { useAuth0 } from '@auth0/auth0-react';

export default function EnableEmailSwitch () {
  const { userInfo, validating, validated, mutate } = useUserInfoContext();
  // const { user: userInfo, isAuthenticated: validated, isLoading: validating } = useAuth0();
  const [updating, setUpdating] = useState(false);

  const enabled = useMemo(() => {
    return notFalsy(userInfo?.emailGetUpdates);
  }, [userInfo?.emailGetUpdates]);

  const handleChange = useCallback((_: unknown, checked: boolean) => {
    if (!validated || updating) {
      return;
    }
    setUpdating(true);
    clientWithoutCache.put('/user/email-updates', { enable: checked }, { withCredentials: true })
      .then(async data => await mutate(user => {
        if (user) {
          Object.assign(user, data);
        }
        return user;
      }, { revalidate: false }))
      .finally(() => setUpdating(false));
  }, [validated, updating, userInfo]);

  const switchDisabled = !validated || updating;
  const switchLoading = validating || updating;

  const icon = <Icon loading={switchLoading} disabled={switchDisabled} />;

  return (
    <FormControlLabel
      control={
        <Switch checked={enabled} disabled={switchDisabled} icon={icon} checkedIcon={icon} onChange={handleChange} />
      }
      label="Email Notification"
    />
  );
}

interface IconProps {
  loading: boolean;
  disabled: boolean;
}

const IconBackground = styled('span')<{ disabled: boolean }>`
  background-color: ${({ theme, disabled }) => disabled ? theme.palette.grey.A700 : theme.palette.primary.main};
  width: 20px;
  height: 20px;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

function Icon ({ loading, disabled }: IconProps) {
  return (
    <IconBackground disabled={disabled}>
      {loading && <CircularProgress size={16} color="primary" />}
    </IconBackground>
  );
}
