import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserInfoDto, DomainCode, UserDomainRole } from '../types/api.types';

export type { UserDomainRole };

export interface AuthUser extends UserInfoDto {
  domainRoles?: UserDomainRole[];
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: AuthUser) => void;
  logout: () => void;
  isGuest: () => boolean;
  hasDomainAccess: (domainCode: DomainCode) => boolean;
  getAccessibleDomains: () => DomainCode[];
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,

      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken, isAuthenticated: true }),

      setUser: (user) => set({ user }),

      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        }),

      isGuest: () => {
        const state = useAuthStore.getState();
        if (!state.user?.role) return true;
        return state.user.role.code === 'GUEST';
      },

      hasDomainAccess: (domainCode: DomainCode) => {
        const state = useAuthStore.getState();
        if (!state.user?.domainRoles || state.user.domainRoles.length === 0) {
          return false;
        }
        return state.user.domainRoles.some((dr) => dr.domainCode === domainCode);
      },

      getAccessibleDomains: () => {
        const state = useAuthStore.getState();
        if (!state.user?.domainRoles || state.user.domainRoles.length === 0) {
          return [];
        }
        return state.user.domainRoles.map((dr) => dr.domainCode);
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
