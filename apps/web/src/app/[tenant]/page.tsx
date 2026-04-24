'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useIssues } from '@/lib/hooks';
import {
  MapPin, FileText, Map, Bell, Phone,
  HelpCircle, ChevronLeft, AlertTriangle,
  Building2, ClipboardList, User, BarChart3,
  ScrollText, BookOpen, Gavel, PenTool,
} from 'lucide-react';

const QUICK_ACTIONS = [
  {
    icon: AlertTriangle,
    label: 'דווח מפגע',
    desc: 'בור, תאורה, פסולת ועוד',
    href: 'report',
    color: '#EF4444',
    gradient: 'linear-gradient(135deg, #EF4444, #DC2626)',
  },
  {
    icon: FileText,
    label: 'פתח תביעה',
    desc: 'נזק רכב, רכוש, גוף',
    href: 'claim',
    color: '#F59E0B',
    gradient: 'linear-gradient(135deg, #F59E0B, #D97706)',
  },
  {
    icon: ClipboardList,
    label: 'הפניות שלי',
    desc: 'מעקב אחר סטטוס',
    href: 'my-reports',
    color: '#6366F1',
    gradient: 'linear-gradient(135deg, #6366F1, #4F46E5)',
  },
  {
    icon: Map,
    label: 'מפה עירונית',
    desc: 'מפגעים על המפה',
    href: 'map',
    color: '#10B981',
    gradient: 'linear-gradient(135deg, #10B981, #059669)',
  },
  {
    icon: Bell,
    label: 'הודעות ועדכונים',
    desc: 'התראות מהעירייה',
    href: 'notifications',
    color: '#8B5CF6',
    gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
  },
  {
    icon: Phone,
    label: 'מוקד עירוני',
    desc: 'יצירת קשר ישיר',
    href: 'contact',
    color: '#0EA5E9',
    gradient: 'linear-gradient(135deg, #0EA5E9, #0284C7)',
  },
  {
    icon: BarChart3,
    label: 'שקיפות ציבורית',
    desc: 'נתוני ביצועים ושירות',
    href: 'transparency',
    color: '#14B8A6',
    gradient: 'linear-gradient(135deg, #14B8A6, #0D9488)',
  },
];

/* ─── Status color mapping ──────────────────────── */
const STATUS_MAP: Record<string, { label: string; color: string }> = {
  NEW: { label: 'חדש', color: '#818CF8' },
  OPEN: { label: 'פתוח', color: '#818CF8' },
  IN_REVIEW: { label: 'בבדיקה', color: '#F59E0B' },
  ASSIGNED: { label: 'הוקצה', color: '#0EA5E9' },
  IN_PROGRESS: { label: 'בטיפול', color: '#FBBF24' },
  RESOLVED: { label: 'טופל', color: '#34D399' },
  CLOSED: { label: 'נסגר', color: '#6B7280' },
  REJECTED: { label: 'נדחה', color: '#EF4444' },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'עכשיו';
  if (mins < 60) return `לפני ${mins} דק'`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `לפני ${hrs} שעות`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'אתמול';
  return `לפני ${days} ימים`;
}

