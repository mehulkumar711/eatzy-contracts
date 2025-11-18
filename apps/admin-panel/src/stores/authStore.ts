// apps/admin-panel/src/stores/authStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Define a minimal user type for consistency
interface AdminUser {
  username: string;
  role: string; // 'admin'
}

interface AuthState {
  accessToken: string | null;
  user: AdminUser | null;
  
  // Actions
  login: (token: string, user: AdminUser) => void;
  logout: () => void;
}

/**
 * @constant useAuthStore
 * @description Centralized state management for Admin Authentication.
 * Persisted in sessionStorage (more secure than localStorage for JWTs, but still not HttpOnly cookie)
 * SECURITY NOTE: For true production, token should be in HttpOnly, Secure cookie.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      login: (accessToken, user) => set({ accessToken, user }),
      logout: () => set({ accessToken: null, user: null }),
    }),
    { 
      name: 'eatzy-admin-auth', 
      storage: createJSONStorage(() => sessionStorage) 
    }
  )
);