'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Search, Filter, Download, Plus, MoreHorizontal,
  MapPin, Clock, AlertTriangle, CheckCircle2,
  ArrowUp, ArrowDown, Eye, ChevronLeft, ChevronRight,
  X, SlidersHorizontal, Loader2
} from 'lucide-react';
import { useIssues } from '@/lib/hooks';

const STATUS_OPTIONS = [
  { value: 'all', label: 'הכל', color: '#9CA3AF' },
  { value: 'NEW', label: 'חדש', color: '#818CF8' },
  { value: 'ASSIGNED', label: 'שויך', color: '#60A5FA' },
  { value: 'IN_PROGRESS', label: 'בטיפול', color: '#FBBF24' },
  { value: 'RESOLVED', label: 'טופל', color: '#34D399' },
  { value: 'CLOSED', label: 'נסגר', color: '#6B7280' },
  { value: 'REJECTED', label: 'נדחה', color: '#F87171' },
];

const URGENCY_OPTIONS = [
  { value: 'all', label: 'כל הדחיפויות' },
  { value: 'CRITICAL', label: 'קריטי', color: '#EF4444' },
  { value: 'HIGH', label: 'גבוהה', color: '#F59E0B' },
  { value: 'NORMAL', label: 'רגילה', color: '#3B82F6' },
  { value: 'LOW', label: 'נמוכה', color: '#6B7280' },
];

const STATUS_COLOR: Record<string, string> = {
  NEW: '#818CF8', ASSIGNED: '#60A5FA', IN_PROGRESS: '#FBBF24',
  ON_HOLD: '#F97316', RESOLVED: '#34D399', CLOSED: '#6B7280',
  REJECTED: '#F87171', PENDING_VERIFICATION: '#A78BFA',
};
const STATUS_LABEL: Record<string, string> = {
  NEW: 'חדש', ASSIGNED: 'שויך', IN_PROGRESS: 'בטיפול',
  ON_HOLD: 'ממתין', RESOLVED: 'טופל', CLOSED: 'נסגר',
  REJECTED: 'נדחה', PENDING_VERIFICATION: 'ממתין לאימות',
};
const URGENCY_COLOR: Record<string, string> = {
  CRITICAL: '#EF4444', HIGH: '#F59E0B', NORMAL: '#3B82F6',
  LOW: '#6B7280', URGENT: '#F59E0B',
};
const CAT_COLOR_POOL = ['#EF4444', '#F59E0B', '#10B981', '#DC2626', '#8B5CF6', '#F97316', '#22C55E', '#3B82F6', '#6366F1', '#EC4899'];

