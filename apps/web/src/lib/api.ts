import { useAuthStore } from './store';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4100/api';

interface FetchOptions extends RequestInit {
  token?: string;
}

async function apiFetch<T = any>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<{ success: boolean; data?: T; error?: string; meta?: any }> {
  let { token, headers: customHeaders, ...rest } = options;

  if (!token) {
    token = useAuthStore.getState().accessToken || undefined;
  }

  const getHeaders = (currentToken?: string) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(customHeaders as Record<string, string>),
    };
    if (currentToken) {
      headers['Authorization'] = `Bearer ${currentToken}`;
    }
    return headers;
  };

  try {
    let res = await fetch(`${API_BASE}/${endpoint}`, {
      headers: getHeaders(token),
      ...rest,
    });

    if (res.status === 401 && useAuthStore.getState().refreshToken && !endpoint.includes('auth/')) {
      const tenant = useAuthStore.getState().tenantSlug;
      const refreshToken = useAuthStore.getState().refreshToken;
      
      try {
        const refreshRes = await fetch(`${API_BASE}/${tenant}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          if (refreshData.success && refreshData.data) {
            const { user, accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshData.data;
            useAuthStore.getState().setAuth(user, newAccessToken, newRefreshToken, String(tenant));
            
            res = await fetch(`${API_BASE}/${endpoint}`, {
              headers: getHeaders(newAccessToken),
              ...rest,
            });
          } else {
            useAuthStore.getState().logout();
          }
        } else {
          useAuthStore.getState().logout();
        }
      } catch (err) {
        useAuthStore.getState().logout();
      }
    }

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.message || 'Something went wrong' };
    }

    return data;
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

export const api = {
  // Tenants
  getTenants: () => apiFetch('tenants'),
  getTenant: (slug: string) => apiFetch(`tenants/${slug}`),

  // Auth
  register: (tenant: string, data: any) =>
    apiFetch(`${tenant}/auth/register`, { method: 'POST', body: JSON.stringify(data) }),
  login: (tenant: string, data: any) =>
    apiFetch(`${tenant}/auth/login`, { method: 'POST', body: JSON.stringify(data) }),
  forgotPassword: (tenant: string, email: string) =>
    apiFetch(`${tenant}/auth/forgot-password`, { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (tenant: string, data: any) =>
    apiFetch(`${tenant}/auth/reset-password`, { method: 'POST', body: JSON.stringify(data) }),

  // Issues
  getIssues: (tenant: string, params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiFetch(`${tenant}/issues${query}`);
  },
  getIssue: (tenant: string, id: string) =>
    apiFetch(`${tenant}/issues/${id}`),
  createIssue: (tenant: string, data: any, token?: string) =>
    apiFetch(`${tenant}/issues`, { method: 'POST', body: JSON.stringify(data), token }),
  updateIssueStatus: (tenant: string, id: string, data: any, token: string) =>
    apiFetch(`${tenant}/issues/${id}/status`, { method: 'PATCH', body: JSON.stringify(data), token }),
  getMapIssues: (tenant: string, bounds?: any) => {
    const query = bounds ? '?' + new URLSearchParams(bounds).toString() : '';
    return apiFetch(`${tenant}/issues/map${query}`);
  },
  getIssueStats: (tenant: string) =>
    apiFetch(`${tenant}/issues/stats`),
  addComment: (tenant: string, issueId: string, data: { content: string; isInternal?: boolean }, token: string) =>
    apiFetch(`${tenant}/issues/${issueId}/comments`, { method: 'POST', body: JSON.stringify(data), token }),
  assignIssue: (tenant: string, issueId: string, userId: string, token: string) =>
    apiFetch(`${tenant}/issues/${issueId}/assign`, { method: 'PATCH', body: JSON.stringify({ userId }), token }),

  // Categories
  getCategories: (tenant: string) =>
    apiFetch(`${tenant}/categories`),

  // Departments
  getDepartments: (tenant: string) =>
    apiFetch(`${tenant}/departments`),
  getDepartment: (tenant: string, id: string) =>
    apiFetch(`${tenant}/departments/${id}`),
  createDepartment: (tenant: string, token: string, data: any) =>
    apiFetch(`${tenant}/departments`, { method: 'POST', body: JSON.stringify(data), token }),
  updateDepartment: (tenant: string, id: string, data: any, token: string) =>
    apiFetch(`${tenant}/departments/${id}`, { method: 'PATCH', body: JSON.stringify(data), token }),
  deleteDepartment: (tenant: string, id: string, token: string) =>
    apiFetch(`${tenant}/departments/${id}`, { method: 'DELETE', token }),

  // Dashboard
  getDashboard: (tenant: string, token: string) =>
    apiFetch(`${tenant}/dashboard`, { token }),

  // Users / Team
  getProfile: (tenant: string, token: string) =>
    apiFetch(`${tenant}/users/me`, { token }),
  updateProfile: (tenant: string, data: any, token: string) =>
    apiFetch(`${tenant}/users/me`, { method: 'PATCH', body: JSON.stringify(data), token }),
  getTeamMembers: (tenant: string, token: string, params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiFetch(`${tenant}/users/team${query}`, { token });
  },
  updateUser: (tenant: string, userId: string, data: any, token: string) =>
    apiFetch(`${tenant}/users/${userId}`, { method: 'PATCH', body: JSON.stringify(data), token }),
  createUser: (tenant: string, data: any, token: string) =>
    apiFetch(`${tenant}/users`, { method: 'POST', body: JSON.stringify(data), token }),

  // Claims
  getClaims: (tenant: string, token: string, params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiFetch(`${tenant}/claims${query}`, { token });
  },
  getClaim: (tenant: string, id: string, token: string) =>
    apiFetch(`${tenant}/claims/${id}`, { token }),
  createClaim: (tenant: string, data: any, token: string) =>
    apiFetch(`${tenant}/claims`, { method: 'POST', body: JSON.stringify(data), token }),
  updateClaimStatus: (tenant: string, id: string, data: any, token: string) =>
    apiFetch(`${tenant}/claims/${id}/status`, { method: 'PATCH', body: JSON.stringify(data), token }),

  // Settings
  getSettings: (tenant: string, token: string) =>
    apiFetch(`${tenant}/settings`, { token }),
  updateSettings: (tenant: string, data: any, token: string) =>
    apiFetch(`${tenant}/settings`, { method: 'PATCH', body: JSON.stringify(data), token }),

  // Transparency (public)
  getTransparencyStats: (tenant: string) =>
    apiFetch(`${tenant}/transparency/stats`),

  // Notifications
  getNotifications: (tenant: string, token: string, params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiFetch(`${tenant}/notifications${query}`, { token });
  },
  markNotificationRead: (tenant: string, id: string, token: string) =>
    apiFetch(`${tenant}/notifications/${id}/read`, { method: 'PATCH', token }),
  markAllNotificationsRead: (tenant: string, token: string) =>
    apiFetch(`${tenant}/notifications/read-all`, { method: 'PATCH', token }),

  // Uploads (uses FormData, not JSON)
  uploadIssuePhotos: async (tenant: string, issueId: string, files: File[], token: string) => {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));

    let currentToken = token || useAuthStore.getState().accessToken;

    const doUpload = async (authToken: string) => fetch(`${API_BASE}/${tenant}/uploads/issues/${issueId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: formData,
    });

    try {
      let res = await doUpload(currentToken as string);

      if (res.status === 401 && useAuthStore.getState().refreshToken) {
        const refreshToken = useAuthStore.getState().refreshToken;
        try {
          const refreshRes = await fetch(`${API_BASE}/${tenant}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            if (refreshData.success && refreshData.data) {
              const { user, accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshData.data;
              useAuthStore.getState().setAuth(user, newAccessToken, newRefreshToken, String(tenant));
              res = await doUpload(newAccessToken);
            } else {
              useAuthStore.getState().logout();
            }
          } else {
            useAuthStore.getState().logout();
          }
        } catch (err) {
          useAuthStore.getState().logout();
        }
      }

      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  deleteAttachment: (tenant: string, issueId: string, attachmentId: string, token: string) =>
    apiFetch(`${tenant}/uploads/issues/${issueId}/${attachmentId}`, { method: 'DELETE', token }),
};
