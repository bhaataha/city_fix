'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart3, AlertTriangle, TrendingUp,
  CheckCircle2, Clock, Search,
  ArrowUp, ArrowDown, Loader2,
} from 'lucide-react';
import { useDashboard } from '@/lib/hooks';
import dynamic from 'next/dynamic';

const DashboardCharts = dynamic(() => import('@/components/DashboardCharts'), { ssr: false });

/* ─── Fallback mock data ────────────────────────────── */
const MOCK_KPI = [
  { label: 'פניות פתוחות', value: '247', change: '+12%', trend: 'up', icon: AlertTriangle, color: '#818CF8' },
  { label: 'חדשות היום', value: '18', change: '+3', trend: 'up', icon: TrendingUp, color: '#F59E0B' },
  { label: 'טופלו השבוע', value: '62', change: '+28%', trend: 'up', icon: CheckCircle2, color: '#10B981' },
  { label: 'SLA ממוצע', value: '2.4 ימים', change: '-15%', trend: 'down', icon: Clock, color: '#EF4444' },
];

const MOCK_STATUS = [
  { label: 'חדש', count: 58, pct: 23, color: '#818CF8' },
  { label: 'שויך', count: 45, pct: 18, color: '#60A5FA' },
  { label: 'בטיפול', count: 82, pct: 33, color: '#FBBF24' },
  { label: 'ממתין', count: 22, pct: 9, color: '#F97316' },
  { label: 'טופל', count: 40, pct: 16, color: '#34D399' },
];

const MOCK_RECENT = [
  { id: '1', number: 'CF-2026-00312', category: 'בור בכביש', location: 'רחוב הרצל 42', status: 'חדש', urgency: 'URGENT', time: 'לפני 22 דק\'', statusColor: '#818CF8', urgencyColor: '#F59E0B' },
  { id: '2', number: 'CF-2026-00311', category: 'פנס רחוב תקול', location: 'שד\' רוטשילד 18', status: 'שויך', urgency: 'NORMAL', time: 'לפני 45 דק\'', statusColor: '#60A5FA', urgencyColor: '#10B981' },
  { id: '3', number: 'CF-2026-00310', category: 'פסולת / גזם', location: 'רחוב דיזנגוף 99', status: 'בטיפול', urgency: 'NORMAL', time: 'לפני שעה', statusColor: '#FBBF24', urgencyColor: '#10B981' },
  { id: '4', number: 'CF-2026-00309', category: 'מדרכה שבורה', location: 'רחוב אלנבי 30', status: 'חדש', urgency: 'URGENT', time: 'לפני 2 שעות', statusColor: '#818CF8', urgencyColor: '#EF4444' },
  { id: '5', number: 'CF-2026-00308', category: 'שלט נפל', location: 'רחוב בן יהודה 5', status: 'טופל', urgency: 'LOW', time: 'לפני 3 שעות', statusColor: '#34D399', urgencyColor: '#6B7280' },
];

const STATUS_COLOR_MAP: Record<string, string> = {
  NEW: '#818CF8', ASSIGNED: '#60A5FA', IN_PROGRESS: '#FBBF24',
  ON_HOLD: '#F97316', RESOLVED: '#34D399', CLOSED: '#6B7280',
};

const STATUS_LABEL_MAP: Record<string, string> = {
  NEW: 'חדש', ASSIGNED: 'שויך', IN_PROGRESS: 'בטיפול',
  ON_HOLD: 'ממתין', RESOLVED: 'טופל', CLOSED: 'סגור',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `לפני ${mins} דק'`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `לפני ${hours} שעות`;
  const days = Math.floor(hours / 24);
  return `לפני ${days} ימים`;
}

