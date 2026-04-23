'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import {
  ChevronRight, MapPin, Clock, Share2,
  MessageCircle, AlertTriangle, CheckCircle2,
  User, Calendar, Building2, Send, Edit3,
  ChevronDown, ChevronUp, History, FileText,
  UserPlus, Wrench, Scale, Eye, Trash2,
  Image as ImageIcon, Flag, Loader2
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'NEW', label: 'חדש', color: '#818CF8' },
  { value: 'PENDING_VERIFICATION', label: 'ממתין לאימות', color: '#A78BFA' },
  { value: 'ASSIGNED', label: 'הועבר למחלקה', color: '#60A5FA' },
  { value: 'IN_PROGRESS', label: 'בטיפול', color: '#FBBF24' },
  { value: 'INSPECTION_SCHEDULED', label: 'נקבעה בדיקה', color: '#F97316' },
  { value: 'WAITING_CONTRACTOR', label: 'ממתין לקבלן', color: '#F472B6' },
  { value: 'RESOLVED', label: 'טופל', color: '#34D399' },
  { value: 'CLOSED', label: 'נסגר', color: '#9CA3AF' },
  { value: 'REJECTED', label: 'נדחה', color: '#EF4444' },
];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'לפני פחות משעה';
  if (hours < 24) return `לפני ${hours} שעות`;
  return `לפני ${Math.floor(hours / 24)} ימים`;
}

