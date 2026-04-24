'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  MapPin, ArrowRight, Filter, X,
  AlertTriangle, Loader2
} from 'lucide-react';
import { DEFAULT_CATEGORIES } from '@cityfix/shared';
import { useMapIssues } from '@/lib/hooks';
import type { MapIssue } from '@/components/MapView';

// Dynamic import to avoid SSR issues with mapbox-gl
const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center" style={{ background: 'var(--color-surface-1)' }}>
      <Loader2 size={28} className="animate-spin" style={{ color: '#6366F1' }} />
    </div>
  ),
});

const STATUS_COLOR: Record<string, string> = {
  NEW: '#818CF8', ASSIGNED: '#60A5FA', IN_PROGRESS: '#FBBF24',
  RESOLVED: '#34D399', CLOSED: '#6B7280',
};
const STATUS_LABEL: Record<string, string> = {
  NEW: 'חדש', ASSIGNED: 'שויך', IN_PROGRESS: 'בטיפול',
  RESOLVED: 'טופל', CLOSED: 'נסגר',
};

export default function MapPage() {
  const { tenant } = useParams();
  const { data: apiIssues, loading } = useMapIssues();
  const [showFilters, setShowFilters] = useState(false);
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<MapIssue | null>(null);

  // Normalize API → MapIssue (no mock fallback)
  const issues: MapIssue[] = useMemo(() => {
    if (apiIssues && Array.isArray(apiIssues)) {
      return apiIssues
        .filter((i: any) => i.latitude && i.longitude)
        .map((i: any) => ({
          id: i.id,
          lat: i.latitude,
          lng: i.longitude,
          category: i.category?.name || 'כללי',
          status: STATUS_LABEL[i.status] || i.status,
          color: STATUS_COLOR[i.status] || '#818CF8',
          urgency: i.priority || 'NORMAL',
          address: i.address || '',
          reportNumber: i.reportNumber || '',
        }));
    }
    return [];
  }, [apiIssues]);

  // Filter by category
  const filtered = activeCat
    ? issues.filter((i) => i.category === activeCat)
    : issues;

  return (
    <div className="h-screen flex flex-col" style={{ background: 'var(--color-surface-0)' }}>
      {/* ─── Header ─────────────────────────────── */}
      <header
        className="px-4 py-3 flex items-center gap-3 flex-shrink-0"
        style={{
          background: 'rgba(11, 15, 26, 0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <Link href={`/${tenant}`} className="p-2 rounded-lg" style={{ background: 'var(--color-surface-2)' }}>
          <ArrowRight size={16} style={{ color: 'var(--color-text-secondary)' }} />
        </Link>
        <h1 className="font-bold flex-1" style={{ color: 'var(--color-text-primary)' }}>
          מפה עירונית
        </h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="p-2 rounded-lg relative"
          style={{ background: showFilters ? 'rgba(99,102,241,0.12)' : 'var(--color-surface-2)' }}
        >
          <Filter size={16} style={{ color: showFilters ? '#818CF8' : 'var(--color-text-secondary)' }} />
        </button>
      </header>

      {/* ─── Filter Bar ─────────────────────────── */}
      {showFilters && (
        <div
          className="px-4 py-3 flex gap-2 overflow-x-auto flex-shrink-0 animate-slide-up"
          style={{
            background: 'var(--color-surface-1)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <button
            onClick={() => setActiveCat(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap"
            style={{
              background: !activeCat ? 'rgba(99,102,241,0.15)' : 'var(--color-surface-2)',
              color: !activeCat ? '#818CF8' : 'var(--color-text-muted)',
              border: `1px solid ${!activeCat ? 'rgba(99,102,241,0.3)' : 'transparent'}`,
            }}
          >
            הכל
          </button>
          {DEFAULT_CATEGORIES.slice(0, 6).map((cat) => (
            <button
              key={cat.name}
              onClick={() => setActiveCat(activeCat === cat.name ? null : cat.name)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap"
              style={{
                background: activeCat === cat.name ? `${cat.color}20` : `${cat.color}08`,
                color: cat.color,
                border: `1px solid ${activeCat === cat.name ? `${cat.color}40` : `${cat.color}20`}`,
              }}
            >
              <div className="w-2 h-2 rounded-full" style={{ background: cat.color }} />
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* ─── Map ────────────────────────────────── */}
      <div className="flex-1 relative">
        <MapView
          issues={filtered}
          onIssueClick={(issue) => setSelectedIssue(issue)}
        />

        {/* Floating issue count */}
        <div
          className="absolute top-4 right-4 px-3 py-1.5 rounded-lg text-xs font-medium z-10"
          style={{
            background: 'rgba(11,15,26,0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-secondary)',
          }}
        >
          <span style={{ color: '#818CF8' }}>{filtered.length}</span> מפגעים פעילים
        </div>

        {/* Report FAB */}
        <Link
          href={`/${tenant}/report`}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 btn-primary px-6 py-3 shadow-2xl z-10"
          style={{ boxShadow: '0 8px 30px rgba(99,102,241,0.4)' }}
        >
          <AlertTriangle size={18} />
          דווח מפגע חדש
        </Link>

        {/* Bottom sheet for selected issue */}
        {selectedIssue && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-80 animate-slide-up z-20">
            <div
              className="rounded-xl p-4"
              style={{
                background: 'rgba(17,24,39,0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid var(--color-border)',
                boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
              }}
            >
              <button
                onClick={() => setSelectedIssue(null)}
                className="absolute top-3 left-3 p-1 rounded"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <X size={14} />
              </button>
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0" style={{ background: selectedIssue.color }} />
                <div>
                  <div className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    {selectedIssue.category}
                  </div>
                  {selectedIssue.address && (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                      {selectedIssue.address}
                    </p>
                  )}
                  <div className="text-xs mt-1 font-semibold" style={{ color: selectedIssue.color }}>
                    {selectedIssue.status}
                  </div>
                  <Link
                    href={`/${tenant}/issues/${selectedIssue.id}`}
                    className="text-xs mt-2 inline-block font-medium"
                    style={{ color: '#818CF8' }}
                  >
                    צפה בפרטים ←
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
