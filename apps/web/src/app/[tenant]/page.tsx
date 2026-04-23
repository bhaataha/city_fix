'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
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

const RECENT_UPDATES = [
  { id: 1, number: 'CF-2026-00312', category: 'בור בכביש', status: 'בטיפול', color: '#FBBF24', time: 'לפני 2 שעות' },
  { id: 2, number: 'CF-2026-00298', category: 'פנס רחוב תקול', status: 'טופל', color: '#34D399', time: 'לפני 5 שעות' },
  { id: 3, number: 'CF-2026-00284', category: 'פסולת / גזם', status: 'חדש', color: '#818CF8', time: 'אתמול' },
];

export default function CitizenHomePage() {
  const { tenant } = useParams();

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface-0)' }}>
      {/* ─── Header ─────────────────────────────── */}
      <header
        className="px-6 py-4 flex items-center justify-between"
        style={{
          background: 'rgba(11, 15, 26, 0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)' }}
          >
            <Building2 size={20} color="white" />
          </div>
          <div>
            <div className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>
              CityFix
            </div>
            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {String(tenant).replace(/-/g, ' ')}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/${tenant}/notifications`}
            className="relative p-2 rounded-lg"
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
            className="p-2 rounded-lg"
            style={{ background: 'var(--color-surface-2)' }}
          >
            <User size={18} style={{ color: 'var(--color-text-secondary)' }} />
          </Link>
        </div>
      </header>

      {/* ─── Welcome Banner ─────────────────────── */}
      <section className="px-6 pt-8 pb-6">
        <div
          className="rounded-2xl p-6 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(16,185,129,0.08))',
            border: '1px solid rgba(99,102,241,0.15)',
          }}
        >
          <div
            className="absolute top-0 left-0 w-32 h-32 rounded-full blur-3xl opacity-30"
            style={{ background: '#6366F1' }}
          />
          <h1 className="text-2xl font-bold mb-2 relative" style={{ color: 'var(--color-text-primary)' }}>
            שלום, תושב/ת 👋
          </h1>
          <p className="text-sm relative" style={{ color: 'var(--color-text-secondary)' }}>
            ראיתם מפגע? דווחו בשניות ועקבו אחרי הטיפול
          </p>
        </div>
      </section>

      {/* ─── Quick Actions Grid ─────────────────── */}
      <section className="px-6 pb-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {QUICK_ACTIONS.map((action, i) => (
            <Link
              key={action.href}
              href={`/${tenant}/${action.href}`}
              className="glass-card p-4 flex flex-col items-center text-center animate-slide-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                style={{ background: action.gradient }}
              >
                <action.icon size={22} color="white" />
              </div>
              <div className="font-semibold text-sm mb-0.5" style={{ color: 'var(--color-text-primary)' }}>
                {action.label}
              </div>
              <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {action.desc}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Recent Updates ─────────────────────── */}
      <section className="px-6 pb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold" style={{ color: 'var(--color-text-primary)' }}>
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
          {RECENT_UPDATES.map((update) => (
            <div
              key={update.id}
              className="glass-card p-4 flex items-center gap-3"
            >
              <div
                className="w-1 h-10 rounded-full flex-shrink-0"
                style={{ background: update.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {update.category}
                  </span>
                  <span
                    className="badge text-xs"
                    style={{ background: `${update.color}20`, color: update.color }}
                  >
                    {update.status}
                  </span>
                </div>
                <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {update.number} • {update.time}
                </div>
              </div>
              <ChevronLeft size={16} style={{ color: 'var(--color-text-muted)' }} />
            </div>
          ))}
        </div>
      </section>

      {/* ─── Emergency Banner ───────────────────── */}
      <section className="px-6 pb-8">
        <div
          className="rounded-xl p-4 flex items-center gap-3"
          style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.15)',
          }}
        >
          <AlertTriangle size={20} color="#EF4444" />
          <div className="flex-1">
            <div className="text-sm font-semibold" style={{ color: '#FCA5A5' }}>
              סכנה מיידית?
            </div>
            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              למקרים דחופים חייגו למוקד: 106
            </div>
          </div>
          <a
            href="tel:106"
            className="px-3 py-1.5 rounded-lg text-xs font-bold"
            style={{ background: '#EF4444', color: 'white' }}
          >
            חייגו 106
          </a>
        </div>
      </section>

      {/* ─── Info Links Footer ───────────────────── */}
      <section className="px-6 pb-8">
        <h2 className="font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>מידע ושירותים</h2>
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
              className="glass-card px-3 py-3 flex items-center gap-2 text-sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <item.icon size={16} style={{ color: item.color }} />
              {item.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