export default function CitizenHomePage() {
  const { tenant } = useParams();
  const { data: issuesData, loading: issuesLoading } = useIssues({ limit: '5', sort: 'createdAt', order: 'desc' });

  const recentIssues = useMemo(() => {
    if (!issuesData) return [];
    const list = Array.isArray(issuesData) ? issuesData : (issuesData as any)?.data || (issuesData as any)?.items || [];
    return list.slice(0, 5).map((issue: any) => {
      const st = STATUS_MAP[issue.status] || { label: issue.status || '—', color: '#818CF8' };
      return {
        id: issue.id,
        number: issue.referenceNumber || `#${String(issue.id).slice(0, 8)}`,
        category: issue.category?.name || issue.categoryName || '—',
        status: st.label,
        color: st.color,
        time: issue.createdAt ? timeAgo(issue.createdAt) : '',
      };
    });
  }, [issuesData]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface-0)', overflowX: 'hidden' }}>
      {/* ─── Header ─────────────────────────────── */}
      <header
        className="px-4 sm:px-6 py-3 flex items-center justify-between"
        style={{
          background: 'rgba(11, 15, 26, 0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)' }}
          >
            <Building2 size={18} color="white" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-sm leading-tight" style={{ color: 'var(--color-text-primary)' }}>
              CityFix
            </div>
            <div className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
              {String(tenant).replace(/-/g, ' ')}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/${tenant}/notifications`}
            className="relative p-2 rounded-lg flex-shrink-0"
            style={{ background: 'var(--color-surface-2)' }}
          >
            <Bell size={18} style={{ color: 'var(--color-text-secondary)' }} />
            <div
              className="absolute top-1 right-1 w-2 h-2 rounded-full"
              style={{ background: '#EF4444' }}
            />
          </Link>
          <Link
            href={`/${tenant}/auth/login`}
            className="p-2 rounded-lg flex-shrink-0"
            style={{ background: 'var(--color-surface-2)' }}
          >
            <User size={18} style={{ color: 'var(--color-text-secondary)' }} />
          </Link>
        </div>
      </header>

      {/* ─── Welcome Banner ─────────────────────── */}
      <section className="px-4 sm:px-6 pt-5 pb-4">
        <div
          className="rounded-2xl p-5 sm:p-6 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(16,185,129,0.08))',
            border: '1px solid rgba(99,102,241,0.15)',
          }}
        >
          <div
            className="absolute top-0 left-0 w-32 h-32 rounded-full blur-3xl opacity-30"
            style={{ background: '#6366F1' }}
          />
          <h1 className="text-xl sm:text-2xl font-bold mb-1.5 relative" style={{ color: 'var(--color-text-primary)' }}>
            שלום, תושב/ת 👋
          </h1>
          <p className="text-sm relative" style={{ color: 'var(--color-text-secondary)' }}>
            ראיתם מפגע? דווחו בשניות ועקבו אחרי הטיפול
          </p>
        </div>
      </section>

      {/* ─── Quick Actions Grid ─────────────────── */}
      <section className="px-4 sm:px-6 pb-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
          {QUICK_ACTIONS.map((action, i) => (
            <Link
              key={action.href}
              href={`/${tenant}/${action.href}`}
              className="glass-card p-3 sm:p-4 flex flex-col items-center text-center animate-slide-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-2 sm:mb-3"
                style={{ background: action.gradient }}
              >
                <action.icon size={20} color="white" />
              </div>
              <div className="font-semibold text-[13px] sm:text-sm mb-0.5 leading-tight" style={{ color: 'var(--color-text-primary)' }}>
                {action.label}
              </div>
              <div className="text-[11px] sm:text-xs leading-snug" style={{ color: 'var(--color-text-muted)' }}>
                {action.desc}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Recent Updates ─────────────────────── */}
      <section className="px-4 sm:px-6 pb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-sm sm:text-base" style={{ color: 'var(--color-text-primary)' }}>
            עדכונים אחרונים
          </h2>
          <Link
            href={`/${tenant}/my-reports`}
            className="text-xs font-medium flex items-center gap-1"
            style={{ color: '#818CF8' }}
          >
            הכל
            <ChevronLeft size={14} />
          </Link>
        </div>

        <div className="space-y-2">
          {recentIssues.length > 0 ? recentIssues.map((update: any) => (
            <Link
              key={update.id}
              href={`/${tenant}/issues/${update.id}`}
              className="glass-card p-3 sm:p-4 flex items-center gap-3"
              style={{ textDecoration: 'none' }}
            >
              <div
                className="w-1 h-10 rounded-full flex-shrink-0"
                style={{ background: update.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                    {update.category}
                  </span>
                  <span
                    className="badge text-[11px]"
                    style={{ background: `${update.color}20`, color: update.color }}
                  >
                    {update.status}
                  </span>
                </div>
                <div className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                  {update.number} • {update.time}
                </div>
              </div>
              <ChevronLeft size={16} className="flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
            </Link>
          )) : (
            <div className="glass-card p-4 text-center">
              <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {issuesLoading ? 'טוען עדכונים...' : 'אין דיווחים אחרונים'}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─── Emergency Banner ───────────────────── */}
      <section className="px-4 sm:px-6 pb-5">
        <div
          className="rounded-xl p-3 sm:p-4 flex items-center gap-3"
          style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.15)',
          }}
        >
          <AlertTriangle size={20} color="#EF4444" className="flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold" style={{ color: '#FCA5A5' }}>
              סכנה מיידית?
            </div>
            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              למקרים דחופים חייגו למוקד: 106
            </div>
          </div>
          <a
            href="tel:106"
            className="px-3 py-1.5 rounded-lg text-xs font-bold flex-shrink-0"
            style={{ background: '#EF4444', color: 'white' }}
          >
            חייגו 106
          </a>
        </div>
      </section>

      {/* ─── Info Links Footer ───────────────────── */}
      <section className="px-4 sm:px-6 pb-8">
        <h2 className="font-bold text-sm sm:text-base mb-3" style={{ color: 'var(--color-text-primary)' }}>מידע ושירותים</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { icon: HelpCircle, label: 'שאלות נפוצות', href: 'faq', color: '#818CF8' },
            { icon: BookOpen, label: 'הוראות שימוש', href: 'guide', color: '#10B981' },
            { icon: ScrollText, label: 'תקנון', href: 'terms', color: '#F59E0B' },
            { icon: Gavel, label: 'עורכי דין', href: 'lawyers', color: '#6366F1' },
            { icon: PenTool, label: 'חתימה דיגיטלית', href: 'signature', color: '#EC4899' },
            { icon: Phone, label: 'יצירת קשר', href: 'contact', color: '#0EA5E9' },
          ].map((item) => (
            <Link
              key={item.href}
              href={`/${tenant}/${item.href}`}
              className="glass-card px-3 py-2.5 flex items-center gap-2 text-[13px] sm:text-sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <item.icon size={15} className="flex-shrink-0" style={{ color: item.color }} />
              <span className="truncate">{item.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