export default function AdminIssueDetailPage() {
  const { tenant, id } = useParams();
  const router = useRouter();
  const { accessToken } = useAuthStore();
  const tenantSlug = tenant as string;
  const issueId = id as string;

  const [issue, setIssue] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [status, setStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');
  const [department, setDepartment] = useState('');
  const [worker, setWorker] = useState('');
  const [newNote, setNewNote] = useState('');
  const [noteIsInternal, setNoteIsInternal] = useState(false);
  const [showSimilar, setShowSimilar] = useState(false);
  const [sendingComment, setSendingComment] = useState(false);

  const fetchIssue = useCallback(async () => {
    const res = await api.getIssue(tenantSlug, issueId);
    if (res.success && res.data) {
      setIssue(res.data);
      setStatus(res.data.status || 'NEW');
      setDepartment(res.data.assignedDeptId || res.data.assignedDept?.id || '');
      setWorker(res.data.assignedUserId || res.data.assignedUser?.id || '');
    } else {
      setError('לא ניתן לטעון את הפנייה');
    }
  }, [tenantSlug, issueId]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      await Promise.all([
        fetchIssue(),
        api.getDepartments(tenantSlug).then(r => { if (r.success && r.data) setDepartments(Array.isArray(r.data) ? r.data : []); }),
        accessToken
          ? api.getTeamMembers(tenantSlug, accessToken).then(r => { if (r.success && r.data) setTeamMembers(Array.isArray(r.data) ? r.data : []); })
          : Promise.resolve(),
      ]);
      setLoading(false);
    }
    load();
  }, [tenantSlug, issueId, accessToken, fetchIssue]);

  const handleSaveStatus = async () => {
    if (!accessToken || status === issue?.status) return;
    setSaving(true);
    const res = await api.updateIssueStatus(tenantSlug, issueId, { status, reason: statusReason || undefined }, accessToken);
    if (res.success) {
      await fetchIssue();
      setStatusReason('');
    }
    setSaving(false);
  };

  const handleAssignWorker = async (userId: string) => {
    if (!accessToken || !userId) return;
    setWorker(userId);
    await api.assignIssue(tenantSlug, issueId, userId, accessToken);
    await fetchIssue();
  };

  const handleAddComment = async () => {
    if (!accessToken || !newNote.trim()) return;
    setSendingComment(true);
    const res = await api.addComment(tenantSlug, issueId, { content: newNote, isInternal: noteIsInternal }, accessToken);
    if (res.success) {
      setNewNote('');
      await fetchIssue();
    }
    setSendingComment(false);
  };

  const handleMarkResolved = async () => {
    if (!accessToken) return;
    setSaving(true);
    await api.updateIssueStatus(tenantSlug, issueId, { status: 'RESOLVED', reason: 'סומן כטופל' }, accessToken);
    await fetchIssue();
    setStatus('RESOLVED');
    setSaving(false);
  };

  const handleReject = async () => {
    if (!accessToken) return;
    setSaving(true);
    await api.updateIssueStatus(tenantSlug, issueId, { status: 'REJECTED', reason: 'נדחה' }, accessToken);
    await fetchIssue();
    setStatus('REJECTED');
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-surface-0)' }}>
        <Loader2 size={32} className="animate-spin" style={{ color: '#818CF8' }} />
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-surface-0)' }}>
        <div className="text-center">
          <p className="text-lg mb-4" style={{ color: 'var(--color-text-secondary)' }}>{error || 'פנייה לא נמצאה'}</p>
          <Link href={`/${tenant}/admin/issues`} className="btn-primary px-6 py-2">חזרה לרשימה</Link>
        </div>
      </div>
    );
  }

  const currentStatus = STATUS_OPTIONS.find(s => s.value === (issue.status || status)) || STATUS_OPTIONS[0];
  const slaDate = issue.slaDeadline ? new Date(issue.slaDeadline) : null;
  const slaRemaining = slaDate ? Math.max(0, Math.floor((slaDate.getTime() - Date.now()) / 3600000)) : null;
  const slaCritical = slaRemaining !== null && slaRemaining < 6;
  const comments = issue.comments || [];
  const statusHistory = issue.statusHistory || [];
  const attachments = issue.attachments || [];
  const reporterName = issue.reporter ? `${issue.reporter.firstName || ''} ${issue.reporter.lastName || ''}`.trim() : 'אנונימי';

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface-0)' }}>
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between sticky top-0 z-20" style={{ background: 'rgba(11,15,26,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="flex items-center gap-3">
          <Link href={`/${tenant}/admin/issues`} className="p-2 rounded-lg" style={{ background: 'var(--color-surface-2)' }}>
            <ChevronRight size={18} style={{ color: 'var(--color-text-secondary)' }} />
          </Link>
          <div>
            <span className="text-xs font-mono" style={{ color: '#818CF8' }}>{issue.reportNumber}</span>
            <h1 className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>ניהול פנייה</h1>
          </div>
        </div>
        <Link href={`/${tenant}/issues/${id}`} className="badge flex items-center gap-1" style={{ background: 'var(--color-surface-2)' }}>
          <Eye size={12} /> תצוגת תושב
        </Link>
      </header>

      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-6 p-6">
        {/* Main Content */}
        <div className="flex-1 space-y-4">
          {/* Status Bar */}
          <div className="rounded-2xl p-5" style={{ background: `linear-gradient(135deg, ${currentStatus.color}10, transparent)`, border: `1px solid ${currentStatus.color}25` }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="badge text-sm px-4 py-1.5" style={{ background: `${currentStatus.color}20`, color: currentStatus.color }}>{currentStatus.label}</span>
                {issue.category && <span className="badge text-sm" style={{ background: `${issue.category.color || '#818CF8'}15`, color: issue.category.color || '#818CF8' }}>{issue.category.name}</span>}
                {issue.urgency === 'CRITICAL' && <span className="badge text-sm" style={{ background: '#EF444420', color: '#EF4444' }}><AlertTriangle size={12} /> קריטי</span>}
                {issue.urgency === 'HIGH' && <span className="badge text-sm" style={{ background: '#F59E0B20', color: '#F59E0B' }}><Flag size={12} /> דחיפות גבוהה</span>}
              </div>
              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                <Eye size={12} /> {issue._count?.comments || 0} תגובות
              </div>
            </div>
            {slaDate && slaRemaining !== null && (
              <div className="rounded-lg p-3" style={{ background: slaCritical ? 'rgba(239,68,68,0.08)' : 'var(--color-surface-1)', border: `1px solid ${slaCritical ? 'rgba(239,68,68,0.2)' : 'var(--color-border)'}` }}>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1" style={{ color: slaCritical ? '#EF4444' : 'var(--color-text-muted)' }}><Clock size={12} /> SLA: נותרו {slaRemaining} שעות</span>
                  <span style={{ color: 'var(--color-text-muted)' }}>מועד יעד: {slaDate.toLocaleDateString('he-IL')}</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-3)' }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, ((48 - slaRemaining) / 48) * 100)}%`, background: slaCritical ? 'linear-gradient(90deg, #EF4444, #DC2626)' : 'linear-gradient(90deg, #818CF8, #6366F1)' }} />
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="glass-card p-5">
            <h3 className="font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>תיאור</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{issue.description}</p>
          </div>

          {/* Location + Photos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-card p-5">
              <h3 className="font-bold mb-2 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}><MapPin size={14} color="#818CF8" /> מיקום</h3>
              <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>{issue.address || 'לא צוין'}</p>
              <div className="rounded-xl h-32 flex items-center justify-center" style={{ background: 'var(--color-surface-1)', border: '1px solid var(--color-border)' }}>
                <MapPin size={20} style={{ color: 'var(--color-text-muted)' }} />
              </div>
            </div>
            <div className="glass-card p-5">
              <h3 className="font-bold mb-2 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}><ImageIcon size={14} color="#818CF8" /> תמונות ({attachments.length})</h3>
              {attachments.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {attachments.slice(0, 4).map((att: any) => (
                    <img key={att.id} src={att.url} alt="" className="rounded-lg h-16 w-full object-cover" />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl h-32 flex items-center justify-center" style={{ background: 'var(--color-surface-1)', border: '1px dashed var(--color-border)' }}>
                  <div className="text-center">
                    <ImageIcon size={20} className="mx-auto mb-1" style={{ color: 'var(--color-text-muted)' }} />
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>אין תמונות</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Reporter Info */}
          <div className="glass-card p-5">
            <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}><User size={14} color="#818CF8" /> פרטי מדווח</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>שם</span>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{issue.isAnonymous ? 'אנונימי' : reporterName}</p>
              </div>
              <div>
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>אימייל</span>
                <p className="text-sm" style={{ color: '#818CF8' }}>{issue.isAnonymous ? '—' : (issue.reporter?.email || '—')}</p>
              </div>
              <div>
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>תאריך דיווח</span>
                <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{new Date(issue.createdAt).toLocaleDateString('he-IL')}</p>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="glass-card p-5">
            <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}><History size={14} color="#818CF8" /> היסטוריית פעולות ({statusHistory.length})</h3>
            <div className="space-y-3 pr-4 border-r-2" style={{ borderColor: 'var(--color-border)' }}>
              {statusHistory.length > 0 ? statusHistory.map((entry: any, i: number) => (
                <div key={entry.id || i} className="relative">
                  <div className="absolute right-[-21px] top-1 w-3 h-3 rounded-full" style={{ background: '#818CF8', border: '2px solid var(--color-surface-0)' }} />
                  <div className="mb-0.5">
                    <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      {entry.fromStatus || '—'} → {entry.toStatus}
                    </span>
                  </div>
                  <div className="text-xs flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
                    <span>{entry.reason || ''}</span>
                    <span>•</span>
                    <span>{timeAgo(entry.createdAt)}</span>
                  </div>
                </div>
              )) : (
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>אין היסטוריה עדיין</p>
              )}
            </div>
          </div>

          {/* Comments */}
          <div className="glass-card p-5">
            <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}><MessageCircle size={14} color="#818CF8" /> הערות ({comments.length})</h3>
            <div className="space-y-3 mb-4">
              {comments.map((c: any) => (
                <div key={c.id} className="rounded-xl p-3" style={{ background: c.isInternal ? 'rgba(251,191,36,0.05)' : 'var(--color-surface-1)', border: `1px solid ${c.isInternal ? 'rgba(251,191,36,0.15)' : 'var(--color-border)'}`, borderRight: `3px solid ${c.isInternal ? '#FBBF24' : '#818CF8'}` }}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{c.user ? `${c.user.firstName} ${c.user.lastName}` : 'מערכת'}</span>
                    {c.isInternal && <span className="badge text-xs" style={{ background: 'rgba(251,191,36,0.12)', color: '#FBBF24' }}>פנימי</span>}
                    <span className="text-xs mr-auto" style={{ color: 'var(--color-text-muted)' }}>{timeAgo(c.createdAt)}</span>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{c.content}</p>
                </div>
              ))}
              {comments.length === 0 && <p className="text-xs text-center py-4" style={{ color: 'var(--color-text-muted)' }}>אין הערות עדיין</p>}
            </div>
            {/* Add Note */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={noteIsInternal} onChange={(e) => setNoteIsInternal(e.target.checked)} className="accent-[#818CF8]" />
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>הערה פנימית</span>
                </label>
              </div>
              <div className="flex gap-2">
                <input className="input flex-1 py-2.5" placeholder={noteIsInternal ? 'הערה פנימית (לא נראית לתושב)...' : 'הערה / עדכון לתושב...'} value={newNote} onChange={(e) => setNewNote(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddComment()} />
                <button className="btn-primary px-4 py-2.5 flex items-center gap-1.5 text-sm" disabled={!newNote.trim() || sendingComment} onClick={handleAddComment}>
                  {sendingComment ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} שלח
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <aside className="w-full lg:w-80 space-y-4 lg:sticky lg:top-20 lg:self-start">
          {/* Status Change */}
          <div className="glass-card p-5">
            <h4 className="font-bold text-sm mb-3" style={{ color: 'var(--color-text-primary)' }}><Edit3 size={13} className="inline ml-1" color="#818CF8" /> שינוי סטטוס</h4>
            <select className="input w-full py-2.5 text-sm mb-2" value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUS_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
            </select>
            {status !== issue.status && (
              <>
                <input className="input w-full py-2 text-sm mb-2" placeholder="סיבה (אופציונלי)" value={statusReason} onChange={(e) => setStatusReason(e.target.value)} />
                <button className="btn-primary w-full py-2 text-sm" disabled={saving} onClick={handleSaveStatus}>
                  {saving ? <Loader2 size={14} className="animate-spin mx-auto" /> : 'עדכן סטטוס'}
                </button>
              </>
            )}
          </div>

          {/* Department Assignment */}
          <div className="glass-card p-5">
            <h4 className="font-bold text-sm mb-3" style={{ color: 'var(--color-text-primary)' }}><Building2 size={13} className="inline ml-1" color="#818CF8" /> שיוך מחלקה</h4>
            <select className="input w-full py-2.5 text-sm" value={department} onChange={(e) => setDepartment(e.target.value)}>
              <option value="">בחר מחלקה...</option>
              {departments.map((d: any) => (<option key={d.id} value={d.id}>{d.name}</option>))}
            </select>
          </div>

          {/* Worker Assignment */}
          <div className="glass-card p-5">
            <h4 className="font-bold text-sm mb-3" style={{ color: 'var(--color-text-primary)' }}><UserPlus size={13} className="inline ml-1" color="#818CF8" /> שיוך עובד</h4>
            <select className="input w-full py-2.5 text-sm" value={worker} onChange={(e) => handleAssignWorker(e.target.value)}>
              <option value="">בחר עובד...</option>
              {teamMembers.map((w: any) => (<option key={w.id} value={w.id}>{w.firstName} {w.lastName}</option>))}
            </select>
          </div>

          {/* Quick Actions */}
          <div className="glass-card p-5 space-y-2">
            <h4 className="font-bold text-sm mb-3" style={{ color: 'var(--color-text-primary)' }}>פעולות מהירות</h4>
            <button onClick={handleMarkResolved} disabled={saving} className="w-full flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all hover:opacity-80" style={{ background: 'rgba(16,185,129,0.08)', color: '#6EE7B7', border: '1px solid rgba(16,185,129,0.15)' }}>
              <CheckCircle2 size={14} /> סמן כטופל
            </button>
            <button onClick={handleReject} disabled={saving} className="w-full flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all hover:opacity-80" style={{ background: 'rgba(239,68,68,0.08)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.15)' }}>
              <Trash2 size={14} /> דחה פנייה
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
