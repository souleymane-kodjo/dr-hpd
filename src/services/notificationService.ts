// src/services/notificationService.ts
import type {
  Notification,
  NotificationFilters,
  NotificationStats,
  SendNotificationRequest,
  NotificationPreferences,
  NotificationType,
  NotificationPriority,
  MarkNotificationRequest
} from '../types';

// Base de données mock
let mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'admission_request',
    title: 'Nouvelle demande d\'admission',
    message: 'Demande d\'admission urgente pour Marie Dubois - Service Cardiologie',
    priority: 'high',
    userId: 'all',
    userRoles: ['MAJOR_ADMINISTRATIF', 'ADMIN'],
    isRead: false,
    isSystem: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 10), // Il y a 10 minutes
    actionUrl: '/admin/major?tab=admissions',
    metadata: {
      patientId: 'patient-001',
      admissionId: 'admission-001'
    }
  },
  {
    id: '2',
    type: 'bed_available',
    title: 'Lit disponible',
    message: 'Le lit 205A est maintenant disponible en cardiologie',
    priority: 'medium',
    userId: 'all',
    userRoles: ['MAJOR_ADMINISTRATIF', 'DOCTEUR'],
    isRead: false,
    isSystem: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // Il y a 30 minutes
    actionUrl: '/lits',
    metadata: {
      bedId: 'bed-205A'
    }
  },
  {
    id: '3',
    type: 'patient_discharged',
    title: 'Sortie patient',
    message: 'Pierre Martin a quitté le service - Lit 102B disponible',
    priority: 'low',
    userId: 'all',
    userRoles: ['MAJOR_ADMINISTRATIF', 'DOCTEUR'],
    isRead: true,
    isSystem: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60), // Il y a 1 heure
    actionUrl: '/admin/major?tab=sorties',
    metadata: {
      patientId: 'patient-002',
      bedId: 'bed-102B'
    }
  },
  {
    id: '4',
    type: 'urgent_request',
    title: 'Demande urgente',
    message: 'Demande d\'hospitalisation critique - Intervention immédiate requise',
    priority: 'urgent',
    userId: 'all',
    userRoles: ['MAJOR_ADMINISTRATIF', 'ADMIN', 'DOCTEUR'],
    isRead: false,
    isSystem: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5), // Il y a 5 minutes
    actionUrl: '/admin/major?tab=admissions',
    metadata: {
      patientId: 'patient-003',
      admissionId: 'admission-003'
    }
  },
  {
    id: '5',
    type: 'system',
    title: 'Maintenance système',
    message: 'Maintenance programmée du système ce soir de 22h à 23h',
    priority: 'medium',
    userId: 'all',
    userRoles: [],
    isRead: false,
    isSystem: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // Il y a 2 heures
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // Expire dans 24h
  }
];

const mockPreferences: NotificationPreferences[] = [];

// Simulate WebSocket connection for real-time notifications
class NotificationWebSocket {
  private listeners: ((notification: Notification) => void)[] = [];
  private connected = false;

  connect() {
    if (this.connected) return;

    console.log('🔔 Connexion WebSocket notifications simulée');
    this.connected = true;

    // Simuler des notifications en temps réel
    setInterval(() => {
      if (Math.random() > 0.85) { // 15% de chance toutes les 30 secondes
        this.simulateIncomingNotification();
      }
    }, 30000);
  }

  disconnect() {
    this.connected = false;
    this.listeners = [];
    console.log('🔔 Déconnexion WebSocket notifications');
  }

  onNotification(callback: (notification: Notification) => void) {
    this.listeners.push(callback);
  }

  private simulateIncomingNotification() {
    const types: NotificationType[] = ['admission_request', 'bed_available', 'patient_discharged', 'urgent_request'];
    const priorities: NotificationPriority[] = ['low', 'medium', 'high', 'urgent'];

    const randomType = types[Math.floor(Math.random() * types.length)];
    const randomPriority = priorities[Math.floor(Math.random() * priorities.length)];

    const notification: Notification = {
      id: `notif-${Date.now()}`,
      type: randomType,
      title: this.getRandomTitle(randomType),
      message: this.getRandomMessage(randomType),
      priority: randomPriority,
      userId: 'all',
      userRoles: this.getTargetRoles(randomType),
      isRead: false,
      isSystem: randomType === 'bed_available',
      createdAt: new Date(),
      actionUrl: this.getActionUrl(randomType),
      metadata: {
        patientId: `patient-${Math.floor(Math.random() * 1000)}`,
        admissionId: `admission-${Math.floor(Math.random() * 1000)}`
      }
    };

    mockNotifications.unshift(notification);
    this.listeners.forEach(listener => listener(notification));
  }

