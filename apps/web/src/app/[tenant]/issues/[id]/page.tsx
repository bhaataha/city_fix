'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import {
  ChevronRight, MapPin, Clock, ArrowUp, Share2,
  MessageCircle, AlertTriangle, CheckCircle2,
  User, Calendar, Tag, Building2, Send,
  ChevronDown, Image as ImageIcon, Loader2
} from 'lucide-react';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  NEW: { label: 'חדש', color: '#818CF8' },
  PENDING_VERIFICATION: { label: 'ממתין לאימות', color: '#A78BFA' },
  ASSIGNED: { label: 'שויך למחלקה', color: '#60A5FA' },
  IN_PROGRESS: { label: 'בטיפול', color: '#FBBF24' },
  INSPECTION_SCHEDULED: { label: 'נקבעה בדיקה', color: '#F97316' },
  WAITING_CONTRACTOR: { label: 'ממתין לקבלן', color: '#F472B6' },
  RESOLVED: { label: 'טופל', color: '#34D399' },
  CLOSED: { label: 'נסגר', color: '#9CA3AF' },
  REJECTED: { label: 'נדחה', color: '#EF4444' },
};

const URGENCY_MAP: Record<string, { label: string; color: string }> = {
  LOW: { label: 'נמוכה', color: '#9CA3AF' },
  NORMAL: { label: 'רגילה', color: '#60A5FA' },
  HIGH: { label: 'גבוהה', color: '#F59E0B' },
  CRITICAL: { label: 'קריטי', color: '#EF4444' },
};

const STATUS_FLOW = ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'לפני פחות משעה';
  if (hours < 24) return `לפני ${hours} שעות`;
  return `לפני ${Math.floor(hours / 24)} ימים`;
}

