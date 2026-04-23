'use client';

import { useEffect } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart3, AlertTriangle, MapPin, Users, Layers,
  FileText, Settings, Building2, LogOut, X, Menu,
  ChevronLeft
} from 'lucide-react';
import { useAuthStore, useAppStore } from '@/lib/store';
import { AuthGuard } from '@/components/AuthGuard';

const SIDEBAR_LINKS = [
  { icon: BarChart3, label: 'דשבורד', href: 'admin' },
  { icon: AlertTriangle, label: 'פניות', href: 'admin/issues' },
  { icon: MapPin, label: 'מפה', href: 'map' },
  { icon: Users, label: 'צוות', href: 'admin/team' },
  { icon: Layers, label: 'מחלקות', href: 'admin/departments' },
  { icon: FileText, label: 'תביעות', href: 'admin/claims' },
  { icon: Settings, label: 'הגדרות', href: 'admin/settings' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { tenant } = useParams();
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useAppStore();
  const { user, logout } = useAuthStore();
  const router = useRouter();

  // Resolve which sidebar link is active
  const currentPath = pathname.replace(`/${tenant}/`, '');

  const handleLogout = () => {
    logout();
    router.push(`/${tenant}/auth/login`);
  };

  return (
    <AuthGuard requiredRoles={['ADMIN', 'DEPT_MANAGER', 'CALL_CENTER']}>
    <div className="min-h-screen" style={{ background: 'var(--color-surface-0)' }}>
      {/* ─── Sidebar ─────────────────────────────── */}
      <aside
        className={`sidebar ${sidebarOpen ? 'open' : ''}`}
        style={{ borderLeft: 'none', borderRight: '1px solid var(--color-border)' }}
      >
        {/* Logo */}
        <div className="px-4 py-5 flex items-center gap-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)' }}
          >
            <Building2 size={18} color="white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm gradient-text">CityFix</div>
            <div className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
              {String(tenant).replace(/-/g, ' ')}
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1 rounded"
          >
            <X size={18} style={{ color: 'var(--color-text-muted)' }} />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {SIDEBAR_LINKS.map((link) => {
            const isActive =
              currentPath === link.href ||
              (link.href !== 'admin' && currentPath.startsWith(link.href));
            return (
              <Link
                key={link.label}
                href={`/${tenant}/${link.href}`}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <link.icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="px-4 py-4" style={{ borderTop: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #818CF8, #6366F1)' }}
            >
              <span className="text-xs font-bold text-white">
                {user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}` : 'מנ'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {user ? `${user.firstName} ${user.lastName}` : 'מנהל ראשי'}
              </div>
              <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {user?.role === 'ADMIN' ? 'מנהל' : user?.role === 'DEPT_MANAGER' ? 'מנהל מחלקה' : 'מנהל'}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Mobile Overlay ──────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ─── Mobile Top Bar ──────────────────────── */}
      <div
        className="md:hidden sticky top-0 z-20 px-4 py-3 flex items-center gap-3"
        style={{
          background: 'rgba(11,15,26,0.92)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg" style={{ background: 'var(--color-surface-2)' }}>
          <Menu size={18} style={{ color: 'var(--color-text-secondary)' }} />
        </button>
        <div className="font-bold text-sm gradient-text flex-1">CityFix Admin</div>
        <Link href={`/${tenant}`} className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          <ChevronLeft size={14} className="inline" /> חזרה
        </Link>
      </div>

      {/* ─── Main Content ────────────────────────── */}
      <div className="md:mr-[260px]">
        {children}
      </div>
    </div>
    </AuthGuard>
  );
}
