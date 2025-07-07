// src/types/notifications.ts

export type NotificationType =
  | 'admission_request'
  | 'admission_validated'
  | 'admission_rejected'
  | 'patient_admitted'
  | 'patient_discharged'
  | 'bed_available'
  | 'urgent_request'
  | 'system'
  | 'reminder';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  userId: string;
  userRoles: string[];
  isRead: boolean;
  isSystem: boolean;
  createdAt: Date;
  expiresAt?: Date;
  actionUrl?: string;
  metadata?: {
    patientId?: string;
    admissionId?: string;
    bedId?: string;
    hospitalId?: string;
    [key: string]: any;
  };
}

export interface NotificationPreferences {
  userId: string;
  enablePush: boolean;
  enableEmail: boolean;
  enableSound: boolean;
  types: {
    [K in NotificationType]: {
      enabled: boolean;
      priority: NotificationPriority;
    };
  };
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
  byPriority: Record<NotificationPriority, number>;
}

// Types pour les actions
export interface SendNotificationRequest {
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  targetUsers?: string[];
  targetRoles?: string[];
  actionUrl?: string;
  metadata?: Notification['metadata'];
  expiresAt?: Date;
}

export interface MarkNotificationRequest {
  notificationIds: string[];
  isRead: boolean;
}

export interface NotificationFilters {
  type?: NotificationType[];
  priority?: NotificationPriority[];
  isRead?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}
