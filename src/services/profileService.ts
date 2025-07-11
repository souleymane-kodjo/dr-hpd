// src/services/profileService.ts
import { axiosClient } from '../api/axiosClient';

export interface Profile {
  id: string;
  nom: string;
  email: string;
  roles: string[];
  matricule: string;
  photoUrl?: string;
  memberSince?: string;
}

export interface ProfileUpdateData {
  nom?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface ProfileStats {
  accountAge: number;
  loginCount?: number;
  lastLoginDate?: string;
  patientsCount?: number;
  hospitalizationsCount?: number;
  totalUsers?: number;
  totalPatients?: number;
  totalHospitalizations?: number;
}

export interface ActivityItem {
  id: number;
  type: string;
  description: string;
  timestamp: string;
  icon: string;
}

// Récupérer le profil de l'utilisateur connecté
export const getProfile = async (): Promise<Profile> => {
  const response = await axiosClient.get('/profile');
  return response.data;
};

// Mettre à jour le profil utilisateur
export const updateProfile = async (data: ProfileUpdateData): Promise<Profile> => {
  const response = await axiosClient.put('/profile', data);
  return response.data;
};

// Mettre à jour la photo de profil
export const updateProfilePhoto = async (photoData: string): Promise<{ photoUrl: string; message: string }> => {
  const response = await axiosClient.put('/profile/photo', { photoData });
  return response.data;
};

// Supprimer la photo de profil
export const deleteProfilePhoto = async (): Promise<{ message: string }> => {
  const response = await axiosClient.delete('/profile/photo');
  return response.data;
};

// Récupérer les statistiques du profil
export const getProfileStats = async (): Promise<ProfileStats> => {
  const response = await axiosClient.get('/profile/stats');
  return response.data;
};

// Récupérer l'historique d'activité
export const getProfileActivity = async (limit = 10): Promise<ActivityItem[]> => {
  const response = await axiosClient.get('/profile/activity', {
    params: { limit }
  });
  return response.data;
};

// Utilitaires pour la validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Vérifier le type de fichier
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Le fichier doit être une image' };
  }

  // Vérifier la taille (max 2MB)
  const maxSize = 2 * 1024 * 1024; // 2MB
  if (file.size > maxSize) {
    return { valid: false, error: 'La taille de l\'image ne doit pas dépasser 2MB' };
  }

  return { valid: true };
};

// Convertir un fichier en base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Formater la date d'activité
export const formatActivityDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) {
    return 'À l\'instant';
  } else if (diffMinutes < 60) {
    return `Il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
  } else if (diffHours < 24) {
    return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
  } else if (diffDays < 7) {
    return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
  } else {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

// Récupérer les couleurs de rôle
export const getRoleColor = (role: string): string => {
  switch (role.toLowerCase()) {
    case 'admin':
      return '#f44336'; // Rouge
    case 'medecin':
      return '#2196f3'; // Bleu
    case 'major_administratif':
      return '#ff9800'; // Orange
    case 'user':
      return '#4caf50'; // Vert
    default:
      return '#9e9e9e'; // Gris
  }
};

// Récupérer l'icône de rôle
export const getRoleIcon = (role: string): string => {
  switch (role.toLowerCase()) {
    case 'admin':
      return 'AdminPanelSettings';
    case 'medecin':
      return 'LocalHospital';
    case 'major_administratif':
      return 'Business';
    case 'user':
      return 'Person';
    default:
      return 'Help';
  }
};
