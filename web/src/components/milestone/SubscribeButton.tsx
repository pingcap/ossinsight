import React, { ForwardedRef, forwardRef, useCallback, useMemo } from 'react';
import { useSubscribed } from '@site/src/api/user';
import { Button, IconButton } from '@mui/material';
import { Notifications, NotificationsOff } from '@mui/icons-material';
import { ButtonProps } from '@mui/material/Button';
import { notFalsy } from '@site/src/utils/value';
import { useNotifications } from '@site/src/components/Notifications';
import { useUserInfoContext } from '@site/src/context/user';

export interface SubscribeButtonProps extends Omit<ButtonProps, 'onClick' | 'disabled' | 'startIcon' | 'children'> {
  repoName: string;
  icon?: boolean;

  onClick?: (action: () => void, subscribed: boolean) => void;
}

export default forwardRef(function SubscribeButton ({ repoName, variant, onClick, icon: iconProp, ...props }: SubscribeButtonProps, ref: ForwardedRef<HTMLButtonElement>) {
  const { validated: userValidated, validating: userValidating, login } = useUserInfoContext();
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

  const performAction = useCallback(() => {
    if (!userValidated) {
      login();
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

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick(performAction, subscribed);
    } else {
      performAction();
    }
  }, [onClick, performAction, subscribed]);

  if (notFalsy(iconProp)) {
    return (
      <IconButton
        disabled={subscribing}
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
      onClick={handleClick}
      variant={variant}
      ref={ref}
      {...props}
    >
      {content}
    </Button>
  );
});