export default function AdminDashboard() {
  const { tenant } = useParams();
  const { data: apiDash, loading } = useDashboard();

  // Derive KPIs from API or fallback
  const kpis = useMemo(() => {
    if (apiDash && typeof apiDash === 'object') {
      const d = apiDash as any;
      return [
        {
          label: 'פניות פתוחות', value: String(d.openIssues ?? d.stats?.openIssues ?? '247'),
          change: d.openIssuesChange ?? '+12%', trend: 'up',
          icon: AlertTriangle, color: '#818CF8',
        },
        {
          label: 'חדשות היום', value: String(d.newToday ?? d.stats?.newToday ?? '18'),
          change: d.newTodayChange ?? '+3', trend: 'up',
          icon: TrendingUp, color: '#F59E0B',
        },
        {
          label: 'טופלו השבוע', value: String(d.resolvedThisWeek ?? d.stats?.resolvedThisWeek ?? '62'),
          change: d.resolvedChange ?? '+28%', trend: 'up',
          icon: CheckCircle2, color: '#10B981',
        },
        {
          label: 'SLA ממוצע', value: `${d.avgSla ?? d.stats?.avgSla ?? '2.4'} ימים`,
          change: d.slaChange ?? '-15%', trend: 'down',
          icon: Clock, color: '#EF4444',
        },
      ];
    }
    return MOCK_KPI;
  }, [apiDash]);

  // Derive status distribution
  const statusData = useMemo(() => {
    if (apiDash && typeof apiDash === 'object') {
      const d = apiDash as any;
      if (d.statusDistribution && Array.isArray(d.statusDistribution)) {
        const total = d.statusDistribution.reduce((s: number, i: any) => s + (i.count || 0), 0);
        return d.statusDistribution.map((s: any) => ({
          label: STATUS_LABEL_MAP[s.status] || s.status,
          count: s.count || 0,
          pct: total > 0 ? Math.round((s.count / total) * 100) : 0,
          color: STATUS_COLOR_MAP[s.status] || '#818CF8',
        }));
      }
    }
    return MOCK_STATUS;
  }, [apiDash]);

  // Derive recent issues
  const recentIssues = useMemo(() => {
    if (apiDash && typeof apiDash === 'object') {
      const d = apiDash as any;
      if (d.recentIssues && Array.isArray(d.recentIssues) && d.recentIssues.length > 0) {
        return d.recentIssues.slice(0, 5).map((issue: any) => ({
          id: issue.id,
          number: issue.reportNumber || `CF-${issue.id?.substring(0, 8)}`,
          category: issue.category?.name || issue.categoryName || 'כללי',
          location: issue.address || issue.location || '',
          status: STATUS_LABEL_MAP[issue.status] || issue.status,
          urgency: issue.priority || 'NORMAL',
          time: issue.createdAt ? timeAgo(issue.createdAt) : '',
          statusColor: STATUS_COLOR_MAP[issue.status] || '#818CF8',
          urgencyColor: issue.priority === 'URGENT' ? '#F59E0B' : issue.priority === 'CRITICAL' ? '#EF4444' : '#10B981',
        }));
      }
    }
    return MOCK_RECENT;
  }, [apiDash]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin" style={{ color: '#6366F1' }} />
      </div>
    );
  }

  return (
    <>
      {/* Top Bar */}
      <header
        className="px-6 py-4 flex items-center justify-between sticky top-0 z-10"
        style={{
          background: 'rgba(11,15,26,0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
          דשבורד ניהול
        </h1>
        <div className="relative hidden sm:block">
          <input
            className="input pl-3 pr-9 py-2 text-sm"
            placeholder="חיפוש פנייה..."
            style={{ width: 220 }}
          />
          <Search
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--color-text-muted)' }}
          />
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="p-6 space-y-6">
        {/* ─── KPIs ──────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi: any, i: number) => {
            const KpiIcon = kpi.icon;
            return (
              <div
                key={kpi.label}
                className="kpi-card animate-slide-up"
                style={{
                  animationDelay: `${i * 80}ms`,
                  background: `linear-gradient(135deg, ${kpi.color}18, ${kpi.color}08)`,
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${kpi.color}18` }}
                  >
                    <KpiIcon size={20} color={kpi.color} />
                  </div>
                  <div
                    className="flex items-center gap-1 text-xs font-semibold"
                    style={{ color: kpi.trend === 'up' ? '#34D399' : '#F87171' }}
                  >
                    {kpi.trend === 'up' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                    {kpi.change}
                  </div>
                </div>
                <div className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {kpi.value}
                </div>
                <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  {kpi.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* ─── Charts Row ──────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Status Distribution */}
          <div className="glass-card p-5">
            <h3 className="font-bold text-sm mb-4" style={{ color: 'var(--color-text-primary)' }}>
              חלוקה לפי סטטוס
            </h3>
            <div className="space-y-3">
              {statusData.map((item: any) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                      <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                        {item.label}
                      </span>
                    </div>
                    <span className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>
                      {item.count}
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-2)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${item.pct}%`, background: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Trend — recharts */}
          <div className="glass-card p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                מגמה שבועית
              </h3>
              <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: '#818CF8' }} /> חדשות
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: '#34D399' }} /> טופלו
                </span>
              </div>
            </div>
            <DashboardCharts data={apiDash?.weeklyData} />
          </div>
        </div>

        {/* ─── Recent Issues ────────────────────── */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>
              פניות אחרונות
            </h3>
            <Link
              href={`/${tenant}/admin/issues`}
              className="text-xs font-medium"
              style={{ color: '#818CF8' }}
            >
              צפה בהכל ←
            </Link>
          </div>
          <div className="space-y-2">
            {recentIssues.map((issue: any) => (
              <Link
                key={issue.id}
                href={`/${tenant}/admin/issues/${issue.id}`}
                className="block rounded-xl p-3 transition-all hover:bg-[var(--color-surface-2)]"
                style={{ border: '1px solid var(--color-border)' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full" style={{ background: issue.statusColor }} />
                    <div>
                      <div className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        {issue.category}
                      </div>
                      <div className="text-xs flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
                        <span>{issue.number}</span> • <span>{issue.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-left">
                    <span
                      className="badge text-xs"
                      style={{ background: `${issue.statusColor}15`, color: issue.statusColor }}
                    >
                      {issue.status}
                    </span>
                    <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                      {issue.time}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
