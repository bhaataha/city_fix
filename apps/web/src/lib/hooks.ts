'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from './api';
import { useAuthStore } from './store';

// ─── Generic Data Hook ──────────────────────────────
function useApiData<T>(
  fetcher: () => Promise<{ success: boolean; data?: T; error?: string; meta?: any }>,
  deps: any[] = [],
) {
  const [data, setData] = useState<T | null>(null);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      if (result.success) {
        setData(result.data || null);
        setMeta(result.meta || null);
      } else {
        setError(result.error || 'שגיאה לא צפויה');
      }
    } catch (err: any) {
      setError(err.message || 'שגיאת רשת');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, meta, loading, error, refetch };
}

// ─── Tenant Helper ──────────────────────────────────
function useTenant() {
  const params = useParams();
  return String(params?.tenant || '');
}

// ─── Auth Hook ──────────────────────────────────────
export function useAuth() {
  const tenant = useTenant();
  const router = useRouter();
  const { user, accessToken, isAuthenticated, setAuth, logout: storeLogout } = useAuthStore();

  const login = async (email: string, password: string) => {
    const result = await api.login(tenant, { email, password });
    if (result.success && result.data) {
      setAuth(result.data.user, result.data.accessToken, result.data.refreshToken, tenant);
      return { success: true };
    }
    return { success: false, error: result.error };
  };

  const register = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => {
    const result = await api.register(tenant, data);
    if (result.success && result.data) {
      setAuth(result.data.user, result.data.accessToken, result.data.refreshToken, tenant);
      return { success: true };
    }
    return { success: false, error: result.error };
  };

  const logout = () => {
    storeLogout();
    router.push(`/${tenant}/auth/login`);
  };

  return {
    user,
    token: accessToken,
    isAuthenticated,
    login,
    register,
    logout,
    tenant,
  };
}

// ─── Issues Hook ────────────────────────────────────
export function useIssues(params?: Record<string, string>) {
  const tenant = useTenant();
  return useApiData(
    () => api.getIssues(tenant, params),
    [tenant, JSON.stringify(params)],
  );
}

export function usePublicIssues(params?: Record<string, string>) {
  return useApiData(
    () => api.getPublicIssues(params),
    [JSON.stringify(params)],
  );
}

export function useIssue(id: string) {
  const tenant = useTenant();
  return useApiData(
    () => api.getIssue(tenant, id),
    [tenant, id],
  );
}

export function useIssueStats() {
  const tenant = useTenant();
  return useApiData(
    () => api.getIssueStats(tenant),
    [tenant],
  );
}

// ─── Map Issues Hook ────────────────────────────────
export function useMapIssues(bounds?: any) {
  const tenant = useTenant();
  return useApiData(
    () => api.getMapIssues(tenant, bounds),
    [tenant, JSON.stringify(bounds)],
  );
}

// ─── Categories Hook ────────────────────────────────
export function useCategories() {
  const tenant = useTenant();
  return useApiData(
    () => api.getCategories(tenant),
    [tenant],
  );
}

// ─── Departments Hook ───────────────────────────────
export function useDepartments() {
  const tenant = useTenant();
  return useApiData(
    () => api.getDepartments(tenant),
    [tenant],
  );
}

// ─── Dashboard Hook ─────────────────────────────────
export function useDashboard() {
  const tenant = useTenant();
  const { accessToken } = useAuthStore();
  return useApiData(
    () => api.getDashboard(tenant, accessToken || ''),
    [tenant, accessToken],
  );
}

export function useAdoptionOrphans() {
  const { accessToken } = useAuthStore();
  return useApiData(
    () => api.getAdoptionOrphans(accessToken || ''),
    [accessToken],
  );
}

// ─── Team Hook ──────────────────────────────────────
export function useTeam(params?: Record<string, string>) {
  const tenant = useTenant();
  const { accessToken } = useAuthStore();
  return useApiData(
    () => api.getTeamMembers(tenant, accessToken || '', params),
    [tenant, accessToken, JSON.stringify(params)],
  );
}

// ─── Claims Hook ────────────────────────────────────
export function useClaims(params?: Record<string, string>) {
  const tenant = useTenant();
  const { accessToken } = useAuthStore();
  return useApiData(
    () => api.getClaims(tenant, accessToken || '', params),
    [tenant, accessToken, JSON.stringify(params)],
  );
}

export function useClaim(id: string) {
  const tenant = useTenant();
  const { accessToken } = useAuthStore();
  return useApiData(
    () => api.getClaim(tenant, id, accessToken || ''),
    [tenant, id, accessToken],
  );
}

// ─── Settings Hook ──────────────────────────────────
export function useSettings() {
  const tenant = useTenant();
  const { accessToken } = useAuthStore();
  return useApiData(
    () => api.getSettings(tenant, accessToken || ''),
    [tenant, accessToken],
  );
}

// ─── Transparency Hook ──────────────────────────────
export function useTransparencyStats() {
  const tenant = useTenant();
  return useApiData(
    () => api.getTransparencyStats(tenant),
    [tenant],
  );
}

// ─── Profile Hook ───────────────────────────────────
export function useProfile() {
  const tenant = useTenant();
  const { accessToken } = useAuthStore();
  return useApiData(
    () => api.getProfile(tenant, accessToken || ''),
    [tenant, accessToken],
  );
}

// ─── Notifications Hook ─────────────────────────────
export function useNotifications(params?: Record<string, string>) {
  const tenant = useTenant();
  const { accessToken } = useAuthStore();
  return useApiData(
    () => api.getNotifications(tenant, accessToken || '', params),
    [tenant, accessToken, JSON.stringify(params)],
  );
}
