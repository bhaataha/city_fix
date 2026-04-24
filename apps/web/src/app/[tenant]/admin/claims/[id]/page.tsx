'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import {
  ChevronRight, MapPin, Clock, ShieldAlert,
  AlertTriangle, CheckCircle2, User, Building2,
  FileText, Scale, Eye, File, Download,
  ChevronDown, Search, Loader2, DollarSign,
  Briefcase
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'NEW', label: 'חדש', color: '#818CF8' },
  { value: 'AWAITING_DOCUMENTS', label: 'השלמת מסמכים', color: '#FBBF24' },
  { value: 'UNDER_REVIEW', label: 'בבדיקה', color: '#60A5FA' },
  { value: 'ENGINEERING_REVIEW', label: 'בדיקת מהנדס', color: '#F97316' },
  { value: 'LEGAL_REVIEW', label: 'בחינה משפטית', color: '#A78BFA' },
  { value: 'INSURANCE_REVIEW', label: 'בדיקת ביטוח', color: '#EC4899' },
  { value: 'IN_NEGOTIATION', label: 'במשא ומתן', color: '#3B82F6' },
  { value: 'PARTIALLY_APPROVED', label: 'אושר חלקית', color: '#10B981' },
  { value: 'APPROVED', label: 'אושר', color: '#34D399' },
  { value: 'REJECTED', label: 'נדחה', color: '#EF4444' },
  { value: 'CLOSED', label: 'נסגר', color: '#9CA3AF' },
];

const TYPE_LABEL: Record<string, string> = {
  PROPERTY_DAMAGE: 'נזק לרכוש', VEHICLE_DAMAGE: 'נזק לרכב', PERSONAL_INJURY: 'נזק גוף',
  INCOME_LOSS: 'אובדן הכנסה', THIRD_PARTY: 'צד ג\'', INSURANCE_REIMBURSEMENT: 'החזר ביטוח',
};

function formatCurrency(amount: number): string {
  if (amount == null) return '—';
  return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(amount);
}

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  } catch {
    return dateStr;
  }
}

