import React, { ForwardedRef, forwardRef, useCallback, useMemo } from 'react';
import { useSubscribed } from '@site/src/api/user';
import { Button, IconButton } from '@mui/material';
import { Notifications, NotificationsOff } from '@mui/icons-material';
import { ButtonProps } from '@mui/material/Button';
import { notFalsy } from '@site/src/utils/value';
import { useNotifications } from '@site/src/components/Notifications';
import { useAuth0 } from '@auth0/auth0-react';

export interface SubscribeButtonProps extends Omit<ButtonProps, 'onClick' | 'disabled' | 'startIcon' | 'children'> {
  repoName: string;
  icon?: boolean;

  onClick?: (action: () => Promise<void>, subscribed: boolean) => void;
}

export default forwardRef(function SubscribeButton ({ repoName, variant, onClick, icon: iconProp, ...props }: SubscribeButtonProps, ref: ForwardedRef<HTMLButtonElement>) {
  const { isAuthenticated: userValidated, isLoading: userValidating, loginWithPopup: login } = useAuth0();
  const { subscribed, subscribing, subscribe, unsubscribe, isValidating } = useSubscribed(repoName);
  const { success, displayError } = useNotifications();

  const icon = useMemo(() => {
    if (!userValidated) {
      return undefined;
    } else if (subscribed) {
      return <NotificationsOff fontSize="inherit" />;
    } else {
      return <Notifications fontSize="inherit" />;
    }
  }, [userValidated, userValidating, subscribing, subscribed, isValidating]);

  const content = useMemo(() => {
    if (userValidated) {
      if (subscribed) {
        return 'Cancel getting updates';
      } else {
        return 'Get updates';
      }
    } else {
      return 'Sign in to get updates';
    }
  }, [userValidated, subscribed]);

  const performAction = useCallback(async () => {
    if (!userValidated) {
      await login();
      return;
    }
    if (subscribed) {
      unsubscribe()
        .then(() => success(`Cancelled getting updates from ${repoName}.`))
        .catch(displayError);
    } else {
      subscribe()
        .then(() => success(`Started to get updates from ${repoName}.`))
        .catch(displayError);
    }
  }, [subscribed, subscribe, unsubscribe, userValidated, repoName]);

  const handleClick = useCallback(async () => {
    if (onClick) {
      onClick(performAction, subscribed);
    } else {
      await performAction();
    }
  }, [onClick, performAction, subscribed]);

  if (notFalsy(iconProp)) {
    return (
      <IconButton
        disabled={subscribing}
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onClick={handleClick}
        color="primary"
        ref={ref}
        {...props}
      >
        {icon}
      </IconButton>
    );
  }

  return (
    <Button
      disabled={subscribing}
      startIcon={icon}
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onClick={handleClick}
      variant={variant}
      ref={ref}
      {...props}
    >
      {content}
    </Button>
  );
});
