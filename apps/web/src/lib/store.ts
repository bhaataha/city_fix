import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: any | null;
  accessToken: string | null;
  refreshToken: string | null;
  tenantSlug: string | null;
  isAuthenticated: boolean;
  setAuth: (user: any, accessToken: string, refreshToken: string, tenantSlug: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      tenantSlug: null,
      isAuthenticated: false,
      setAuth: (user, accessToken, refreshToken, tenantSlug) =>
        set({ user, accessToken, refreshToken, tenantSlug, isAuthenticated: true }),
      logout: () =>
        set({ user: null, accessToken: null, refreshToken: null, tenantSlug: null, isAuthenticated: false }),
    }),
    { name: 'cityfix-auth' },
  ),
);

interface AppState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>()((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
