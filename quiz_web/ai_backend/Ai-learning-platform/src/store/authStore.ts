import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthTokens } from '../types/api';
import { storeTokens, clearTokens } from '../lib/apiClient';

interface AuthState {
  user:         User | null;
  isAuthenticated: boolean;
  // Actions
  login:        (user: User, tokens: AuthTokens) => void;
  logout:       () => void;
  setUser:      (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:            null,
      isAuthenticated: false,

      login: (user, tokens) => {
        storeTokens(tokens);
        set({ user, isAuthenticated: true });
      },

      logout: () => {
        clearTokens();
        set({ user: null, isAuthenticated: false });
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: 'igot_auth',
      // Only persist user identity, not sensitive tokens (those go to localStorage separately)
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    },
  ),
);
