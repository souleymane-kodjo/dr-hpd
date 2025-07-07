// src/components/notifications/GlobalNotificationHandler.tsx
import React from 'react';
import { useNotificationToast } from '../../hooks/useNotificationToast';
import NotificationToast from './NotificationToast';

const GlobalNotificationHandler: React.FC = () => {
  const { currentToast, toastOpen, handleToastClose, handleToastAction } = useNotificationToast();

  return (
    <NotificationToast
      notification={currentToast}
      open={toastOpen}
      onClose={handleToastClose}
      onAction={handleToastAction}
    />
  );
};

export default GlobalNotificationHandler;
