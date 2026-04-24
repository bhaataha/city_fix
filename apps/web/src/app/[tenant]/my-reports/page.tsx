'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ChevronRight, Search, Plus,
  MapPin, Clock, ArrowUp,
  AlertTriangle, Loader2
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

const STATUS_FILTERS = [
  { label: 'הכל', value: 'all', color: '#9CA3AF' },
  { label: 'חדש', value: 'NEW', color: '#818CF8' },
  { label: 'הוקצה', value: 'ASSIGNED', color: '#60A5FA' },
  { label: 'בטיפול', value: 'IN_PROGRESS', color: '#FBBF24' },
  { label: 'טופל', value: 'RESOLVED', color: '#34D399' },
  { label: 'נסגר', value: 'CLOSED', color: '#6B7280' },
];

const STATUS_LABEL: Record<string, string> = {
  NEW: 'חדש',
  ASSIGNED: 'הוקצה',
  IN_PROGRESS: 'בטיפול',
  RESOLVED: 'טופל',
  CLOSED: 'נסגר',
  REJECTED: 'נדחה',
  DUPLICATE: 'כפול',
};

const STATUS_COLOR: Record<string, string> = {
  NEW: '#818CF8',
  ASSIGNED: '#60A5FA',
  IN_PROGRESS: '#FBBF24',
  RESOLVED: '#34D399',
  CLOSED: '#6B7280',
  REJECTED: '#EF4444',
  DUPLICATE: '#9CA3AF',
};

const URGENCY_LABEL: Record<string, string> = {
  LOW: 'נמוכה',
  NORMAL: 'רגילה',
  HIGH: 'גבוהה',
  CRITICAL: 'קריטית',
};

const URGENCY_COLOR: Record<string, string> = {
  LOW: '#6B7280',
  NORMAL: '#3B82F6',
  HIGH: '#F59E0B',
  CRITICAL: '#EF4444',
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

export default function MyReportsPage() {
  const { tenant } = useParams();
  const { accessToken, user } = useAuthStore();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    if (!tenant) return;
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (activeFilter !== 'all') params.status = activeFilter;
      if (searchQuery) params.search = searchQuery;

      const res = await api.getIssues(tenant as string, params);
      if (res.success && res.data) {
        // Filter to only user's own reports if logged in
        let items = Array.isArray(res.data) ? res.data : [];
        if (user?.id) {
          items = items.filter((r: any) => r.reporterId === user.id || r.reporter?.id === user.id);
        }
        setReports(items);
      }
    } catch (e) {
      console.error('Failed to fetch reports', e);
    } finally {
      setLoading(false);
    }
  }, [tenant, activeFilter, searchQuery, user?.id]);

  useEffect(() => {
    const debounce = setTimeout(() => fetchReports(), 300);
    return () => clearTimeout(debounce);
  }, [fetchReports]);

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
            הפניות שלי
          </h1>
        </div>
        <Link href={`/${tenant}/report`} className="btn-primary text-sm py-2 px-3 sm:px-4 flex-shrink-0">
          <Plus size={16} />
          <span className="hidden sm:inline">דיווח חדש</span>
          <span className="sm:hidden">דווח</span>
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

      {/* Reports List */}
      <div className="px-4 sm:px-6 pb-8 space-y-2.5">
        {loading ? (
          <div className="text-center py-16">
            <Loader2 size={32} className="mx-auto mb-3 animate-spin" style={{ color: '#818CF8' }} />
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>טוען פניות...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-16">
            <AlertTriangle size={40} className="mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
            <p className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              לא נמצאו פניות
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
              נסו לשנות את מסנן הסטטוס או את חיפוש
            </p>
          </div>
        ) : (
          reports.map((report, i) => (
            <Link
              key={report.id}
              href={`/${tenant}/issues/${report.id}`}
              className="glass-card block p-3 sm:p-4 animate-slide-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {/* Top row: number + status */}
              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: report.category?.color || '#818CF8' }}
                  />
                  <span className="text-xs font-mono font-semibold truncate" style={{ color: '#818CF8' }}>
                    {report.reportNumber}
                  </span>
                </div>
                <span
                  className="badge flex-shrink-0"
                  style={{
                    background: `${STATUS_COLOR[report.status] || '#9CA3AF'}15`,
                    color: STATUS_COLOR[report.status] || '#9CA3AF',
                  }}
                >
                  {STATUS_LABEL[report.status] || report.status}
                </span>
              </div>

              {/* Category */}
              <div className="text-sm font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                {report.category?.name || 'כללי'}
              </div>

              {/* Description */}
              <p
                className="text-xs mb-2 sm:mb-3 line-clamp-2"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {report.description}
              </p>

              {/* Bottom row: meta info */}
              <div className="flex items-center gap-3 sm:gap-4 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {report.address && (
                  <span className="flex items-center gap-1 truncate">
                    <MapPin size={12} className="flex-shrink-0" />
                    <span className="truncate">{report.address}</span>
                  </span>
                )}
                <span className="flex items-center gap-1 flex-shrink-0">
                  <Clock size={12} />
                  {timeAgo(report.createdAt)}
                </span>
              </div>

              {/* Urgency + engagement */}
              <div className="flex items-center justify-between mt-2.5 sm:mt-3 pt-2.5 sm:pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded"
                    style={{
                      background: `${URGENCY_COLOR[report.urgency] || '#3B82F6'}15`,
                      color: URGENCY_COLOR[report.urgency] || '#3B82F6',
                    }}
                  >
                    {URGENCY_LABEL[report.urgency] || 'רגילה'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {report._count?.attachments > 0 && (
                    <span>📎 {report._count.attachments}</span>
                  )}
                  <span className="flex items-center gap-1">
                    💬 {report._count?.comments || 0}
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
