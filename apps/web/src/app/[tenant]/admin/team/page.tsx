'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ChevronRight, Users, Search, Plus, Filter,
  Building2, Mail, Phone, Shield, Edit3,
  MoreVertical, CheckCircle2, XCircle, Clock,
  BarChart3, User, ChevronDown, X, Loader2
} from 'lucide-react';
import { ROLE_LABELS } from '@cityfix/shared';
import { useTeam, useDepartments } from '@/lib/hooks';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

/* ─── Fallback mock data ─────────────────────────── */
const MOCK_DEPARTMENTS = [
  { id: '1', name: 'מחלקת כבישים', color: '#EF4444', memberCount: 4, openIssues: 8 },
  { id: '2', name: 'מחלקת חשמל', color: '#F59E0B', memberCount: 3, openIssues: 5 },
  { id: '3', name: 'מחלקת ניקיון', color: '#10B981', memberCount: 6, openIssues: 3 },
  { id: '4', name: 'מחלקת גנים', color: '#22C55E', memberCount: 2, openIssues: 4 },
  { id: '5', name: 'מחלקת תנועה', color: '#F97316', memberCount: 3, openIssues: 6 },
];

const MOCK_MEMBERS = [
  { id: '1', firstName: 'משה', lastName: 'כהן', email: 'admin@tel-aviv.gov.il', phone: '050-1234567', role: 'ADMIN', department: null, isActive: true, openIssues: 0, resolvedThisMonth: 0 },
  { id: '2', firstName: 'דוד', lastName: 'לוי', email: 'roads@tel-aviv.gov.il', phone: '050-2345678', role: 'DEPT_MANAGER', department: MOCK_DEPARTMENTS[0], isActive: true, openIssues: 8, resolvedThisMonth: 15 },
  { id: '3', firstName: 'מירב', lastName: 'דהן', email: 'electric@tel-aviv.gov.il', phone: '050-3456789', role: 'DEPT_MANAGER', department: MOCK_DEPARTMENTS[1], isActive: true, openIssues: 5, resolvedThisMonth: 12 },
  { id: '4', firstName: 'אבי', lastName: 'מזרחי', email: 'avi.m@tel-aviv.gov.il', phone: '050-4567890', role: 'FIELD_WORKER', department: MOCK_DEPARTMENTS[0], isActive: true, openIssues: 3, resolvedThisMonth: 22 },
  { id: '5', firstName: 'רונית', lastName: 'שמש', email: 'ronit@tel-aviv.gov.il', phone: '050-5678901', role: 'CALL_CENTER', department: null, isActive: true, openIssues: 12, resolvedThisMonth: 45 },
  { id: '6', firstName: 'יגאל', lastName: 'ברוך', email: 'yigal@tel-aviv.gov.il', phone: '050-6789012', role: 'FIELD_WORKER', department: MOCK_DEPARTMENTS[2], isActive: false, openIssues: 0, resolvedThisMonth: 0 },
  { id: '7', firstName: 'נעמה', lastName: 'גולן', email: 'naama@tel-aviv.gov.il', phone: '050-7890123', role: 'LEGAL', department: null, isActive: true, openIssues: 4, resolvedThisMonth: 8 },
  { id: '8', firstName: 'עמוס', lastName: 'תמיר', email: 'amos@tel-aviv.gov.il', phone: '050-8901234', role: 'FIELD_WORKER', department: MOCK_DEPARTMENTS[0], isActive: true, openIssues: 5, resolvedThisMonth: 18 },
];

const ROLE_COLORS: Record<string, string> = {
  ADMIN: '#EF4444', DEPT_MANAGER: '#818CF8', FIELD_WORKER: '#34D399',
  CALL_CENTER: '#FBBF24', LEGAL: '#F97316', INSURANCE: '#EC4899', RESIDENT: '#6B7280',
};

