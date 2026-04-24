'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ChevronRight, Scale, Search, Filter, Calendar,
  DollarSign, Clock, AlertTriangle, CheckCircle2,
  FileText, User, Building2, Eye, MoreVertical,
  TrendingUp, XCircle, Loader2, ChevronDown,
  LayoutGrid, List
} from 'lucide-react';
import { useClaims } from '@/lib/hooks';

/* ─── Stage definitions ──────────────────────────── */
const CLAIM_STAGES = [
  { key: 'SUBMITTED', label: 'הוגשה', color: '#818CF8', icon: FileText },
  { key: 'UNDER_REVIEW', label: 'בבדיקה', color: '#60A5FA', icon: Eye },
  { key: 'INVESTIGATION', label: 'חקירה', color: '#FBBF24', icon: Search },
  { key: 'LEGAL_REVIEW', label: 'בדיקה משפטית', color: '#F97316', icon: Scale },
  { key: 'APPROVED', label: 'אושרה', color: '#34D399', icon: CheckCircle2 },
  { key: 'REJECTED', label: 'נדחתה', color: '#EF4444', icon: XCircle },
  { key: 'PAID', label: 'שולמה', color: '#10B981', icon: DollarSign },
];

/* ─── No mock data — real API only ──────────────── */

export default function AdminClaimsPage() {
  const { tenant } = useParams();
  const { data: apiClaims, loading } = useClaims();
  const [view, setView] = useState<'kanban' | 'table'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');

  // Normalize API data
  const claims = useMemo(() => {
    if (apiClaims && Array.isArray(apiClaims) && apiClaims.length > 0) {
      return apiClaims.map((c: any) => ({
        id: c.id,
        claimNumber: c.claimNumber || c.number || '',
        status: c.status || 'SUBMITTED',
        title: c.title || c.description?.substring(0, 50) || '',
        claimant: c.claimant || c.user || { firstName: '', lastName: '' },
        amount: c.amount || c.claimedAmount || 0,
        issueReport: c.issueReport || null,
        createdAt: c.createdAt ? new Date(c.createdAt).toISOString().split('T')[0] : '',
        description: c.description || '',
      }));
    }
    return [];
  }, [apiClaims]);

  const filtered = claims.filter((c: any) => {
    const claimantName = `${c.claimant?.firstName || ''} ${c.claimant?.lastName || ''}`;
    return c.title.includes(searchQuery) || c.claimNumber.includes(searchQuery) || claimantName.includes(searchQuery);
  });

  const totalAmount = claims.reduce((s: number, c: any) => s + (c.amount || 0), 0);
  const pendingCount = claims.filter((c: any) => ['SUBMITTED', 'UNDER_REVIEW', 'INVESTIGATION'].includes(c.status)).length;
  const resolvedCount = claims.filter((c: any) => ['APPROVED', 'PAID'].includes(c.status)).length;

  const KPIs = [
    { label: 'סך תביעות', value: claims.length, icon: Scale, color: '#818CF8' },
    { label: 'סך סכום (₪)', value: totalAmount.toLocaleString(), icon: DollarSign, color: '#34D399' },
    { label: 'ממתינות', value: pendingCount, icon: Clock, color: '#FBBF24' },
    { label: 'אושרו / שולמו', value: resolvedCount, icon: CheckCircle2, color: '#10B981' },
  ];

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
        className="px-6 py-4 flex items-center justify-between sticky top-0 z-20"
        style={{
          background: 'rgba(11,15,26,0.92)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div className="flex items-center gap-3">
          <Link href={`/${tenant}/admin`} className="p-2 rounded-lg" style={{ background: 'var(--color-surface-2)' }}>
            <ChevronRight size={18} style={{ color: 'var(--color-text-secondary)' }} />
          </Link>
          <div>
            <h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>ניהול תביעות</h1>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{claims.length} תביעות</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('kanban')}
            className="p-2 rounded-lg"
            style={{
              background: view === 'kanban' ? 'rgba(99,102,241,0.12)' : 'var(--color-surface-2)',
              color: view === 'kanban' ? '#818CF8' : 'var(--color-text-muted)',
            }}
          >
            <LayoutGrid size={18} />
          </button>
          <button
            onClick={() => setView('table')}
            className="p-2 rounded-lg"
            style={{
              background: view === 'table' ? 'rgba(99,102,241,0.12)' : 'var(--color-surface-2)',
              color: view === 'table' ? '#818CF8' : 'var(--color-text-muted)',
            }}
          >
            <List size={18} />
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* ─── KPI Row ──────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {KPIs.map((kpi) => (
            <div key={kpi.label} className="glass-card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${kpi.color}12` }}>
                <kpi.icon size={20} color={kpi.color} />
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{kpi.label}</p>
                <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{kpi.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ─── Search ──────────────────────── */}
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--color-text-muted)' }} />
            <input
              className="input w-full pr-10"
              placeholder="חיפוש תביעה..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* ─── Kanban View ──────────────────── */}
        {view === 'kanban' && (
          <div className="flex gap-4 overflow-x-auto pb-4" style={{ direction: 'rtl' }}>
            {CLAIM_STAGES.map((stage) => {
              const stageClaims = filtered.filter((c: any) => c.status === stage.key);
              return (
                <div
                  key={stage.key}
                  className="min-w-[280px] flex-shrink-0 rounded-2xl p-3"
                  style={{
                    background: 'var(--color-surface-1)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  {/* Column Header */}
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${stage.color}15` }}>
                      <stage.icon size={14} color={stage.color} />
                    </div>
                    <span className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{stage.label}</span>
                    <span className="badge text-xs mr-auto" style={{ background: `${stage.color}12`, color: stage.color }}>
                      {stageClaims.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div className="space-y-2">
                    {stageClaims.map((claim: any) => {
                      const claimantName = `${claim.claimant?.firstName || ''} ${claim.claimant?.lastName || ''}`.trim();
                      return (
                        <div
                          key={claim.id}
                          className="rounded-xl p-3 cursor-pointer transition-all hover:scale-[1.01]"
                          style={{
                            background: 'var(--color-surface-0)',
                            border: '1px solid var(--color-border)',
                            borderTop: `3px solid ${stage.color}`,
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-mono" style={{ color: stage.color }}>{claim.claimNumber}</span>
                            <span className="text-xs font-bold" style={{ color: '#34D399' }}>₪{(claim.amount || 0).toLocaleString()}</span>
                          </div>
                          <h4 className="text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
                            {claim.title}
                          </h4>
                          <p className="text-xs mb-2 line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>
                            {claim.description}
                          </p>
                          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--color-text-muted)' }}>
                            <span className="flex items-center gap-1">
                              <User size={11} /> {claimantName || 'לא ידוע'}
                            </span>
                            <span>{claim.createdAt}</span>
                          </div>
                          {claim.issueReport && (
                            <div className="mt-2 pt-2" style={{ borderTop: '1px solid var(--color-border)' }}>
                              <span className="text-xs flex items-center gap-1" style={{ color: '#818CF8' }}>
                                <FileText size={11} /> {claim.issueReport.reportNumber}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {stageClaims.length === 0 && (
                      <div className="text-center py-6">
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>אין תביעות</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ─── Table View ──────────────────── */}
        {view === 'table' && (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    {['מספר', 'כותרת', 'תובע', 'סכום', 'שלב', 'פנייה מקורית', 'תאריך'].map((h) => (
                      <th key={h} className="px-4 py-3 text-right text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((claim: any) => {
                    const stage = CLAIM_STAGES.find((s) => s.key === claim.status) || CLAIM_STAGES[0];
                    const claimantName = `${claim.claimant?.firstName || ''} ${claim.claimant?.lastName || ''}`.trim();
                    return (
                      <tr
                        key={claim.id}
                        className="transition-all hover:bg-[var(--color-surface-1)] cursor-pointer"
                        style={{ borderBottom: '1px solid var(--color-border)' }}
                      >
                        <td className="px-4 py-3">
                          <span className="text-xs font-mono" style={{ color: '#818CF8' }}>{claim.claimNumber}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{claim.title}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{claimantName || '—'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-bold" style={{ color: '#34D399' }}>₪{(claim.amount || 0).toLocaleString()}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="badge text-xs" style={{ background: `${stage.color}15`, color: stage.color }}>
                            {stage.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>
                            {claim.issueReport?.reportNumber || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{claim.createdAt}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
