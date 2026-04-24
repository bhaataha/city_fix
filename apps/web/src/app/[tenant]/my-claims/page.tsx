'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ChevronRight, Search, Plus,
  MapPin, Clock, FileText,
  AlertTriangle, Loader2
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

const STATUS_FILTERS = [
  { label: 'הכל', value: 'all', color: '#9CA3AF' },
  { label: 'חדש', value: 'NEW', color: '#818CF8' },
  { label: 'בבדיקה', value: 'UNDER_REVIEW', color: '#FBBF24' },
  { label: 'ממתין למסמכים', value: 'WAITING_DOCS', color: '#60A5FA' },
  { label: 'מאושר', value: 'APPROVED', color: '#34D399' },
  { label: 'נדחה', value: 'REJECTED', color: '#EF4444' },
  { label: 'סגור', value: 'CLOSED', color: '#6B7280' },
];

const STATUS_LABEL: Record<string, string> = {
  NEW: 'חדש',
  UNDER_REVIEW: 'בבדיקה',
  WAITING_DOCS: 'ממתין למסמכים',
  APPROVED: 'מאושר',
  PARTIALLY_APPROVED: 'מאושר חלקית',
  REJECTED: 'נדחה',
  CLOSED: 'סגור',
};

const STATUS_COLOR: Record<string, string> = {
  NEW: '#818CF8',
  UNDER_REVIEW: '#FBBF24',
  WAITING_DOCS: '#60A5FA',
  APPROVED: '#34D399',
  PARTIALLY_APPROVED: '#10B981',
  REJECTED: '#EF4444',
  CLOSED: '#6B7280',
};

const CLAIM_TYPE_LABEL: Record<string, string> = {
  VEHICLE_DAMAGE: 'נזק לרכב',
  PROPERTY_DAMAGE: 'נזק לרכוש',
  PERSONAL_INJURY: 'פגיעה גופנית',
  INCOME_LOSS: 'הפסד הכנסה',
  THIRD_PARTY: 'צד ג\'',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'עכשיו';
  if (mins < 60) return `לפני ${mins} דק'`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `לפני ${hours === 1 ? 'שעה' : `${hours} שעות`}`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'אתמול';
  if (days < 7) return `לפני ${days} ימים`;
  return new Date(dateStr).toLocaleDateString('he-IL');
}

export default function MyClaimsPage() {
  const { tenant } = useParams();
  const { accessToken, isAuthenticated } = useAuthStore();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClaims = useCallback(async () => {
    if (!tenant || !accessToken) return;
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (activeFilter !== 'all') params.status = activeFilter;
      if (searchQuery) params.search = searchQuery;

      const res = await api.getClaims(tenant as string, accessToken, params);
      if (res.success && res.data) {
        setClaims(Array.isArray(res.data) ? res.data : []);
      }
    } catch (e) {
      console.error('Failed to fetch claims', e);
    } finally {
      setLoading(false);
    }
  }, [tenant, activeFilter, searchQuery, accessToken]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const debounce = setTimeout(() => fetchClaims(), 300);
    return () => clearTimeout(debounce);
  }, [fetchClaims, isAuthenticated]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface-0)', overflowX: 'hidden' }}>
      {/* Header */}
      <header
        className="px-4 sm:px-6 py-3 flex items-center justify-between"
        style={{
          background: 'rgba(11,15,26,0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Link
            href={`/${tenant}`}
            className="p-2 rounded-lg flex-shrink-0"
            style={{ background: 'var(--color-surface-2)' }}
          >
            <ChevronRight size={18} style={{ color: 'var(--color-text-secondary)' }} />
          </Link>
          <h1 className="text-base sm:text-lg font-bold truncate" style={{ color: 'var(--color-text-primary)' }}>
            התביעות שלי
          </h1>
        </div>
        <Link href={`/${tenant}/claim`} className="btn-primary text-sm py-2 px-3 sm:px-4 flex-shrink-0">
          <Plus size={16} />
          <span className="hidden sm:inline">תביעה חדשה</span>
          <span className="sm:hidden">תבע</span>
        </Link>
      </header>

      {/* Search + Filters */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 space-y-2.5">
        <div className="relative">
          <input
            className="input py-2.5"
            style={{ paddingInlineStart: '2.5rem' }}
            placeholder="חיפוש לפי מספר, תיאור או כתובת..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search
            size={16}
            className="absolute top-1/2 -translate-y-1/2"
            style={{ color: 'var(--color-text-muted)', insetInlineStart: '0.75rem' }}
          />
        </div>

        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className="px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all"
              style={{
                background: activeFilter === f.value ? `${f.color}20` : 'var(--color-surface-2)',
                color: activeFilter === f.value ? f.color : 'var(--color-text-muted)',
                border: `1px solid ${activeFilter === f.value ? `${f.color}40` : 'var(--color-border)'}`,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Claims List */}
      <div className="px-4 sm:px-6 pb-8 space-y-2.5">
        {loading ? (
          <div className="text-center py-16">
            <Loader2 size={32} className="mx-auto mb-3 animate-spin" style={{ color: '#818CF8' }} />
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>טוען תביעות...</p>
          </div>
        ) : claims.length === 0 ? (
          <div className="text-center py-16">
            <AlertTriangle size={40} className="mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
            <p className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              לא נמצאו תביעות
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
              נסו לשנות את מסנן הסטטוס או את החיפוש
            </p>
          </div>
        ) : (
          claims.map((claim, i) => (
            <Link
              key={claim.id}
              href={`/${tenant}/claim/${claim.id}`}
              className="glass-card block p-3 sm:p-4 animate-slide-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {/* Top row: number + status */}
              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: '#F59E0B' }}
                  />
                  <span className="text-xs font-mono font-semibold truncate" style={{ color: '#F59E0B' }}>
                    {claim.claimNumber}
                  </span>
                </div>
                <span
                  className="badge flex-shrink-0"
                  style={{
                    background: `${STATUS_COLOR[claim.status] || '#9CA3AF'}15`,
                    color: STATUS_COLOR[claim.status] || '#9CA3AF',
                  }}
                >
                  {STATUS_LABEL[claim.status] || claim.status}
                </span>
              </div>

              {/* Type */}
              <div className="text-sm font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                {CLAIM_TYPE_LABEL[claim.claimType] || claim.claimType}
              </div>

              {/* Description */}
              <p
                className="text-xs mb-2 sm:mb-3 line-clamp-2"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {claim.eventDescription}
              </p>

              {/* Bottom row: meta info */}
              <div className="flex items-center gap-3 sm:gap-4 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {claim.eventAddress && (
                  <span className="flex items-center gap-1 truncate">
                    <MapPin size={12} className="flex-shrink-0" />
                    <span className="truncate">{claim.eventAddress}</span>
                  </span>
                )}
                <span className="flex items-center gap-1 flex-shrink-0">
                  <Clock size={12} />
                  {timeAgo(claim.createdAt)}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
