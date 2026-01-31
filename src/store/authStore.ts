import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserInfoDto } from '../types/api.types';

export interface UserDomainRole {
  domainCode: 'ESG' | 'SAFETY' | 'COMPLIANCE';
  roleCode: 'DRAFTER' | 'APPROVER' | 'REVIEWER';
}

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
    }),
    {
      name: 'auth-storage',
    }
  )
);
