import React, { PropsWithChildren, useCallback, useMemo, useState } from 'react';
import { NotificationFunc, NotificationLevel, NotificationsContext, NotificationsContextProps } from './context';
import { Alert, Snackbar } from '@mui/material';
import { getErrorMessage } from '@site/src/utils/error';

interface NotificationRecord {
  level: NotificationLevel;
  title: string;
  content?: string;
}

export function useNotificationsProvider () {
  const [open, setOpen] = useState(false);
  const [record, setRecord] = useState<NotificationRecord>();

  const contextProps = useMemo<NotificationsContextProps>(() => {
    const messageFunc = (level: NotificationLevel): NotificationFunc => {
      return (title, content) => {
        setRecord({
          level,
          title,
          content,
        });
        setOpen(true);
      };
    };

    return {
      info: messageFunc('info'),
      success: messageFunc('success'),
      warning: messageFunc('warning'),
      error: messageFunc('error'),
      displayError: (error: unknown) => {
        const msg = getErrorMessage(error);
        return messageFunc('error')(msg);
      },
    };
  }, []);

  const el = useMemo(() => {
    return (
      <Snackbar
        open={open}
        autoHideDuration={3000}
        resumeHideDuration={1000}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        onClose={() => {
          setOpen(false);
        }}
      >
        <Alert severity={record?.level ?? 'info'}>
          {record?.title}
        </Alert>
      </Snackbar>
    );
  }, [record, open]);

  const Provider = useCallback(({ children }: PropsWithChildren<{}>) => {
    return (
      <NotificationsContext.Provider value={contextProps}>
        {children}
      </NotificationsContext.Provider>
    );
  }, [contextProps]);

  return {
    el, Provider,
  };
}
