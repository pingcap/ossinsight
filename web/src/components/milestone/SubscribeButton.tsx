import React, { useCallback, useMemo } from 'react';
import { useSubscribed, useUserInfo } from '@site/src/api/user';
import { Button, CircularProgress } from '@mui/material';
import { Email, Unsubscribe } from '@mui/icons-material';
import { ButtonProps } from '@mui/material/Button';

export interface SubscribeButtonProps extends Omit<ButtonProps, 'onClick' | 'disabled' | 'startIcon' | 'children'> {
  repoName: string;
}

export default function SubscribeButton ({ repoName, ...props }: SubscribeButtonProps) {
  const { validated: userValidated, validating: userValidating, login } = useUserInfo();
  const { subscribed, subscribing, subscribe, unsubscribe, isValidating } = useSubscribed(repoName);

  const icon = useMemo(() => {
    if (isValidating || subscribing || userValidating) {
      return <CircularProgress size={14} />;
    } else if (!userValidated) {
      return undefined;
    } else if (subscribed) {
      return <Unsubscribe fontSize="inherit" />;
    } else {
      return <Email fontSize="inherit" />;
    }
  }, [userValidated, userValidating, subscribing, subscribed, isValidating]);

  const content = useMemo(() => {
    if (userValidating) {
      return 'Waiting...';
    } else {
      if (userValidated) {
        if (subscribing) {
          if (subscribed) {
            return 'Unsubscribing...';
          } else {
            return 'Subscribing...';
          }
        } else {
          if (subscribed) {
            return 'Unsubscribe';
          } else {
            return 'Subscribe';
          }
        }
      } else {
        return 'Sign in to subscribe';
      }
    }
  }, [userValidated, userValidating, subscribing, subscribed, isValidating]);

  const handleClick = useCallback(() => {
    if (!userValidated) {
      login();
      return;
    }
    if (subscribed) {
      unsubscribe()
        .catch(console.error);
    } else {
      subscribe()
        .catch(console.error);
    }
  }, [subscribed, subscribe, unsubscribe, userValidated]);

  return (
    <Button
      disabled={subscribing || isValidating}
      startIcon={icon}
      onClick={handleClick}
      {...props}
    >
      {content}
    </Button>
  );
}