/* ─── Fallback mock data ───────────────────────── */
const MOCK_ISSUES = [
  { id: '1', number: 'CF-2026-00312', category: 'בור בכביש', catColor: '#EF4444', address: 'רחוב הרצל 42', status: 'NEW', statusLabel: 'חדש', statusColor: '#818CF8', urgency: 'HIGH', urgencyColor: '#F59E0B', dept: 'כבישים', reporter: 'יעל ישראלי', date: '20/04', sla: '45 שעות', slaOk: true },
  { id: '2', number: 'CF-2026-00311', category: 'פנס רחוב תקול', catColor: '#F59E0B', address: 'שד\' רוטשילד 18', status: 'ASSIGNED', statusLabel: 'שויך', statusColor: '#60A5FA', urgency: 'NORMAL', urgencyColor: '#3B82F6', dept: 'חשמל', reporter: 'דני אברהם', date: '20/04', sla: '18 שעות', slaOk: true },
  { id: '3', number: 'CF-2026-00310', category: 'פסולת / גזם', catColor: '#10B981', address: 'רחוב דיזנגוף 99', status: 'IN_PROGRESS', statusLabel: 'בטיפול', statusColor: '#FBBF24', urgency: 'NORMAL', urgencyColor: '#3B82F6', dept: 'ניקיון', reporter: 'מיכל לוי', date: '19/04', sla: '2 שעות', slaOk: false },
  { id: '4', number: 'CF-2026-00309', category: 'מפגע בטיחות', catColor: '#DC2626', address: 'רחוב ארלוזורוב 80', status: 'IN_PROGRESS', statusLabel: 'בטיפול', statusColor: '#FBBF24', urgency: 'CRITICAL', urgencyColor: '#EF4444', dept: 'כבישים', reporter: 'עומר חן', date: '19/04', sla: 'חריגה!', slaOk: false },
  { id: '5', number: 'CF-2026-00308', category: 'מדרכה שבורה', catColor: '#8B5CF6', address: 'רחוב אלנבי 30', status: 'NEW', statusLabel: 'חדש', statusColor: '#818CF8', urgency: 'HIGH', urgencyColor: '#F59E0B', dept: 'כבישים', reporter: 'שירה גולד', date: '18/04', sla: '60 שעות', slaOk: true },
  { id: '6', number: 'CF-2026-00307', category: 'רמזור תקול', catColor: '#F97316', address: 'צומת קפלן-איבן גבירול', status: 'ASSIGNED', statusLabel: 'שויך', statusColor: '#60A5FA', urgency: 'HIGH', urgencyColor: '#F59E0B', dept: 'תנועה', reporter: 'אבי כץ', date: '18/04', sla: '12 שעות', slaOk: true },
  { id: '7', number: 'CF-2026-00306', category: 'שלט נפל', catColor: '#22C55E', address: 'רחוב בן יהודה 5', status: 'RESOLVED', statusLabel: 'טופל', statusColor: '#34D399', urgency: 'LOW', urgencyColor: '#6B7280', dept: 'גנים', reporter: 'נעמי פרץ', date: '17/04', sla: '—', slaOk: true },
  { id: '8', number: 'CF-2026-00305', category: 'הצפה', catColor: '#3B82F6', address: 'רחוב חיים ברלב 12', status: 'NEW', statusLabel: 'חדש', statusColor: '#818CF8', urgency: 'NORMAL', urgencyColor: '#3B82F6', dept: 'כבישים', reporter: 'רון שפירא', date: '17/04', sla: '8 שעות', slaOk: true },
  { id: '9', number: 'CF-2026-00304', category: 'רכב נטוש', catColor: '#6366F1', address: 'רחוב פינסקר 44', status: 'PENDING_VERIFICATION', statusLabel: 'ממתין לאימות', statusColor: '#A78BFA', urgency: 'LOW', urgencyColor: '#6B7280', dept: 'תנועה', reporter: 'טל מזרחי', date: '16/04', sla: '36 שעות', slaOk: true },
  { id: '10', number: 'CF-2026-00303', category: 'גרפיטי', catColor: '#EC4899', address: 'רחוב לילינבלום 20', status: 'CLOSED', statusLabel: 'נסגר', statusColor: '#6B7280', urgency: 'LOW', urgencyColor: '#6B7280', dept: 'ניקיון', reporter: 'לינוי ברק', date: '15/04', sla: '—', slaOk: true },
];

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
  } catch { return ''; }
}

