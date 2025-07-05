// src/store/authStore.ts
//create from zustand
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';


interface AuthState {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      login: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'auth-storage', // nom de l'item dans le localStorage
    }
  )
);