export default function AdminTeamPage() {
  const { tenant } = useParams();
  const { accessToken } = useAuthStore();
  const { data: apiMembers, loading: loadingTeam, refetch: refetchTeam } = useTeam();
  const { data: apiDepts, loading: loadingDepts } = useDepartments();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newUser, setNewUser] = useState({
    firstName: '', lastName: '', email: '', phone: '', role: 'FIELD_WORKER', departmentId: '',
  });

  // Normalize data
  const members = useMemo(() => {
    if (apiMembers && Array.isArray(apiMembers) && apiMembers.length > 0) {
      return apiMembers.map((m: any) => ({
        ...m,
        department: m.department || null,
        isActive: m.isActive ?? true,
        openIssues: m._count?.assignedIssues || m.openIssues || 0,
        resolvedThisMonth: m.resolvedThisMonth || 0,
      }));
    }
    return MOCK_MEMBERS;
  }, [apiMembers]);

  const departments = useMemo(() => {
    if (apiDepts && Array.isArray(apiDepts) && apiDepts.length > 0) {
      return apiDepts.map((d: any, i: number) => ({
        id: d.id, name: d.name,
        color: d.color || ['#EF4444', '#F59E0B', '#10B981', '#22C55E', '#F97316'][i % 5],
        memberCount: d._count?.users || 0,
        openIssues: d._count?.issues || 0,
      }));
    }
    return MOCK_DEPARTMENTS;
  }, [apiDepts]);

  const filteredMembers = members.filter((m: any) => {
    const matchesSearch = `${m.firstName} ${m.lastName}`.includes(searchQuery) || m.email.includes(searchQuery);
    const matchesRole = !roleFilter || m.role === roleFilter;
    const matchesDept = !deptFilter || m.department?.id === deptFilter;
    return matchesSearch && matchesRole && matchesDept;
  });

  const activeCount = members.filter((m: any) => m.isActive).length;
  const totalResolved = members.reduce((s: number, m: any) => s + (m.resolvedThisMonth || 0), 0);

  const handleCreateUser = async () => {
    setSaving(true);
    try {
      await api.createUser(String(tenant), {
        ...newUser,
        password: 'Temp1234!', // Default password
      }, accessToken || '');
      setShowAddModal(false);
      setNewUser({ firstName: '', lastName: '', email: '', phone: '', role: 'FIELD_WORKER', departmentId: '' });
      refetchTeam();
    } catch {
      setShowAddModal(false);
    } finally {
      setSaving(false);
    }
  };

  if (loadingTeam) {
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
            <h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>ניהול צוות</h1>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{members.length} חברי צוות</p>
          </div>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary py-2 px-4 text-sm flex items-center gap-1.5">
          <Plus size={16} /> הוסף עובד
        </button>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* ─── KPI Row ──────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.12)' }}>
              <Users size={20} color="#818CF8" />
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>סה״כ צוות</p>
              <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{members.length}</p>
            </div>
          </div>
          <div className="glass-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(52,211,153,0.12)' }}>
              <CheckCircle2 size={20} color="#34D399" />
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>פעילים</p>
              <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{activeCount}</p>
            </div>
          </div>
          <div className="glass-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(251,191,36,0.12)' }}>
              <BarChart3 size={20} color="#FBBF24" />
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>טופלו החודש</p>
              <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{totalResolved}</p>
            </div>
          </div>
          <div className="glass-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(249,115,22,0.12)' }}>
              <Building2 size={20} color="#F97316" />
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>מחלקות</p>
              <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{departments.length}</p>
            </div>
          </div>
        </div>

        {/* ─── Departments Overview ────────── */}
        <div className="glass-card p-5">
          <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
            <Building2 size={14} color="#818CF8" /> מחלקות
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {departments.map((dept: any) => (
              <button
                key={dept.id}
                onClick={() => setDeptFilter(deptFilter === dept.id ? '' : dept.id)}
                className="rounded-xl p-3 text-right transition-all hover:scale-[1.02]"
                style={{
                  background: deptFilter === dept.id ? `${dept.color}10` : 'var(--color-surface-1)',
                  border: `1px solid ${deptFilter === dept.id ? `${dept.color}30` : 'var(--color-border)'}`,
                  borderRight: `3px solid ${dept.color}`,
                }}
              >
                <span className="text-sm font-semibold block mb-1" style={{ color: 'var(--color-text-primary)' }}>
                  {dept.name}
                </span>
                <div className="flex items-center justify-between text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  <span>{dept.memberCount} עובדים</span>
                  <span style={{ color: dept.openIssues > 5 ? '#F59E0B' : '#34D399' }}>
                    {dept.openIssues} פתוחות
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ─── Filters ──────────────────────── */}
        <div className="glass-card p-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--color-text-muted)' }} />
            <input
              className="input w-full pr-10"
              placeholder="חיפוש עובד..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select className="input py-2.5 text-sm" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">כל התפקידים</option>
            {Object.entries(ROLE_LABELS).map(([key, labels]) => (
              <option key={key} value={key}>{labels.he}</option>
            ))}
          </select>
          {(roleFilter || deptFilter || searchQuery) && (
            <button
              onClick={() => { setRoleFilter(''); setDeptFilter(''); setSearchQuery(''); }}
              className="badge flex items-center gap-1 cursor-pointer"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#FCA5A5' }}
            >
              <X size={12} /> נקה פילטרים
            </button>
          )}
        </div>

        {/* ─── Team Table ────────────────────── */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {['עובד', 'תפקיד', 'מחלקה', 'אימייל', 'טלפון', 'פניות פתוחות', 'טופלו החודש', 'סטטוס'].map((h) => (
                    <th key={h} className="px-4 py-3 text-right text-xs font-semibold whitespace-nowrap" style={{ color: 'var(--color-text-muted)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member: any) => {
                  const roleLabel = ROLE_LABELS[member.role] || { he: member.role };
                  const roleColor = ROLE_COLORS[member.role] || '#6B7280';
                  const initials = `${member.firstName?.[0] || ''}${member.lastName?.[0] || ''}`;
                  return (
                    <tr
                      key={member.id}
                      className="transition-all hover:bg-[var(--color-surface-1)] cursor-pointer"
                      style={{ borderBottom: '1px solid var(--color-border)' }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                            style={{
                              background: `linear-gradient(135deg, ${roleColor}30, ${roleColor}10)`,
                              color: roleColor,
                              border: `1px solid ${roleColor}25`,
                            }}
                          >
                            {initials}
                          </div>
                          <span className="text-sm font-semibold whitespace-nowrap" style={{ color: 'var(--color-text-primary)' }}>
                            {member.firstName} {member.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="badge text-xs" style={{ background: `${roleColor}12`, color: roleColor }}>
                          {roleLabel.he}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {member.department ? (
                          <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{member.department.name}</span>
                        ) : (
                          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm" style={{ color: '#818CF8' }}>{member.email}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{member.phone || '—'}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-bold" style={{ color: member.openIssues > 5 ? '#F59E0B' : 'var(--color-text-primary)' }}>
                          {member.openIssues}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-bold" style={{ color: '#34D399' }}>{member.resolvedThisMonth}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="badge text-xs"
                          style={{
                            background: member.isActive ? 'rgba(52,211,153,0.12)' : 'rgba(239,68,68,0.12)',
                            color: member.isActive ? '#34D399' : '#FCA5A5',
                          }}
                        >
                          {member.isActive ? 'פעיל' : 'לא פעיל'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredMembers.length === 0 && (
            <div className="py-12 text-center">
              <Users size={32} className="mx-auto mb-2" style={{ color: 'var(--color-text-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>לא נמצאו תוצאות</p>
            </div>
          )}
        </div>
      </div>

      {/* ─── Add Employee Modal ──────────── */}
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
              <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>הוספת עובד חדש</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-lg" style={{ background: 'var(--color-surface-2)' }}>
                <X size={16} style={{ color: 'var(--color-text-muted)' }} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>שם פרטי</label>
                  <input className="input w-full" placeholder="שם פרטי" value={newUser.firstName} onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>שם משפחה</label>
                  <input className="input w-full" placeholder="שם משפחה" value={newUser.lastName} onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>אימייל</label>
                <input className="input w-full" type="email" placeholder="email@example.com" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>טלפון</label>
                <input className="input w-full" type="tel" placeholder="050-0000000" value={newUser.phone} onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })} />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>תפקיד</label>
                <select className="input w-full" value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                  {Object.entries(ROLE_LABELS).map(([key, labels]) => (
                    <option key={key} value={key}>{labels.he}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>מחלקה</label>
                <select className="input w-full" value={newUser.departmentId} onChange={(e) => setNewUser({ ...newUser, departmentId: e.target.value })}>
                  <option value="">ללא מחלקה</option>
                  {departments.map((d: any) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
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
                  onClick={handleCreateUser}
                  disabled={saving || !newUser.email || !newUser.firstName}
                  className="btn-primary flex-1 py-2.5 text-sm font-bold"
                >
                  {saving ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'הוסף עובד'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
