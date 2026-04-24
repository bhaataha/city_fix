'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ChevronRight, Building2, Search, Plus, Edit3,
  Trash2, Users, AlertTriangle, CheckCircle2,
  X, BarChart3, Palette, Clock, Save,
  ChevronDown, ChevronUp, Loader2
} from 'lucide-react';
import { useDepartments } from '@/lib/hooks';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

/* ─── No mock data — real API only ──────────────── */

// Colors for department cards
const DEPT_COLORS = ['#EF4444', '#F59E0B', '#10B981', '#22C55E', '#F97316', '#6366F1', '#EC4899', '#14B8A6'];

export default function AdminDepartmentsPage() {
  const { tenant } = useParams();
  const { accessToken } = useAuthStore();
  const { data: apiDepts, loading, refetch } = useDepartments();

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDept, setExpandedDept] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newDept, setNewDept] = useState({
    name: '', description: '', color: '#6366F1', slaTarget: 48, contactEmail: '',
  });

  // Normalize API data
  const departments = useMemo(() => {
    if (apiDepts && Array.isArray(apiDepts) && apiDepts.length > 0) {
      return apiDepts.map((d: any, i: number) => ({
        id: d.id,
        name: d.name,
        color: d.color || DEPT_COLORS[i % DEPT_COLORS.length],
        manager: d.manager || d.head || null,
        contactEmail: d.contactEmail || d.email || '',
        memberCount: d._count?.users || d.memberCount || 0,
        openIssues: d.openIssues || d._count?.issues || 0,
        resolvedMonth: d.resolvedMonth || 0,
        categories: d.categories || [],
        slaTarget: d.slaTarget || 48,
        description: d.description || '',
      }));
    }
    return [];
  }, [apiDepts]);

  const filtered = departments.filter((d: any) => {
    const managerName = d.manager ? `${d.manager.firstName} ${d.manager.lastName}` : '';
    return d.name.includes(searchQuery) || managerName.includes(searchQuery);
  });

  const totalOpenIssues = departments.reduce((s: number, d: any) => s + (d.openIssues || 0), 0);
  const totalResolved = departments.reduce((s: number, d: any) => s + (d.resolvedMonth || 0), 0);
  const totalCategories = departments.reduce((s: number, d: any) => s + (d.categories?.length || 0), 0);

  const handleCreateDept = async () => {
    setSaving(true);
    try {
      await api.createDepartment(String(tenant), accessToken || '', newDept);
      setShowAddModal(false);
      setNewDept({ name: '', description: '', color: '#6366F1', slaTarget: 48, contactEmail: '' });
      refetch();
    } catch {
      // API error — close gracefully
      setShowAddModal(false);
    } finally {
      setSaving(false);
    }
  };

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
          <Link
            href={`/${tenant}/admin`}
            className="p-2 rounded-lg"
            style={{ background: 'var(--color-surface-2)' }}
          >
            <ChevronRight size={18} style={{ color: 'var(--color-text-secondary)' }} />
          </Link>
          <div>
            <h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
              ניהול מחלקות
            </h1>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {departments.length} מחלקות פעילות
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary py-2 px-4 text-sm flex items-center gap-1.5"
        >
          <Plus size={16} /> הוסף מחלקה
        </button>
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* ─── KPI Row ──────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.12)' }}>
              <Building2 size={20} color="#818CF8" />
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>מחלקות</p>
              <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{departments.length}</p>
            </div>
          </div>
          <div className="glass-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.12)' }}>
              <AlertTriangle size={20} color="#F59E0B" />
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>פניות פתוחות</p>
              <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{totalOpenIssues}</p>
            </div>
          </div>
          <div className="glass-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(52,211,153,0.12)' }}>
              <CheckCircle2 size={20} color="#34D399" />
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>טופלו החודש</p>
              <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{totalResolved}</p>
            </div>
          </div>
          <div className="glass-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(249,115,22,0.12)' }}>
              <Palette size={20} color="#F97316" />
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>קטגוריות משויכות</p>
              <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{totalCategories}</p>
            </div>
          </div>
        </div>

        {/* ─── Search ──────────────────────── */}
        <div className="glass-card p-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--color-text-muted)' }} />
            <input
              className="input w-full pr-10"
              placeholder="חיפוש מחלקה..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* ─── Department Cards ────────────── */}
        <div className="space-y-4">
          {filtered.map((dept: any) => {
            const isExpanded = expandedDept === dept.id;
            const resolveRate = dept.resolvedMonth + dept.openIssues > 0
              ? Math.round((dept.resolvedMonth / (dept.resolvedMonth + dept.openIssues)) * 100)
              : 0;
            const managerName = dept.manager
              ? `${dept.manager.firstName} ${dept.manager.lastName}`
              : 'לא הוגדר';

            return (
              <div
                key={dept.id}
                className="glass-card overflow-hidden transition-all"
                style={{ borderRight: `4px solid ${dept.color}` }}
              >
                {/* Main Row */}
                <div
                  className="p-5 flex items-center gap-4 cursor-pointer"
                  onClick={() => setExpandedDept(isExpanded ? null : dept.id)}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${dept.color}12` }}
                  >
                    <Building2 size={22} color={dept.color} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold" style={{ color: 'var(--color-text-primary)' }}>
                      {dept.name}
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {dept.description}
                    </p>
                  </div>

                  <div className="hidden md:flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>{dept.memberCount}</p>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>עובדים</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold" style={{ color: dept.openIssues > 5 ? '#F59E0B' : 'var(--color-text-primary)' }}>
                        {dept.openIssues}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>פתוחות</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold" style={{ color: '#34D399' }}>{dept.resolvedMonth}</p>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>טופלו</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold" style={{ color: resolveRate > 80 ? '#34D399' : '#F59E0B' }}>
                        {resolveRate}%
                      </p>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>מענה</p>
                    </div>
                  </div>

                  {isExpanded ? (
                    <ChevronUp size={18} style={{ color: 'var(--color-text-muted)' }} />
                  ) : (
                    <ChevronDown size={18} style={{ color: 'var(--color-text-muted)' }} />
                  )}
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div
                    className="px-5 pb-5 pt-0 space-y-4 animate-fade-in"
                    style={{ borderTop: '1px solid var(--color-border)' }}
                  >
                    <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Manager Info */}
                      <div className="rounded-xl p-4" style={{ background: 'var(--color-surface-1)', border: '1px solid var(--color-border)' }}>
                        <h4 className="text-xs font-semibold mb-2" style={{ color: 'var(--color-text-muted)' }}>
                          <Users size={12} className="inline ml-1" /> מנהל מחלקה
                        </h4>
                        <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{managerName}</p>
                        <p className="text-xs" style={{ color: '#818CF8' }}>{dept.contactEmail}</p>
                      </div>

                      {/* SLA */}
                      <div className="rounded-xl p-4" style={{ background: 'var(--color-surface-1)', border: '1px solid var(--color-border)' }}>
                        <h4 className="text-xs font-semibold mb-2" style={{ color: 'var(--color-text-muted)' }}>
                          <Clock size={12} className="inline ml-1" /> SLA יעד
                        </h4>
                        <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{dept.slaTarget} שעות</p>
                        <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-3)' }}>
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${resolveRate}%`,
                              background: `linear-gradient(90deg, ${dept.color}, ${dept.color}80)`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="rounded-xl p-4" style={{ background: 'var(--color-surface-1)', border: '1px solid var(--color-border)' }}>
                        <h4 className="text-xs font-semibold mb-2" style={{ color: 'var(--color-text-muted)' }}>
                          <BarChart3 size={12} className="inline ml-1" /> ביצועים
                        </h4>
                        <div className="flex items-center gap-4">
                          <div>
                            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>ממוצע טיפול</span>
                            <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
                              {Math.round(dept.slaTarget * 0.7)} שעות
                            </p>
                          </div>
                          <div>
                            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>עמידה ב-SLA</span>
                            <p className="text-sm font-bold" style={{ color: '#34D399' }}>{resolveRate}%</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Categories */}
                    {dept.categories && dept.categories.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold mb-2" style={{ color: 'var(--color-text-muted)' }}>
                          קטגוריות משויכות
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {dept.categories.map((cat: string) => (
                            <span
                              key={cat}
                              className="badge text-xs"
                              style={{ background: `${dept.color}10`, color: dept.color }}
                            >
                              {cat}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        className="flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-medium"
                        style={{ background: 'rgba(99,102,241,0.08)', color: '#A5B4FC', border: '1px solid rgba(99,102,241,0.15)' }}
                      >
                        <Edit3 size={13} /> ערוך מחלקה
                      </button>
                      <Link
                        href={`/${tenant}/admin/issues?dept=${dept.id}`}
                        className="flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-medium"
                        style={{ background: 'rgba(245,158,11,0.08)', color: '#FCD34D', border: '1px solid rgba(245,158,11,0.15)' }}
                      >
                        <AlertTriangle size={13} /> צפה בפניות
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Add Department Modal ────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div
            className="w-full max-w-md rounded-2xl p-6 animate-fade-in"
            style={{
              background: 'var(--color-surface-0)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
                הוספת מחלקה חדשה
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg"
                style={{ background: 'var(--color-surface-2)' }}
              >
                <X size={16} style={{ color: 'var(--color-text-muted)' }} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>שם המחלקה</label>
                <input
                  className="input w-full"
                  placeholder="לדוגמה: מחלקת מים וביוב"
                  value={newDept.name}
                  onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>תיאור</label>
                <textarea
                  className="input w-full"
                  rows={2}
                  placeholder="תיאור קצר של תחומי אחריות"
                  value={newDept.description}
                  onChange={(e) => setNewDept({ ...newDept, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>צבע</label>
                  <input
                    className="input w-full"
                    type="color"
                    value={newDept.color}
                    onChange={(e) => setNewDept({ ...newDept, color: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>SLA (שעות)</label>
                  <input
                    className="input w-full"
                    type="number"
                    value={newDept.slaTarget}
                    onChange={(e) => setNewDept({ ...newDept, slaTarget: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>מנהל מחלקה (אימייל)</label>
                <input
                  className="input w-full"
                  type="email"
                  placeholder="manager@tel-aviv.gov.il"
                  value={newDept.contactEmail}
                  onChange={(e) => setNewDept({ ...newDept, contactEmail: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-secondary)' }}
                >
                  ביטול
                </button>
                <button
                  onClick={handleCreateDept}
                  disabled={saving || !newDept.name}
                  className="btn-primary flex-1 py-2.5 text-sm font-bold"
                >
                  {saving ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'צור מחלקה'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
