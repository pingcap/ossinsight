import { createContext, useContext } from 'react';

export type NotificationFunc = (title: string, content?: string) => void;

export type NotificationLevel = 'info' | 'success' | 'warning' | 'error';

export type NotificationsContextProps = Record<NotificationLevel, NotificationFunc> & {
  displayError: (error: unknown) => void;
};

export const NotificationsContext = createContext<NotificationsContextProps>({
  info: console.info,
  success: console.info,
  warning: console.warn,
  error: console.error,
  displayError: console.error,
});

export function useNotifications (): NotificationsContextProps {
  return useContext(NotificationsContext);
}