export default function AdminIssuesPage() {
  const { tenant } = useParams();
  const { data: apiIssues, loading } = useIssues();
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Normalize API data → UI model, or fall back to mock
  const issues = useMemo(() => {
    if (apiIssues && Array.isArray(apiIssues) && apiIssues.length > 0) {
      return apiIssues.map((issue: any, idx: number) => ({
        id: issue.id,
        number: issue.reportNumber || `CF-${issue.id?.substring(0, 8)}`,
        category: issue.category?.name || issue.categoryName || 'כללי',
        catColor: CAT_COLOR_POOL[idx % CAT_COLOR_POOL.length],
        address: issue.address || issue.location || '',
        status: issue.status || 'NEW',
        statusLabel: STATUS_LABEL[issue.status] || issue.status,
        statusColor: STATUS_COLOR[issue.status] || '#818CF8',
        urgency: issue.priority || 'NORMAL',
        urgencyColor: URGENCY_COLOR[issue.priority] || '#3B82F6',
        dept: issue.department?.name || issue.departmentName || '',
        reporter: issue.reporter
          ? `${issue.reporter.firstName || ''} ${issue.reporter.lastName || ''}`.trim()
          : issue.user
            ? `${issue.user.firstName || ''} ${issue.user.lastName || ''}`.trim()
            : '',
        date: issue.createdAt ? formatDate(issue.createdAt) : '',
        sla: '—',
        slaOk: true,
      }));
    }
    return MOCK_ISSUES;
  }, [apiIssues]);

  const filtered = issues.filter((issue: any) => {
    if (statusFilter !== 'all' && issue.status !== statusFilter) return false;
    if (urgencyFilter !== 'all' && issue.urgency !== urgencyFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!issue.number.toLowerCase().includes(q) &&
          !issue.category.includes(search) &&
          !issue.address.includes(search) &&
          !issue.reporter.includes(search)) return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin" style={{ color: '#6366F1' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface-0)' }}>
      <div className="md:mr-[260px]">
        {/* Top Bar */}
        <header
          className="px-6 py-4 flex items-center justify-between"
          style={{
            background: 'rgba(11,15,26,0.85)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <div className="flex items-center gap-3">
            <Link href={`/${tenant}/admin`} className="p-2 rounded-lg" style={{ background: 'var(--color-surface-2)' }}>
              <ChevronRight size={18} style={{ color: 'var(--color-text-secondary)' }} />
            </Link>
            <h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>ניהול פניות</h1>
            <span className="badge text-xs" style={{ background: 'rgba(99,102,241,0.15)', color: '#818CF8' }}>
              {filtered.length} פניות
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-secondary py-2 px-3 text-xs" style={{ gap: '0.25rem' }}>
              <Download size={14} /> ייצוא
            </button>
          </div>
        </header>

        {/* Search + Filter Bar */}
        <div className="px-6 py-4 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                className="input pl-3 pr-10 py-2.5"
                placeholder="חיפוש לפי מספר, קטגוריה, כתובת, מדווח..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2.5 rounded-xl flex items-center gap-1"
              style={{
                background: showFilters ? 'rgba(99,102,241,0.15)' : 'var(--color-surface-2)',
                color: showFilters ? '#818CF8' : 'var(--color-text-muted)',
                border: `1px solid ${showFilters ? 'rgba(99,102,241,0.3)' : 'var(--color-border)'}`,
              }}
            >
              <SlidersHorizontal size={16} />
            </button>
          </div>

          {/* Status pills */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s.value}
                onClick={() => setStatusFilter(s.value)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all"
                style={{
                  background: statusFilter === s.value ? `${s.color}20` : 'var(--color-surface-2)',
                  color: statusFilter === s.value ? s.color : 'var(--color-text-muted)',
                  border: `1px solid ${statusFilter === s.value ? `${s.color}40` : 'transparent'}`,
                }}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Extended filters */}
          {showFilters && (
            <div className="glass-card p-4 animate-slide-up flex flex-wrap gap-3">
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--color-text-muted)' }}>דחיפות</label>
                <select
                  className="select text-sm py-1.5"
                  style={{ width: 140 }}
                  value={urgencyFilter}
                  onChange={(e) => setUrgencyFilter(e.target.value)}
                >
                  {URGENCY_OPTIONS.map((u) => (
                    <option key={u.value} value={u.value}>{u.label}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => { setStatusFilter('all'); setUrgencyFilter('all'); setSearch(''); }}
                className="text-xs font-medium self-end pb-1.5"
                style={{ color: '#818CF8' }}
              >
                נקה מסננים
              </button>
            </div>
          )}
        </div>

        {/* Issues Table */}
        <div className="px-6 pb-8">
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    {['מספר', 'קטגוריה', 'כתובת', 'מדווח', 'סטטוס', 'דחיפות', 'מחלקה', 'SLA', ''].map((h) => (
                      <th key={h} className="px-4 py-3 text-right text-xs font-semibold whitespace-nowrap" style={{ color: 'var(--color-text-muted)' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((issue: any) => (
                    <tr
                      key={issue.id}
                      className="transition-colors hover:bg-white/[0.02] cursor-pointer"
                      style={{ borderBottom: '1px solid var(--color-border)' }}
                    >
                      <td className="px-4 py-3">
                        <Link href={`/${tenant}/admin/issues/${issue.id}`} className="text-sm font-mono font-semibold" style={{ color: '#818CF8' }}>
                          {issue.number}
                        </Link>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{issue.date}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: issue.catColor }} />
                          <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{issue.category}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{issue.address}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{issue.reporter}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="badge" style={{ background: `${issue.statusColor}15`, color: issue.statusColor }}>
                          {issue.statusLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: issue.urgencyColor }} />
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{issue.dept}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold" style={{ color: issue.slaOk ? 'var(--color-text-muted)' : '#EF4444' }}>
                          {issue.sla}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button className="p-1 rounded" style={{ color: 'var(--color-text-muted)' }}>
                          <MoreHorizontal size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--color-border)' }}>
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                מציג 1-{filtered.length} מתוך {filtered.length}
              </span>
              <div className="flex items-center gap-1">
                <button className="p-1.5 rounded" style={{ color: 'var(--color-text-muted)' }}>
                  <ChevronRight size={16} />
                </button>
                <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold" style={{ background: 'rgba(99,102,241,0.15)', color: '#818CF8' }}>
                  1
                </span>
                <button className="p-1.5 rounded" style={{ color: 'var(--color-text-muted)' }}>
                  <ChevronLeft size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
