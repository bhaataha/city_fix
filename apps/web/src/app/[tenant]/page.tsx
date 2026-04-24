'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useIssues } from '@/lib/hooks';
import { type TranslationKey } from '@/lib/i18n';
import { useI18n } from '@/lib/useI18n';
import {
  MapPin, FileText, Map, Bell, Phone,
  HelpCircle, ChevronLeft, AlertTriangle,
  Building2, ClipboardList, User, BarChart3,
  ScrollText, BookOpen, Gavel, PenTool,
} from 'lucide-react';

function buildQuickActions(t: (key: TranslationKey) => string) {
  return [
  {
    icon: AlertTriangle,
    label: t('home.report.label'),
    desc: t('home.report.desc'),
    href: 'report',
    color: '#EF4444',
    gradient: 'linear-gradient(135deg, #EF4444, #DC2626)',
  },
  {
    icon: FileText,
    label: t('home.claim.label'),
    desc: t('home.claim.desc'),
    href: 'claim',
    color: '#F59E0B',
    gradient: 'linear-gradient(135deg, #F59E0B, #D97706)',
  },
  {
    icon: ClipboardList,
    label: t('home.myReports.label'),
    desc: t('home.myReports.desc'),
    href: 'my-reports',
    color: '#6366F1',
    gradient: 'linear-gradient(135deg, #6366F1, #4F46E5)',
  },
  {
    icon: ScrollText,
    label: t('home.myClaims.label'),
    desc: t('home.myClaims.desc'),
    href: 'my-claims',
    color: '#EAB308',
    gradient: 'linear-gradient(135deg, #EAB308, #CA8A04)',
  },
  {
    icon: Map,
    label: t('home.map.label'),
    desc: t('home.map.desc'),
    href: 'map',
    color: '#10B981',
    gradient: 'linear-gradient(135deg, #10B981, #059669)',
  },
  {
    icon: Bell,
    label: t('home.notifications.label'),
    desc: t('home.notifications.desc'),
    href: 'notifications',
    color: '#8B5CF6',
    gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
  },
  {
    icon: Phone,
    label: t('home.contact.label'),
    desc: t('home.contact.desc'),
    href: 'contact',
    color: '#0EA5E9',
    gradient: 'linear-gradient(135deg, #0EA5E9, #0284C7)',
  },
  {
    icon: BarChart3,
    label: t('home.transparency.label'),
    desc: t('home.transparency.desc'),
    href: 'transparency',
    color: '#14B8A6',
    gradient: 'linear-gradient(135deg, #14B8A6, #0D9488)',
  },
  ];
}

/* ─── Status color mapping ──────────────────────── */
const STATUS_COLORS: Record<string, string> = {
  NEW: '#818CF8',
  OPEN: '#818CF8',
  IN_REVIEW: '#F59E0B',
  ASSIGNED: '#0EA5E9',
  IN_PROGRESS: '#FBBF24',
  RESOLVED: '#34D399',
  CLOSED: '#6B7280',
  REJECTED: '#EF4444',
};

function timeAgo(dateStr: string, t: (key: TranslationKey, values?: Record<string, string | number>) => string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t('common.now');
  if (mins < 60) return t('common.minutesAgo', { count: mins });
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return t('common.hoursAgo', { count: hrs });
  const days = Math.floor(hrs / 24);
  if (days === 1) return t('common.yesterday');
  return t('common.daysAgo', { count: days });
}