export default function IssueDetailPage() {
  const { tenant, id } = useParams();
  const { accessToken } = useAuthStore();
  const tenantSlug = tenant as string;
  const issueId = id as string;

  const [issue, setIssue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [upvoted, setUpvoted] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showTimeline, setShowTimeline] = useState(true);
  const [sendingComment, setSendingComment] = useState(false);
  const [liveStatus, setLiveStatus] = useState('');

  const fetchIssue = useCallback(async () => {
    const res = await api.getIssue(tenantSlug, issueId);
    if (res.success && res.data) {
      setIssue(res.data);
      setLiveStatus(res.data.status);
    }
  }, [tenantSlug, issueId]);

  useEffect(() => {
    setLoading(true);
    fetchIssue().finally(() => setLoading(false));
  }, [fetchIssue]);

  // WebSocket for live status updates
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    import('@/lib/socket').then(({ getSocket }) => {
      const socket = getSocket();
      socket.connect();
      socket.emit('joinIssue', { issueId: id });
      socket.on('statusUpdate', (data: any) => {
        if (data.status) setLiveStatus(data.status);
      });
      cleanup = () => { socket.off('statusUpdate'); socket.disconnect(); };
    }).catch(() => {});
    return () => cleanup?.();
  }, [id]);

  const handleUpvote = () => {
    setUpvoted(!upvoted);
  };

  const handleAddComment = async () => {
    if (!accessToken || !newComment.trim()) return;
    setSendingComment(true);
    const res = await api.addComment(tenantSlug, issueId, { content: newComment }, accessToken);
    if (res.success) {
      setNewComment('');
      await fetchIssue();
    }
    setSendingComment(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-surface-0)' }}>
        <Loader2 size={32} className="animate-spin" style={{ color: '#818CF8' }} />
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-surface-0)' }}>
        <div className="text-center">
          <p className="text-lg mb-4" style={{ color: 'var(--color-text-secondary)' }}>פנייה לא נמצאה</p>
          <Link href={`/${tenant}/my-reports`} className="btn-primary px-6 py-2">חזרה לדיווחים שלי</Link>
        </div>
      </div>
    );
  }

  const currentStatus = STATUS_MAP[liveStatus || issue.status] || STATUS_MAP.NEW;
  const urgency = URGENCY_MAP[issue.urgency] || URGENCY_MAP.NORMAL;
  const comments = (issue.comments || []).filter((c: any) => !c.isInternal);
  const attachments = issue.attachments || [];
  const statusHistory = issue.statusHistory || [];
  const reporterName = issue.reporter ? `${issue.reporter.firstName || ''} ${issue.reporter.lastName || ''}`.trim() : 'אנונימי';
  const upvoteCount = (issue.upvotes || 0) + (upvoted ? 1 : 0);
  const createdDate = new Date(issue.createdAt);
  const slaDate = issue.slaDeadline ? new Date(issue.slaDeadline) : null;
  const slaHours = slaDate ? Math.max(0, Math.floor((slaDate.getTime() - Date.now()) / 3600000)) : null;

  // Build timeline from status history
  const activeIndex = STATUS_FLOW.indexOf(liveStatus || issue.status);
  const timelineSteps = STATUS_FLOW.map((s, i) => ({
    status: STATUS_MAP[s]?.label || s,
    active: i <= activeIndex,
    color: STATUS_MAP[s]?.color || '#818CF8',
    date: statusHistory.find((h: any) => h.toStatus === s)?.createdAt || '',
  }));

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface-0)' }}>
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between sticky top-0 z-20" style={{ background: 'rgba(11,15,26,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="flex items-center gap-3">
          <Link href={`/${tenant}/my-reports`} className="p-2 rounded-lg" style={{ background: 'var(--color-surface-2)' }}>
            <ChevronRight size={18} style={{ color: 'var(--color-text-secondary)' }} />
          </Link>
          <div>
            <span className="text-xs font-mono" style={{ color: '#818CF8' }}>{issue.reportNumber}</span>
            <h1 className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>פרטי פנייה</h1>
          </div>
        </div>
        <button className="p-2 rounded-lg" style={{ background: 'var(--color-surface-2)' }}>
          <Share2 size={18} style={{ color: 'var(--color-text-secondary)' }} />
        </button>
      </header>

      <div className="max-w-2xl mx-auto">
        {/* Status + Category Badge */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <span className="badge text-sm" style={{ background: `${currentStatus.color}15`, color: currentStatus.color }}>{currentStatus.label}</span>
            <span className="badge text-sm" style={{ background: `${urgency.color}15`, color: urgency.color }}>דחיפות: {urgency.label}</span>
            {issue.category && <span className="badge text-sm" style={{ background: `${issue.category.color || '#EF4444'}15`, color: issue.category.color || '#EF4444' }}>{issue.category.name}</span>}
          </div>
          <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
            {issue.category?.name || 'פנייה'} — {issue.address || 'ללא כתובת'}
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{issue.description}</p>
        </div>

        {/* Photo area */}
        <div className="px-6 pb-4">
          {attachments.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {attachments.map((att: any) => (
                <img key={att.id} src={att.url} alt="" className="rounded-xl h-32 w-full object-cover" />
              ))}
            </div>
          ) : (
            <div className="rounded-xl h-48 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--color-surface-1), var(--color-surface-2))', border: '1px dashed var(--color-border)' }}>
              <div className="text-center">
                <ImageIcon size={32} className="mx-auto mb-2" style={{ color: 'var(--color-text-muted)' }} />
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>תמונות מצורפות לפנייה</span>
              </div>
            </div>
          )}
        </div>

        {/* Info Cards */}
        <div className="px-6 pb-4 grid grid-cols-2 gap-3">
          <div className="glass-card p-3">
            <div className="flex items-center gap-2 mb-1"><MapPin size={14} style={{ color: '#818CF8' }} /><span className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>מיקום</span></div>
            <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{issue.address || 'לא צוין'}</span>
          </div>
          <div className="glass-card p-3">
            <div className="flex items-center gap-2 mb-1"><Building2 size={14} style={{ color: '#818CF8' }} /><span className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>מחלקה מטפלת</span></div>
            <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{issue.assignedDept?.name || 'טרם שויך'}</span>
          </div>
          <div className="glass-card p-3">
            <div className="flex items-center gap-2 mb-1"><Calendar size={14} style={{ color: '#818CF8' }} /><span className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>תאריך דיווח</span></div>
            <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{createdDate.toLocaleDateString('he-IL')} {createdDate.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="glass-card p-3">
            <div className="flex items-center gap-2 mb-1"><Clock size={14} style={{ color: slaHours !== null && slaHours < 6 ? '#EF4444' : '#F59E0B' }} /><span className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>SLA</span></div>
            <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{slaHours !== null ? `נותרו ${slaHours} שעות` : 'לא הוגדר'}</span>
          </div>
        </div>

        {/* Action Bar */}
        <div className="px-6 pb-4 flex items-center gap-3">
          <button onClick={handleUpvote} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all" style={{ background: upvoted ? 'rgba(99,102,241,0.15)' : 'var(--color-surface-2)', color: upvoted ? '#818CF8' : 'var(--color-text-secondary)', border: `1px solid ${upvoted ? 'rgba(99,102,241,0.3)' : 'var(--color-border)'}` }}>
            <ArrowUp size={16} /> +1 תומך ({upvoteCount})
          </button>
          <Link href={`/${tenant}/map?issue=${issue.id}`} className="flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl text-sm font-semibold" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}>
            <MapPin size={16} /> הצג במפה
          </Link>
        </div>

        {/* Status Timeline */}
        <div className="px-6 pb-4">
          <button onClick={() => setShowTimeline(!showTimeline)} className="w-full flex items-center justify-between py-3">
            <span className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>מעקב סטטוס</span>
            <ChevronDown size={16} style={{ color: 'var(--color-text-muted)', transform: showTimeline ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>
          {showTimeline && (
            <div className="glass-card p-4">
              <div className="space-y-4">
                {timelineSteps.map((step, i) => (
                  <div key={step.status} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full border-2 flex-shrink-0" style={{ borderColor: step.color, background: step.active ? step.color : 'transparent' }} />
                      {i < timelineSteps.length - 1 && <div className="w-0.5 h-8 mt-1" style={{ background: step.active ? step.color : 'var(--color-surface-3)' }} />}
                    </div>
                    <div className="pt-0">
                      <div className="text-sm font-semibold" style={{ color: step.active ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>{step.status}</div>
                      {step.date && <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{new Date(step.date).toLocaleDateString('he-IL')}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Comments */}
        <div className="px-6 pb-6">
          <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--color-text-primary)' }}>
            <MessageCircle size={16} className="inline ml-1" style={{ color: '#818CF8' }} /> תגובות ועדכונים ({comments.length})
          </h3>
          <div className="space-y-3 mb-4">
            {comments.map((comment: any) => (
              <div key={comment.id} className="glass-card p-3" style={{ borderRight: '3px solid #818CF8' }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'linear-gradient(135deg, #818CF8, #6366F1)', color: 'white' }}>
                    {comment.user ? (comment.user.firstName?.[0] || '') + (comment.user.lastName?.[0] || '') : '🤖'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>{comment.user ? `${comment.user.firstName} ${comment.user.lastName}` : 'מערכת'}</span>
                  </div>
                  <span className="text-xs flex-shrink-0" style={{ color: 'var(--color-text-muted)' }}>{timeAgo(comment.createdAt)}</span>
                </div>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{comment.content}</p>
              </div>
            ))}
            {comments.length === 0 && <p className="text-xs text-center py-4" style={{ color: 'var(--color-text-muted)' }}>אין תגובות עדיין</p>}
          </div>

          {/* New comment */}
          {accessToken ? (
            <div className="flex gap-2">
              <input className="input flex-1 py-2.5" placeholder="הוסיפו תגובה..." value={newComment} onChange={(e) => setNewComment(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddComment()} />
              <button onClick={handleAddComment} disabled={!newComment.trim() || sendingComment} className="p-2.5 rounded-xl" style={{ background: newComment.trim() ? 'linear-gradient(135deg, #6366F1, #4F46E5)' : 'var(--color-surface-2)', color: newComment.trim() ? 'white' : 'var(--color-text-muted)' }}>
                {sendingComment ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
          ) : (
            <Link href={`/${tenant}/auth/login`} className="block text-center text-sm py-3 rounded-xl" style={{ background: 'var(--color-surface-2)', color: '#818CF8', border: '1px solid var(--color-border)' }}>
              התחברו כדי להגיב
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
