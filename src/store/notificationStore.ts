// src/store/notificationStore.ts
import { create } from 'zustand';
import type { Notification, NotificationStats, NotificationFilters } from '../types/notifications';
import { 
  getNotifications, 
  getNotificationStats, 
  markNotificationsAsRead, 
  markAllAsRead,
  deleteNotification,
  connectNotifications,
  disconnectNotifications,
  onNotification
} from '../services/notificationService';

interface NotificationState {
  // State
  notifications: Notification[];
  stats: NotificationStats | null;
  loading: boolean;
  error: string | null;
  filters: NotificationFilters;
  soundEnabled: boolean;
  connected: boolean;

  // Actions
  fetchNotifications: (filters?: NotificationFilters) => Promise<void>;
  fetchStats: () => Promise<void>;
  markAsRead: (notificationIds: string[]) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  setFilters: (filters: NotificationFilters) => void;
  connectRealTime: () => void;
  disconnectRealTime: () => void;
  toggleSound: () => void;
  addNotification: (notification: Notification) => void;
  clearError: () => void;
  
  // Helper methods
  playNotificationSound: (priority: string) => void;
  showBrowserNotification: (notification: Notification) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  // Initial state
  notifications: [],
  stats: null,
  loading: false,
  error: null,
  filters: { limit: 50 },
  soundEnabled: true,
  connected: false,

  // Actions
  fetchNotifications: async (filters) => {
    set({ loading: true, error: null });
    try {
      const newFilters = filters || get().filters;
      const notifications = await getNotifications(newFilters);
      set({ 
        notifications, 
        filters: newFilters, 
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors du chargement des notifications', 
        loading: false 
      });
    }
  },

  fetchStats: async () => {
    try {
      const stats = await getNotificationStats();
      set({ stats });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  },

  markAsRead: async (notificationIds) => {
    try {
      await markNotificationsAsRead({ notificationIds, isRead: true });
      
      // Update local state
      const { notifications } = get();
      const updatedNotifications = notifications.map(notification => 
        notificationIds.includes(notification.id) 
          ? { ...notification, isRead: true }
          : notification
      );
      
      set({ notifications: updatedNotifications });
      
      // Refresh stats
      get().fetchStats();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour' 
      });
    }
  },

  markAllAsRead: async () => {
    try {
      await markAllAsRead();
      
      // Update local state
      const { notifications } = get();
      const updatedNotifications = notifications.map(notification => ({
        ...notification,
        isRead: true
      }));
      
      set({ notifications: updatedNotifications });
      
      // Refresh stats
      get().fetchStats();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour' 
      });
    }
  },

  deleteNotification: async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      
      // Update local state
      const { notifications } = get();
      const updatedNotifications = notifications.filter(n => n.id !== notificationId);
      
      set({ notifications: updatedNotifications });
      
      // Refresh stats
      get().fetchStats();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors de la suppression' 
      });
    }
  },

  setFilters: (filters) => {
    set({ filters });
    get().fetchNotifications(filters);
  },

  connectRealTime: () => {
    if (get().connected) return;
    
    connectNotifications();
    
    onNotification((notification) => {
      const { notifications, soundEnabled } = get();
      
      // Add notification to the beginning of the list
      const updatedNotifications = [notification, ...notifications];
      
      set({ notifications: updatedNotifications });
      
      // Play sound if enabled
      if (soundEnabled && !notification.isRead) {
        get().playNotificationSound(notification.priority);
      }
      
      // Show browser notification if permission granted
      get().showBrowserNotification(notification);
      
      // Refresh stats
      get().fetchStats();
    });
    
    set({ connected: true });
  },

  disconnectRealTime: () => {
    disconnectNotifications();
    set({ connected: false });
  },

  toggleSound: () => {
    set({ soundEnabled: !get().soundEnabled });
  },

  addNotification: (notification) => {
    const { notifications } = get();
    const updatedNotifications = [notification, ...notifications];
    set({ notifications: updatedNotifications });
    
    if (get().soundEnabled && !notification.isRead) {
      get().playNotificationSound(notification.priority);
    }
    
    get().showBrowserNotification(notification);
  },

  clearError: () => {
    set({ error: null });
  },

  // Helper methods (not exposed in interface but available internally)
  playNotificationSound: (priority: string) => {
    try {
      const audio = new Audio();
      
      // Different sounds for different priorities
      switch (priority) {
        case 'urgent':
          audio.src = '/sounds/urgent.mp3';
          break;
        case 'high':
          audio.src = '/sounds/high.mp3';
          break;
        case 'medium':
          audio.src = '/sounds/medium.mp3';
          break;
        default:
          audio.src = '/sounds/default.mp3';
      }
      
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Silently handle audio play errors (user interaction required)
      });
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  },

  showBrowserNotification: (notification: Notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.priority === 'urgent',
        silent: false
      });

      browserNotification.onclick = () => {
        window.focus();
        if (notification.actionUrl) {
          window.location.href = notification.actionUrl;
        }
        browserNotification.close();
      };

      // Auto close after 5 seconds for non-urgent notifications
      if (notification.priority !== 'urgent') {
        setTimeout(() => {
          browserNotification.close();
        }, 5000);
      }
    }
  }
}));

// Helper hook for requesting notification permission
export const useNotificationPermission = () => {
  const requestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  };

  const hasPermission = () => {
    return 'Notification' in window && Notification.permission === 'granted';
  };

  return { requestPermission, hasPermission };
};