export default function AdminClaimDetailPage() {
  const { tenant, id } = useParams();
  const router = useRouter();
  const { accessToken } = useAuthStore();
  const tenantSlug = tenant as string;
  const claimId = id as string;

  const [claim, setClaim] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Status updates
  const [status, setStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');
  const [approvedAmount, setApprovedAmount] = useState<number | ''>('');

  const fetchClaim = useCallback(async () => {
    const res = await api.getClaim(tenantSlug, claimId, accessToken || '');
    if (res.success && res.data) {
      setClaim(res.data);
      setStatus(res.data.status || 'NEW');
      setApprovedAmount(res.data.approvedAmount || '');
    } else {
      setError('לא ניתן לטעון את התביעה');
    }
  }, [tenantSlug, claimId, accessToken]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      await fetchClaim();
      setLoading(false);
    }
    load();
  }, [fetchClaim]);

  const handleSaveStatus = async () => {
    if (!accessToken) return;
    setSaving(true);
    
    // Optionally update approvedAmount if status is APPROVED or PARTIALLY_APPROVED
    const updateData: any = { status, reason: statusReason || undefined };
    if (status === 'APPROVED' || status === 'PARTIALLY_APPROVED') {
        updateData.approvedAmount = approvedAmount === '' ? null : Number(approvedAmount);
    }

    const res = await api.updateClaimStatus(tenantSlug, claimId, updateData, accessToken);
    if (res.success) {
      await fetchClaim();
      setStatusReason('');
    } else {
      alert(res.error || 'אירעה שגיאה בעת שמירת הסטטוס');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-surface-0)' }}>
        <Loader2 size={32} className="animate-spin" style={{ color: '#818CF8' }} />
      </div>
    );
  }

  if (error || !claim) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-surface-0)' }}>
        <div className="text-center">
          <p className="text-lg mb-4" style={{ color: 'var(--color-text-secondary)' }}>{error || 'תביעה לא נמצאה'}</p>
          <Link href={`/${tenant}/admin/claims`} className="btn-primary px-6 py-2">חזרה לרשימה</Link>
        </div>
      </div>
    );
  }

  const currentStatusObj = STATUS_OPTIONS.find(s => s.value === claim.status) || STATUS_OPTIONS[0];

  return (
    <div className="min-h-screen pb-12" style={{ background: 'var(--color-surface-0)' }}>
      {/* ─── Header ───────────────────────────────── */}
      <header
        className="px-6 py-4 flex items-center justify-between sticky top-0 z-20"
        style={{
          background: 'rgba(11,15,26,0.92)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div className="flex items-center gap-3">
          <Link href={`/${tenant}/admin/claims`} className="p-2 rounded-lg" style={{ background: 'var(--color-surface-2)' }}>
            <ChevronRight size={18} style={{ color: 'var(--color-text-secondary)' }} />
          </Link>
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
              תביעה <span className="font-mono text-[#818CF8]">{claim.claimNumber}</span>
            </h1>
          </div>
          <span className="badge ml-2" style={{ background: `${currentStatusObj.color}15`, color: currentStatusObj.color }}>
            {currentStatusObj.label}
          </span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ─── Main Content ─────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Overview Card */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                <ShieldAlert size={20} style={{ color: '#818CF8' }} />
                פרטי התביעה
              </h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--color-text-muted)' }}>סוג תביעה</label>
                  <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{TYPE_LABEL[claim.claimType] || claim.claimType}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--color-text-muted)' }}>תאריך אירוע</label>
                  <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{formatDate(claim.eventDate)}</p>
                </div>
                {claim.eventAddress && (
                  <div className="col-span-2">
                    <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--color-text-muted)' }}>כתובת אירוע</label>
                    <p className="flex items-center gap-1 font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      <MapPin size={16} style={{ color: 'var(--color-text-muted)' }} /> {claim.eventAddress}
                    </p>
                  </div>
                )}
                {claim.vehiclePlate && (
                  <div>
                    <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--color-text-muted)' }}>מספר רכב</label>
                    <p className="font-medium font-mono" style={{ color: 'var(--color-text-primary)' }}>{claim.vehiclePlate}</p>
                  </div>
                )}
                {claim.policyNumber && (
                  <div>
                    <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--color-text-muted)' }}>מספר פוליסה</label>
                    <p className="font-medium font-mono" style={{ color: 'var(--color-text-primary)' }}>{claim.policyNumber}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold block mb-2" style={{ color: 'var(--color-text-muted)' }}>תיאור האירוע</label>
                <div className="p-4 rounded-xl whitespace-pre-wrap text-sm leading-relaxed" style={{ background: 'var(--color-surface-1)', color: 'var(--color-text-secondary)' }}>
                  {claim.eventDescription}
                </div>
              </div>
            </div>

            {/* Financials */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                <DollarSign size={20} style={{ color: '#34D399' }} />
                פירוט כספי
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl" style={{ background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.2)' }}>
                  <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>סכום נתבע</p>
                  <p className="text-2xl font-bold" style={{ color: '#34D399' }}>{formatCurrency(claim.claimedAmount)}</p>
                </div>
                <div className="p-4 rounded-xl" style={{ background: 'var(--color-surface-1)' }}>
                  <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>סכום שאושר</p>
                  <p className="text-2xl font-bold" style={{ color: claim.approvedAmount ? '#10B981' : 'var(--color-text-muted)' }}>
                    {formatCurrency(claim.approvedAmount)}
                  </p>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                <FileText size={20} style={{ color: '#FBBF24' }} />
                מסמכים מצורפים
              </h2>
              {claim.documents && claim.documents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {claim.documents.map((doc: any) => (
                    <a
                      key={doc.id}
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-3 rounded-xl flex items-center gap-3 transition-colors hover:bg-white/5"
                      style={{ background: 'var(--color-surface-1)', border: '1px solid var(--color-border)' }}
                    >
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(251,191,36,0.1)' }}>
                        <File size={20} style={{ color: '#FBBF24' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>{doc.fileName}</p>
                        <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{doc.type} • {doc.description || 'ללא תיאור'}</p>
                      </div>
                      <Download size={16} style={{ color: 'var(--color-text-muted)' }} />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>לא צורפו מסמכים לתביעה זו.</p>
              )}
            </div>

          </div>

          {/* ─── Sidebar ────────────────────────────── */}
          <div className="space-y-6">
            
            {/* Status Update Card */}
            <div className="glass-card p-6 border-t-4" style={{ borderTopColor: currentStatusObj.color }}>
              <h3 className="font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>עדכון סטטוס התביעה</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--color-text-muted)' }}>סטטוס נוכחי</label>
                  <select
                    className="select w-full"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                
                {(status === 'APPROVED' || status === 'PARTIALLY_APPROVED') && (
                  <div className="animate-fade-in">
                    <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--color-text-muted)' }}>סכום לאישור (₪)</label>
                    <input
                      type="number"
                      className="input w-full"
                      placeholder="הזן סכום..."
                      value={approvedAmount}
                      onChange={(e) => setApprovedAmount(e.target.value ? Number(e.target.value) : '')}
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--color-text-muted)' }}>הערות (יופיע להחלטה)</label>
                  <textarea
                    className="input w-full min-h-[80px]"
                    placeholder="סיבת עדכון הסטטוס או החלטה משפטית..."
                    value={statusReason}
                    onChange={(e) => setStatusReason(e.target.value)}
                  />
                </div>

                <button
                  onClick={handleSaveStatus}
                  disabled={saving || status === claim.status}
                  className="btn-primary w-full py-2.5 flex justify-center items-center gap-2"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                  עדכן סטטוס
                </button>
              </div>
            </div>

            {/* People & Links */}
            <div className="glass-card p-6">
              <h3 className="font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>מעורבים וקישורים</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>פרטי התובע/ת</p>
                  <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--color-surface-1)' }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5">
                      <User size={18} style={{ color: 'var(--color-text-secondary)' }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
                        {claim.claimant?.firstName} {claim.claimant?.lastName}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {claim.claimant?.email} • {claim.claimant?.phone || 'ללא טלפון'}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>גורם מטפל בעירייה</p>
                  <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--color-surface-1)' }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.1)' }}>
                      <Briefcase size={18} style={{ color: '#818CF8' }} />
                    </div>
                    <div>
                      {claim.handler ? (
                        <>
                          <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
                            {claim.handler.firstName} {claim.handler.lastName}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>גורם מטפל</p>
                        </>
                      ) : (
                        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>לא שויך עדיין</p>
                      )}
                    </div>
                  </div>
                </div>

                {claim.relatedIssue && (
                  <div>
                    <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>מקושר לדיווח המוקד</p>
                    <Link
                      href={`/${tenant}/admin/issues/${claim.relatedIssue.id}`}
                      className="flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-white/5 border border-transparent hover:border-white/10"
                      style={{ background: 'var(--color-surface-1)' }}
                    >
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.1)' }}>
                        <Eye size={18} style={{ color: '#60A5FA' }} />
                      </div>
                      <div>
                        <p className="text-sm font-bold" style={{ color: '#60A5FA' }}>
                          דיווח #{claim.relatedIssue.reportNumber}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>צפה בדיווח המקורי</p>
                      </div>
                    </Link>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