  private getRandomTitle(type: NotificationType): string {
    const titles: Record<NotificationType, string[]> = {
      admission_request: ['Nouvelle demande d\'admission', 'Demande d\'hospitalisation', 'Admission en attente'],
      bed_available: ['Lit disponible', 'Libération de lit', 'Capacité disponible'],
      patient_discharged: ['Sortie patient', 'Départ patient', 'Lit libéré'],
      urgent_request: ['Demande urgente', 'Urgence hospitalisation', 'Intervention immédiate'],
      system: ['Notification système'],
      admission_validated: ['Admission validée'],
      admission_rejected: ['Admission rejetée'],
      patient_admitted: ['Patient admis'],
      reminder: ['Rappel']
    };
    const list = titles[type] || ['Notification'];
    return list[Math.floor(Math.random() * list.length)];
  }

  private getRandomMessage(type: NotificationType): string {
    const messages: Record<NotificationType, string[]> = {
      admission_request: [
        'Demande d\'admission pour le service cardiologie',
        'Nouvelle hospitalisation programmée',
        'Patient en attente d\'admission'
      ],
      bed_available: [
        'Lit disponible en cardiologie',
        'Chambre libérée en chirurgie',
        'Capacité d\'accueil augmentée'
      ],
      patient_discharged: [
        'Patient sorti - lit disponible',
        'Fin d\'hospitalisation',
        'Libération de chambre'
      ],
      urgent_request: [
        'Intervention immédiate requise',
        'Cas critique en attente',
        'Urgence médicale'
      ],
      system: ['Notification système'],
      admission_validated: ['Admission validée'],
      admission_rejected: ['Admission rejetée'],
      patient_admitted: ['Patient admis'],
      reminder: ['Rappel de notification']
    };
    const list = messages[type] || ['Nouvelle notification'];
    return list[Math.floor(Math.random() * list.length)];
  }

  private getTargetRoles(type: NotificationType): string[] {
    const roleMap: Record<NotificationType, string[]> = {
      admission_request: ['MAJOR_ADMINISTRATIF', 'ADMIN'],
      bed_available: ['MAJOR_ADMINISTRATIF', 'DOCTEUR'],
      patient_discharged: ['MAJOR_ADMINISTRATIF', 'DOCTEUR'],
      urgent_request: ['MAJOR_ADMINISTRATIF', 'ADMIN', 'DOCTEUR'],
      system: [],
      admission_validated: ['MAJOR_ADMINISTRATIF', 'ADMIN'],
      admission_rejected: ['MAJOR_ADMINISTRATIF', 'ADMIN'],
      patient_admitted: ['MAJOR_ADMINISTRATIF', 'DOCTEUR'],
      reminder: []
    };
    return roleMap[type];
  }

  private getActionUrl(type: NotificationType): string {
    const urlMap: Record<NotificationType, string> = {
      admission_request: '/admin/major?tab=admissions',
      bed_available: '/lits',
      patient_discharged: '/admin/major?tab=sorties',
      urgent_request: '/admin/major?tab=admissions',
      system: '',
      admission_validated: '/admin/major?tab=admissions',
      admission_rejected: '/admin/major?tab=admissions',
      patient_admitted: '/admin/major?tab=admissions',
      reminder: ''
    };
    return urlMap[type] || '';
  }
}

const notificationWS = new NotificationWebSocket();

