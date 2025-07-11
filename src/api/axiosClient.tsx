// api/axiosClient.tsx
import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Configuration de base pour l'API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const API_TIMEOUT = 10000; // 10 secondes

// Interface pour les réponses d'erreur API
interface ApiErrorResponse {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

// Création de l'instance Axios
export const axiosClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Intercepteur de requête pour ajouter le token d'authentification
axiosClient.interceptors.request.use(
  (config) => {
    // Récupérer le token depuis le localStorage ou zustand store
    const token = localStorage.getItem('authToken');

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log des requêtes en mode développement
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        headers: config.headers,
        data: config.data,
      });
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Intercepteur de réponse pour gérer les erreurs globalement
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log des réponses en mode développement
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }

    return response;
  },
  (error: AxiosError<ApiErrorResponse>) => {
    // Log des erreurs
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
    });

    // Gestion spécifique des codes d'erreur
    if (error.response) {
      const { status } = error.response;

      switch (status) {
        case 401:
          // Token expiré ou invalide - rediriger vers la page de connexion
          console.warn('🔐 Token expiré ou invalide');
          localStorage.removeItem('authToken');
          // Redirection vers login (à adapter selon votre routing)
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          break;

        case 403:
          console.warn('🚫 Accès interdit');
          break;

        case 404:
          console.warn('🔍 Ressource non trouvée');
          break;

        case 422:
          console.warn('📝 Erreur de validation des données');
          break;

        case 500:
          console.error('🔥 Erreur serveur interne');
          break;

        case 502:
        case 503:
        case 504:
          console.error('🌐 Erreur de connectivité serveur');
          break;

        default:
          console.error(`❓ Erreur HTTP ${status}`);
      }
    } else if (error.request) {
      // Erreur réseau (pas de réponse du serveur)
      console.error('🌐 Erreur réseau - pas de réponse du serveur');
    } else {
      // Erreur de configuration de la requête
      console.error('⚙️ Erreur de configuration de la requête');
    }

    return Promise.reject(error);
  }
);

// Utilitaires pour les requêtes courantes
export const apiClient = {
  // GET
  get: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return axiosClient.get<T>(url, config);
  },

  // POST
  post: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return axiosClient.post<T>(url, data, config);
  },

  // PUT
  put: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return axiosClient.put<T>(url, data, config);
  },

  // PATCH
  patch: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return axiosClient.patch<T>(url, data, config);
  },

  // DELETE
  delete: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return axiosClient.delete<T>(url, config);
  },
};

// Utilitaires pour l'upload de fichiers
export const uploadFile = async (
  url: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<AxiosResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  return axiosClient.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    },
  });
};

// Utilitaire pour télécharger des fichiers
export const downloadFile = async (url: string, filename?: string): Promise<void> => {
  try {
    const response = await axiosClient.get(url, {
      responseType: 'blob',
    });

    // Créer un lien de téléchargement
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('❌ Erreur lors du téléchargement:', error);
    throw error;
  }
};

// Fonction pour mettre à jour le token d'authentification
export const setAuthToken = (token: string | null): void => {
  if (token) {
    axiosClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('authToken', token);
  } else {
    delete axiosClient.defaults.headers.common['Authorization'];
    localStorage.removeItem('authToken');
  }
};

// Fonction pour obtenir le token actuel
export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Fonction pour vérifier si l'utilisateur est authentifié
export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  return !!token;
};

// Fonction pour nettoyer l'authentification
export const clearAuth = (): void => {
  setAuthToken(null);
};

// Types d'export pour TypeScript
export type {
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  ApiErrorResponse,
};

export default axiosClient;
