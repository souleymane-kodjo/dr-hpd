// src/hooks/useNotificationToast.tsx
import { useState, useEffect } from 'react';
import { useNotificationStore } from '../store/notificationStore';
import { useAuthStore } from '../store/authStore';
import type { Notification } from '../types';


export const useNotificationToast = () => {
  const [currentToast, setCurrentToast] = useState<Notification | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastQueue, setToastQueue] = useState<Notification[]>([]);

  const { notifications } = useNotificationStore();
  const { user } = useAuthStore();

  // Listen for new notifications
  useEffect(() => {
    const latestNotification = notifications[0];

    if (
      latestNotification &&
      !latestNotification.isRead &&
      shouldShowToast(latestNotification)
    ) {
      // Check if this notification is already in queue
      const isInQueue = toastQueue.some(n => n.id === latestNotification.id);
      const isCurrent = currentToast?.id === latestNotification.id;

      if (!isInQueue && !isCurrent) {
        setToastQueue(prev => [...prev, latestNotification]);
      }
    }
  }, [notifications, toastQueue, currentToast]);

  // Process toast queue
  useEffect(() => {
    if (!toastOpen && toastQueue.length > 0) {
      const nextToast = toastQueue[0];
      setCurrentToast(nextToast);
      setToastOpen(true);
      setToastQueue(prev => prev.slice(1));
    }
  }, [toastOpen, toastQueue]);

  const shouldShowToast = (notification: Notification): boolean => {
    // Don't show system notifications as toasts
    if (notification.isSystem) {
      return false;
    }

    // Check if user should see this notification based on roles
    if (notification.userRoles.length > 0 && user?.roles) {
      return user.roles.some((role: string) => notification.userRoles.includes(role));
    }

    // Show notifications without role restrictions
    return notification.userRoles.length === 0;
  };

  const handleToastClose = () => {
    setToastOpen(false);
    // Clear current toast after animation
    setTimeout(() => {
      setCurrentToast(null);
    }, 300);
  };

  const handleToastAction = () => {
    if (currentToast?.actionUrl) {
      window.open(currentToast.actionUrl, '_blank');

      // Mark as read
      const { markAsRead } = useNotificationStore.getState();
      markAsRead([currentToast.id]);
    }
    handleToastClose();
  };

  return {
    currentToast,
    toastOpen,
    handleToastClose,
    handleToastAction
  };
};