// API Functions
export const getNotifications = async (filters?: NotificationFilters): Promise<Notification[]> => {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay

  let filtered = [...mockNotifications];

  if (filters) {
    if (filters.type) {
      filtered = filtered.filter(n => filters.type!.includes(n.type));
    }
    if (filters.priority) {
      filtered = filtered.filter(n => filters.priority!.includes(n.priority));
    }
    if (filters.isRead !== undefined) {
      filtered = filtered.filter(n => n.isRead === filters.isRead);
    }
    if (filters.dateFrom) {
      filtered = filtered.filter(n => n.createdAt >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      filtered = filtered.filter(n => n.createdAt <= filters.dateTo!);
    }
  }

  // Sort by creation date (newest first)
  filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  if (filters?.limit) {
    const offset = filters.offset || 0;
    filtered = filtered.slice(offset, offset + filters.limit);
  }

  return filtered;
};

export const getNotificationStats = async (): Promise<NotificationStats> => {
  await new Promise(resolve => setTimeout(resolve, 200));

  const stats: NotificationStats = {
    total: mockNotifications.length,
    unread: mockNotifications.filter(n => !n.isRead).length,
    byType: {} as Record<NotificationType, number>,
    byPriority: {} as Record<NotificationPriority, number>
  };

  // Count by type
  mockNotifications.forEach(n => {
    stats.byType[n.type] = (stats.byType[n.type] || 0) + 1;
    stats.byPriority[n.priority] = (stats.byPriority[n.priority] || 0) + 1;
  });

  return stats;
};

export const markNotificationsAsRead = async (request: MarkNotificationRequest): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 200));

  mockNotifications = mockNotifications.map(notification => {
    if (request.notificationIds.includes(notification.id)) {
      return { ...notification, isRead: request.isRead };
    }
    return notification;
  });
};

export const markAllAsRead = async (): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 200));

  mockNotifications = mockNotifications.map(notification => ({
    ...notification,
    isRead: true
  }));
};

export const deleteNotification = async (notificationId: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 200));

  mockNotifications = mockNotifications.filter(n => n.id !== notificationId);
};

export const sendNotification = async (request: SendNotificationRequest): Promise<Notification> => {
  await new Promise(resolve => setTimeout(resolve, 300));

  const notification: Notification = {
    id: `notif-${Date.now()}`,
    type: request.type,
    title: request.title,
    message: request.message,
    priority: request.priority,
    userId: request.targetUsers?.[0] || 'all',
    userRoles: request.targetRoles || [],
    isRead: false,
    isSystem: false,
    createdAt: new Date(),
    expiresAt: request.expiresAt,
    actionUrl: request.actionUrl,
    metadata: request.metadata
  };

  mockNotifications.unshift(notification);

  // Simulate real-time notification
  setTimeout(() => {
    notificationWS['listeners'].forEach(listener => listener(notification));
  }, 100);

  return notification;
};

// WebSocket functions
export const connectNotifications = () => {
  notificationWS.connect();
};

export const disconnectNotifications = () => {
  notificationWS.disconnect();
};

export const onNotification = (callback: (notification: Notification) => void) => {
  notificationWS.onNotification(callback);
};

// Preferences
export const getNotificationPreferences = async (userId: string): Promise<NotificationPreferences> => {
  await new Promise(resolve => setTimeout(resolve, 200));

  const existing = mockPreferences.find(p => p.userId === userId);
  if (existing) return existing;

  // Default preferences
  const defaultPrefs: NotificationPreferences = {
    userId,
    enablePush: true,
    enableEmail: false,
    enableSound: true,
    types: {
      admission_request: { enabled: true, priority: 'high' },
      admission_validated: { enabled: true, priority: 'medium' },
      admission_rejected: { enabled: true, priority: 'medium' },
      patient_admitted: { enabled: true, priority: 'low' },
      patient_discharged: { enabled: true, priority: 'low' },
      bed_available: { enabled: true, priority: 'medium' },
      urgent_request: { enabled: true, priority: 'urgent' },
      system: { enabled: true, priority: 'low' },
      reminder: { enabled: true, priority: 'low' }
    }
  };

  mockPreferences.push(defaultPrefs);
  return defaultPrefs;
};

export const updateNotificationPreferences = async (preferences: NotificationPreferences): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 200));

  const index = mockPreferences.findIndex(p => p.userId === preferences.userId);
  if (index >= 0) {
    mockPreferences[index] = preferences;
  } else {
    mockPreferences.push(preferences);
  }
};
