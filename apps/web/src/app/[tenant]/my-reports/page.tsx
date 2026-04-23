'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ChevronLeft, ChevronRight, Filter, Search, Plus,
  MapPin, Clock, ArrowUp, ArrowDown, Eye,
  AlertTriangle, Building2
} from 'lucide-react';

const STATUS_FILTERS = [
  { label: 'הכל', value: 'all', color: '#9CA3AF' },
  { label: 'חדש', value: 'NEW', color: '#818CF8' },
  { label: 'בטיפול', value: 'IN_PROGRESS', color: '#FBBF24' },
  { label: 'טופל', value: 'RESOLVED', color: '#34D399' },
  { label: 'נסגר', value: 'CLOSED', color: '#6B7280' },
];

const MY_REPORTS = [
  {
    id: '1',
    number: 'CF-2026-00312',
    category: 'בור בכביש',
    categoryColor: '#EF4444',
    description: 'בור גדול ברחוב הרצל, מזה שבועיים. מסוכן לנהגים ולהולכי רגל.',
    address: 'רחוב הרצל 42',
    status: 'NEW',
    statusLabel: 'חדש',
    statusColor: '#818CF8',
    urgency: 'HIGH',
    urgencyLabel: 'גבוהה',
    urgencyColor: '#F59E0B',
    date: '20/04/2026',
    timeAgo: 'לפני 22 דק\'',
    comments: 1,
    upvotes: 4,
  },
  {
    id: '2',
    number: 'CF-2026-00298',
    category: 'פנס רחוב תקול',
    categoryColor: '#F59E0B',
    description: 'פנס רחוב כבוי השבוע, חשוך מאוד בלילה. סכנה להולכי רגל.',
    address: 'שדרות רוטשילד 18',
    status: 'IN_PROGRESS',
    statusLabel: 'בטיפול',
    statusColor: '#FBBF24',
    urgency: 'NORMAL',
    urgencyLabel: 'רגילה',
    urgencyColor: '#3B82F6',
    date: '18/04/2026',
    timeAgo: 'לפני יומיים',
    comments: 3,
    upvotes: 7,
  },
  {
    id: '3',
    number: 'CF-2026-00284',
    category: 'פסולת / גזם',
    categoryColor: '#10B981',
    description: 'ערימת פסולת ליד הפח ברחוב דיזנגוף. מתפשטת לכביש.',
    address: 'רחוב דיזנגוף 99',
    status: 'RESOLVED',
    statusLabel: 'טופל',
    statusColor: '#34D399',
    urgency: 'NORMAL',
    urgencyLabel: 'רגילה',
    urgencyColor: '#3B82F6',
    date: '15/04/2026',
    timeAgo: 'לפני 5 ימים',
    comments: 2,
    upvotes: 3,
  },
  {
    id: '4',
    number: 'CF-2026-00271',
    category: 'מדרכה שבורה',
    categoryColor: '#8B5CF6',
    description: 'מדרכה שבורה ומסוכנת, סכנה לקשישים ולנכים.',
    address: 'רחוב אלנבי 30',
    status: 'NEW',
    statusLabel: 'חדש',
    statusColor: '#818CF8',
    urgency: 'HIGH',
    urgencyLabel: 'גבוהה',
    urgencyColor: '#F59E0B',
    date: '14/04/2026',
    timeAgo: 'לפני 6 ימים',
    comments: 0,
    upvotes: 12,
  },
  {
    id: '5',
    number: 'CF-2026-00250',
    category: 'ונדליזם',
    categoryColor: '#EC4899',
    description: 'גרפיטי על קיר בניין ציבורי בלילינבלום.',
    address: 'רחוב לילינבלום 20',
    status: 'CLOSED',
    statusLabel: 'נסגר',
    statusColor: '#6B7280',
    urgency: 'LOW',
    urgencyLabel: 'נמוכה',
    urgencyColor: '#6B7280',
    date: '10/04/2026',
    timeAgo: 'לפני 10 ימים',
    comments: 1,
    upvotes: 0,
  },
];

export default function MyReportsPage() {
  const { tenant } = useParams();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = MY_REPORTS.filter((r) => {
    if (activeFilter !== 'all' && r.status !== activeFilter) return false;
    if (searchQuery && !r.description.includes(searchQuery) && !r.number.includes(searchQuery) && !r.address.includes(searchQuery)) return false;
    return true;
  });

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface-0)' }}>
      {/* Header */}
      <header
        className="px-6 py-4 flex items-center justify-between"
        style={{
          background: 'rgba(11,15,26,0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div className="flex items-center gap-3">
          <Link
            href={`/${tenant}`}
            className="p-2 rounded-lg"
            style={{ background: 'var(--color-surface-2)' }}
          >
            <ChevronRight size={18} style={{ color: 'var(--color-text-secondary)' }} />
          </Link>
          <h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
            הפניות שלי
          </h1>
        </div>
        <Link href={`/${tenant}/report`} className="btn-primary text-sm py-2 px-4">
          <Plus size={16} />
          דיווח חדש
        </Link>
      </header>

      {/* Search + Filters */}
      <div className="px-6 py-4 space-y-3">
        <div className="relative">
          <input
            className="input pl-3 pr-10 py-2.5"
            placeholder="חיפוש לפי מספר, תיאור או כתובת..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--color-text-muted)' }}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all"
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
      <div className="px-6 pb-8 space-y-3">
        {filtered.length === 0 ? (
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
          filtered.map((report, i) => (
            <Link
              key={report.id}
              href={`/${tenant}/issues/${report.id}`}
              className="glass-card block p-4 animate-slide-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {/* Top row: number + status */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: report.categoryColor }}
                  />
                  <span className="text-xs font-mono font-semibold" style={{ color: '#818CF8' }}>
                    {report.number}
                  </span>
                </div>
                <span
                  className="badge"
                  style={{ background: `${report.statusColor}15`, color: report.statusColor }}
                >
                  {report.statusLabel}
                </span>
              </div>

              {/* Category */}
              <div className="text-sm font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                {report.category}
              </div>

              {/* Description */}
              <p
                className="text-xs mb-3 line-clamp-2"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {report.description}
              </p>

              {/* Bottom row: meta info */}
              <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                <span className="flex items-center gap-1">
                  <MapPin size={12} />
                  {report.address}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {report.timeAgo}
                </span>
              </div>

              {/* Urgency + engagement */}
              <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded"
                    style={{ background: `${report.urgencyColor}15`, color: report.urgencyColor }}
                  >
                    {report.urgencyLabel}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  <span className="flex items-center gap-1">
                    <ArrowUp size={12} /> {report.upvotes}
                  </span>
                  <span className="flex items-center gap-1">
                    💬 {report.comments}
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
