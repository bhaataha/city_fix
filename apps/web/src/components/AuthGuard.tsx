'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Loader2, ShieldAlert } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

/**
 * Protects routes by checking auth state from Zustand.
 * Renders children only when authenticated (and optionally role-matched).
 * Redirects unauthenticated users to the tenant login page.
 */
export function AuthGuard({ children, requiredRoles }: AuthGuardProps) {
  const { tenant } = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Wait one tick for zustand persist rehydration
    const timer = setTimeout(() => setChecked(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!checked) return;
    if (!isAuthenticated) {
      router.replace(`/${tenant}/auth/login`);
    }
  }, [checked, isAuthenticated, router, tenant]);

  // Still hydrating
  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-surface-0)' }}>
        <Loader2 size={32} className="animate-spin" style={{ color: '#6366F1' }} />
      </div>
    );
  }

  // Not authenticated — will redirect
  if (!isAuthenticated) {
    return null;
  }

  // Role check
  if (requiredRoles && user && !requiredRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: 'var(--color-surface-0)' }}>
        <ShieldAlert size={48} style={{ color: '#EF4444' }} />
        <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>אין הרשאה</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>אין לך הרשאה לצפות בדף זה</p>
        <button
          onClick={() => router.push(`/${tenant}`)}
          className="btn-primary mt-4"
        >
          חזרה לדף הבית
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