export default function CitizenHomePage() {
  const { tenant } = useParams();
  const { t, dir } = useI18n();
  const { data: issuesData, loading: issuesLoading } = useIssues({ limit: '5', sort: 'createdAt', order: 'desc' });
  const quickActions = useMemo(() => buildQuickActions(t), [t]);

  const recentIssues = useMemo(() => {
    if (!issuesData) return [];
    const list = Array.isArray(issuesData) ? issuesData : (issuesData as any)?.data || (issuesData as any)?.items || [];
    return list.slice(0, 5).map((issue: any) => {
      const statusKey = `status.${issue.status}` as TranslationKey;
      return {
        id: issue.id,
        number: issue.referenceNumber || `#${String(issue.id).slice(0, 8)}`,
        category: issue.category?.name || issue.categoryName || '—',
        status: issue.status && STATUS_COLORS[issue.status] ? t(statusKey) : issue.status || '—',
        color: STATUS_COLORS[issue.status] || '#818CF8',
        time: issue.createdAt ? timeAgo(issue.createdAt, t) : '',
      };
    });
  }, [issuesData, t]);

  return (
    <div className="min-h-screen" dir={dir} style={{ background: 'var(--color-surface-0)', overflowX: 'hidden' }}>
      {/* ─── Header ─────────────────────────────── */}
      <header
        className="px-5 sm:px-6 py-4 flex items-center justify-between"
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
          <LanguageSwitcher compact />
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
      <section className="px-5 sm:px-6 pt-6 pb-5">
        <div
          className="rounded-3xl p-8 sm:p-10 relative overflow-hidden shadow-xl"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(16,185,129,0.1))',
            border: '1px solid rgba(99,102,241,0.2)',
          }}
        >
          <div
            className="absolute top-0 left-0 w-32 h-32 rounded-full blur-3xl opacity-30"
            style={{ background: '#6366F1' }}
          />
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 relative" style={{ color: 'var(--color-text-primary)' }}>
            {t('home.greeting')}
          </h1>
          <p className="text-sm sm:text-base relative" style={{ color: 'var(--color-text-secondary)' }}>
            {t('home.welcomeBody')}
          </p>
        </div>
      </section>

      {/* ─── Quick Actions Grid ─────────────────── */}
      <section className="px-5 sm:px-6 pb-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
          {quickActions.map((action, i) => (
            <Link
              key={action.href}
              href={`/${tenant}/${action.href}`}
              className="glass-card p-5 sm:p-6 flex flex-col items-center text-center animate-slide-up hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-4 shadow-md"
                style={{ background: action.gradient }}
              >
                <action.icon size={26} color="white" />
              </div>
              <div className="font-bold text-[15px] sm:text-base mb-1.5 leading-tight" style={{ color: 'var(--color-text-primary)' }}>
                {action.label}
              </div>
              <div className="text-[13px] sm:text-sm leading-snug" style={{ color: 'var(--color-text-muted)' }}>
                {action.desc}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Recent Updates ─────────────────────── */}
      <section className="px-5 sm:px-6 pb-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-lg sm:text-xl" style={{ color: 'var(--color-text-primary)' }}>
            {t('home.recentUpdates')}
          </h2>
          <Link
            href={`/${tenant}/my-reports`}
            className="text-sm font-semibold flex items-center gap-1 hover:opacity-80 transition-opacity"
            style={{ color: '#818CF8' }}
          >
            {t('common.viewAll')}
            <ChevronLeft size={16} />
          </Link>
        </div>

        <div className="space-y-4">
          {recentIssues.length > 0 ? recentIssues.map((update: any) => (
            <Link
              key={update.id}
              href={`/${tenant}/issues/${update.id}`}
              className="glass-card p-5 sm:p-6 flex items-center gap-4 hover:-translate-y-0.5 transition-transform"
              style={{ textDecoration: 'none' }}
            >
              <div
                className="w-1.5 h-14 rounded-full flex-shrink-0"
                style={{ background: update.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-base font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                    {update.category}
                  </span>
                  <span
                    className="badge text-xs"
                    style={{ background: `${update.color}20`, color: update.color }}
                  >
                    {update.status}
                  </span>
                </div>
                <div className="text-sm truncate" style={{ color: 'var(--color-text-muted)' }}>
                  {update.number} • {update.time}
                </div>
              </div>
              <ChevronLeft size={20} className="flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
            </Link>
          )) : (
            <div className="glass-card p-5 text-center">
              <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {issuesLoading ? t('common.loadingUpdates') : t('common.noRecentReports')}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─── Emergency Banner ───────────────────── */}
      <section className="px-5 sm:px-6 pb-6">
        <div
          className="rounded-xl p-4 sm:p-5 flex items-center gap-4"
          style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.15)',
          }}
        >
          <AlertTriangle size={24} color="#EF4444" className="flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-base font-bold" style={{ color: '#FCA5A5' }}>
              {t('home.emergencyTitle')}
            </div>
            <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {t('home.emergencyBody')}
            </div>
          </div>
          <a
            href="tel:106"
            className="px-4 py-2 rounded-lg text-sm font-bold flex-shrink-0 shadow-lg"
            style={{ background: '#EF4444', color: 'white' }}
          >
            {t('home.call106')}
          </a>
        </div>
      </section>

      {/* ─── Info Links Footer ───────────────────── */}
      <section className="px-5 sm:px-6 pb-8">
        <h2 className="font-bold text-base sm:text-lg mb-4" style={{ color: 'var(--color-text-primary)' }}>{t('home.infoServices')}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: HelpCircle, label: t('home.faq'), href: 'faq', color: '#818CF8' },
            { icon: BookOpen, label: t('home.guide'), href: 'guide', color: '#10B981' },
            { icon: ScrollText, label: t('home.terms'), href: 'terms', color: '#F59E0B' },
            { icon: Gavel, label: t('home.lawyers'), href: 'lawyers', color: '#6366F1' },
            { icon: PenTool, label: t('home.signature'), href: 'signature', color: '#EC4899' },
            { icon: Phone, label: t('home.contact.label'), href: 'contact', color: '#0EA5E9' },
          ].map((item) => (
            <Link
              key={item.href}
              href={`/${tenant}/${item.href}`}
              className="glass-card px-4 py-3 flex items-center gap-3 text-sm sm:text-base"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <item.icon size={18} className="flex-shrink-0" style={{ color: item.color }} />
              <span className="truncate">{item.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
