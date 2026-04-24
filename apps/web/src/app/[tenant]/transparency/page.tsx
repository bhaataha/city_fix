'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ChevronRight, BarChart3, TrendingUp, CheckCircle2,
  Clock, Building2,
  PieChart, Target, Award,
  MapPin, ThumbsUp, Star, Loader2
} from 'lucide-react';
import { useTransparencyStats } from '@/lib/hooks';

/* ─── No mock data — real API only ──────────────── */

const MONTHS = ['ינו', 'פבר', 'מרץ', 'אפר', 'מאי', 'יוני', 'יולי', 'אוג', 'ספט', 'אוק', 'נוב', 'דצמ'];

const DEPT_COLORS = ['#EF4444', '#F59E0B', '#10B981', '#22C55E', '#F97316', '#6366F1', '#EC4899', '#14B8A6'];
const CAT_COLORS  = ['#EF4444', '#F59E0B', '#10B981', '#DC2626', '#8B5CF6', '#F97316', '#22C55E', '#6366F1'];

export default function TransparencyPage() {
  const { tenant } = useParams();
  const { data: apiStats, loading } = useTransparencyStats();

  // Derive stats from API
  const stats = useMemo(() => {
    if (apiStats && typeof apiStats === 'object') {
      const s = apiStats as any;
      return {
        totalReports: s.totalReports ?? 0,
        resolvedReports: s.resolvedReports ?? 0,
        avgResolutionDays: s.avgResolutionDays ?? 0,
        citizenSatisfaction: s.citizenSatisfaction ?? 0,
        monthlyNew: s.monthlyNew ?? [],
        monthlyResolved: s.monthlyResolved ?? [],
      };
    }
    return {
      totalReports: 0, resolvedReports: 0,
      avgResolutionDays: 0, citizenSatisfaction: 0,
      monthlyNew: [] as number[], monthlyResolved: [] as number[],
    };
  }, [apiStats]);

  const deptStats = useMemo(() => {
    if (apiStats && typeof apiStats === 'object') {
      const s = apiStats as any;
      if (s.departmentStats && Array.isArray(s.departmentStats)) {
        return s.departmentStats.map((d: any, i: number) => ({
          name: d.name || d.departmentName || '',
          resolved: d.resolved || d.resolvedCount || 0,
          total: d.total || d.totalCount || 0,
          color: d.color || DEPT_COLORS[i % DEPT_COLORS.length],
          avgDays: d.avgDays || d.avgResolutionDays || 0,
        }));
      }
    }
    return [];
  }, [apiStats]);

  const categoryStats = useMemo(() => {
    if (apiStats && typeof apiStats === 'object') {
      const s = apiStats as any;
      if (s.categoryStats && Array.isArray(s.categoryStats)) {
        return s.categoryStats.map((c: any, i: number) => ({
          name: c.name || c.categoryName || '',
          count: c.count || c.total || 0,
          resolved: c.resolved || c.resolvedCount || 0,
          color: c.color || CAT_COLORS[i % CAT_COLORS.length],
        }));
      }
    }
    return [];
  }, [apiStats]);

  const recentResolved = useMemo(() => {
    if (apiStats && typeof apiStats === 'object') {
      const s = apiStats as any;
      if (s.recentResolved && Array.isArray(s.recentResolved)) {
        return s.recentResolved.map((r: any) => ({
          id: r.id,
          category: r.category?.name || r.categoryName || '',
          address: r.address || '',
          resolvedAt: r.resolvedAt ? new Date(r.resolvedAt).toLocaleDateString('he-IL') : '',
          days: r.resolutionDays ?? r.days ?? 0,
        }));
      }
    }
    return [];
  }, [apiStats]);

  const resolveRate = stats.totalReports > 0
    ? Math.round((stats.resolvedReports / stats.totalReports) * 100)
    : 0;
  const maxMonthly = Math.max(...stats.monthlyNew, ...stats.monthlyResolved, 1);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin" style={{ color: '#6366F1' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface-0)' }}>
      {/* ─── Header ─────────────────────────────── */}
      <header
        className="px-6 py-4 flex items-center gap-3 sticky top-0 z-20"
        style={{
          background: 'rgba(11,15,26,0.92)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <Link
          href={`/${tenant}`}
          className="p-2 rounded-lg"
          style={{ background: 'var(--color-surface-2)' }}
        >
          <ChevronRight size={18} style={{ color: 'var(--color-text-secondary)' }} />
        </Link>
        <div>
          <h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
            שקיפות ציבורית
          </h1>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            נתוני ביצועים ושירות לתושבים
          </p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* ─── Hero Banner ───────────────────── */}
        <div
          className="rounded-2xl p-8 relative overflow-hidden text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(52,211,153,0.08))',
            border: '1px solid rgba(99,102,241,0.15)',
          }}
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{
              background: 'radial-gradient(circle at 20% 50%, #818CF8 0%, transparent 50%), radial-gradient(circle at 80% 50%, #34D399 0%, transparent 50%)',
            }}
          />
          <div className="relative z-10">
            <Award className="mx-auto mb-3" size={40} color="#818CF8" />
            <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              {resolveRate}% מענה
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {stats.resolvedReports.toLocaleString()} פניות טופלו מתוך {stats.totalReports.toLocaleString()}
            </p>
          </div>
        </div>

        {/* ─── KPI Cards ─────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-5 text-center">
            <div className="w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.12)' }}>
              <BarChart3 size={22} color="#818CF8" />
            </div>
            <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {stats.totalReports.toLocaleString()}
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>סה״כ דיווחים</p>
          </div>
          <div className="glass-card p-5 text-center">
            <div className="w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center" style={{ background: 'rgba(52,211,153,0.12)' }}>
              <CheckCircle2 size={22} color="#34D399" />
            </div>
            <p className="text-2xl font-bold" style={{ color: '#34D399' }}>
              {stats.resolvedReports.toLocaleString()}
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>טופלו</p>
          </div>
          <div className="glass-card p-5 text-center">
            <div className="w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center" style={{ background: 'rgba(251,191,36,0.12)' }}>
              <Clock size={22} color="#FBBF24" />
            </div>
            <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {stats.avgResolutionDays}
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>ימים ממוצע לטיפול</p>
          </div>
          <div className="glass-card p-5 text-center">
            <div className="w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center" style={{ background: 'rgba(168,85,247,0.12)' }}>
              <ThumbsUp size={22} color="#A855F7" />
            </div>
            <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {stats.citizenSatisfaction}%
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>שביעות רצון</p>
          </div>
        </div>

        {/* ─── Monthly Chart ─────────────────── */}
        {stats.monthlyNew.length > 0 && (
          <div className="glass-card p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
              <TrendingUp size={16} color="#818CF8" /> מגמה חודשית
            </h3>
            <div className="flex items-center gap-4 mb-4 text-xs" style={{ color: 'var(--color-text-muted)' }}>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded" style={{ background: '#818CF8' }} /> דיווחים חדשים
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded" style={{ background: '#34D399' }} /> טופלו
              </span>
            </div>
            <div className="flex items-end gap-1.5 h-40">
              {stats.monthlyNew.map((val: number, i: number) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex gap-0.5" style={{ height: '100%' }}>
                    <div
                      className="flex-1 rounded-t-sm transition-all"
                      style={{
                        height: `${(val / maxMonthly) * 100}%`,
                        background: 'linear-gradient(180deg, #818CF8, #6366F1)',
                        marginTop: 'auto',
                        opacity: 0.8,
                      }}
                    />
                    <div
                      className="flex-1 rounded-t-sm transition-all"
                      style={{
                        height: `${((stats.monthlyResolved[i] || 0) / maxMonthly) * 100}%`,
                        background: 'linear-gradient(180deg, #34D399, #10B981)',
                        marginTop: 'auto',
                        opacity: 0.8,
                      }}
                    />
                  </div>
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{MONTHS[i]}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── Department Performance ────────── */}
        {deptStats.length > 0 && (
          <div className="glass-card p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
              <Building2 size={16} color="#818CF8" /> ביצועים לפי מחלקה
            </h3>
            <div className="space-y-3">
              {deptStats.map((dept: any) => {
                const rate = dept.total > 0 ? Math.round((dept.resolved / dept.total) * 100) : 0;
                return (
                  <div key={dept.name} className="rounded-xl p-4" style={{ background: 'var(--color-surface-1)', border: '1px solid var(--color-border)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{dept.name}</span>
                      <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        <span>ממוצע: {dept.avgDays} ימים</span>
                        <span className="font-bold" style={{ color: rate > 90 ? '#34D399' : '#F59E0B' }}>{rate}%</span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-3)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${rate}%`,
                          background: `linear-gradient(90deg, ${dept.color}, ${dept.color}80)`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                      <span>{dept.resolved} טופלו</span>
                      <span>{dept.total} סה״כ</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── Category Distribution ─────────── */}
        {categoryStats.length > 0 && (
          <div className="glass-card p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
              <PieChart size={16} color="#818CF8" /> התפלגות לפי סוג מפגע
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {categoryStats.map((cat: any) => {
                const rate = cat.count > 0 ? Math.round((cat.resolved / cat.count) * 100) : 0;
                return (
                  <div
                    key={cat.name}
                    className="rounded-xl p-3 text-center"
                    style={{
                      background: `${cat.color}06`,
                      border: `1px solid ${cat.color}15`,
                    }}
                  >
                    <p className="text-lg font-bold" style={{ color: cat.color }}>{cat.count}</p>
                    <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>{cat.name}</p>
                    <span
                      className="badge text-xs"
                      style={{ background: `${rate > 90 ? '#34D399' : '#F59E0B'}15`, color: rate > 90 ? '#34D399' : '#F59E0B' }}
                    >
                      {rate}% מענה
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── Recent Resolved ───────────────── */}
        {recentResolved.length > 0 && (
          <div className="glass-card p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
              <CheckCircle2 size={16} color="#34D399" /> טופלו לאחרונה
            </h3>
            <div className="space-y-2">
              {recentResolved.map((item: any) => (
                <div
                  key={item.id}
                  className="rounded-xl p-3 flex items-center gap-3"
                  style={{ background: 'var(--color-surface-1)', border: '1px solid var(--color-border)' }}
                >
                  <CheckCircle2 size={16} color="#34D399" />
                  <div className="flex-1">
                    <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      {item.category}
                    </span>
                    <span className="text-xs mr-2" style={{ color: 'var(--color-text-muted)' }}>
                      — {item.address}
                    </span>
                  </div>
                  <div className="text-left">
                    <span className="text-xs block" style={{ color: 'var(--color-text-muted)' }}>{item.resolvedAt}</span>
                    <span className="text-xs" style={{ color: '#34D399' }}>טופל ב-{item.days} ימים</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── CTA ───────────────────────────── */}
        <div
          className="rounded-2xl p-8 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(99,102,241,0.04))',
            border: '1px solid rgba(99,102,241,0.15)',
          }}
        >
          <Star className="mx-auto mb-3" size={28} color="#818CF8" />
          <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            גם אתם יכולים לעזור
          </h3>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
            ראיתם מפגע? דווחו ועזרו לנו לשפר את העיר
          </p>
          <Link
            href={`/${tenant}/report`}
            className="btn-primary py-3 px-8 text-sm font-bold inline-flex items-center gap-2"
          >
            <MapPin size={16} /> דווחו עכשיו
          </Link>
        </div>
      </div>
    </div>
  );
}
