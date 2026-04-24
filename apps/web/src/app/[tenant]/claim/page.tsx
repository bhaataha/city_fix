'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronRight, Car, Home, UserRound, Briefcase,
  Shield, FileText, Upload, Calendar, MapPin,
  ChevronLeft, Check, AlertTriangle, X, Loader2
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

const CLAIM_TYPES = [
  { value: 'VEHICLE_DAMAGE', label: 'נזק לרכב', icon: Car, desc: 'בור / מכשול בכביש', color: '#6366F1' },
  { value: 'PROPERTY_DAMAGE', label: 'נזק לרכוש', icon: Home, desc: 'נזילה, שיטפון, עצים', color: '#F59E0B' },
  { value: 'PERSONAL_INJURY', label: 'פגיעה גופנית', icon: UserRound, desc: 'מדרכה, מפגע בטיחות', color: '#EF4444' },
  { value: 'INCOME_LOSS', label: 'הפסד הכנסה', icon: Briefcase, desc: 'עקב נזק תשתית', color: '#8B5CF6' },
  { value: 'THIRD_PARTY', label: 'צד ג\'', icon: Shield, desc: 'נזק מקבלן / גורם עירוני', color: '#0EA5E9' },
];

const STEPS = ['סוג תביעה', 'פרטי אירוע', 'מסמכים', 'סיכום'];

export default function ClaimPage() {
  const { tenant } = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    claimType: '',
    eventDate: '',
    eventDescription: '',
    eventAddress: '',
    vehiclePlate: '',
    claimedAmount: '',
    policyNumber: '',
    witnessInfo: '',
  });

  const update = (key: string, value: string) => setForm({ ...form, [key]: value });

  const selectedType = CLAIM_TYPES.find((t) => t.value === form.claimType);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/${tenant}/auth?redirect=/${tenant}/claim`);
    }
  }, [isAuthenticated, router, tenant]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface-0)', overflowX: 'hidden' }}>
      {/* Header */}
      <header
        className="px-4 sm:px-6 py-3 flex items-center gap-3"
        style={{
          background: 'rgba(11,15,26,0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <Link
          href={`/${tenant}`}
          className="p-2 rounded-lg"
          style={{ background: 'var(--color-surface-2)' }}
        >
          <ChevronRight size={18} style={{ color: 'var(--color-text-secondary)' }} />
        </Link>
        <h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
          הגשת תביעה
        </h1>
      </header>

      {/* Progress Bar */}
      <div className="px-4 sm:px-6 py-3">
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      background: i <= step
                        ? 'linear-gradient(135deg, #6366F1, #4F46E5)'
                        : 'var(--color-surface-3)',
                      color: i <= step ? 'white' : 'var(--color-text-muted)',
                    }}
                  >
                    {i < step ? <Check size={11} /> : i + 1}
                  </div>
                  <span
                    className="text-xs font-medium hidden sm:block"
                    style={{ color: i <= step ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}
                  >
                    {s}
                  </span>
                </div>
                <div
                  className="h-1 rounded-full"
                  style={{
                    background: i < step ? '#6366F1' : i === step ? 'rgba(99,102,241,0.3)' : 'var(--color-surface-3)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-8">
        {/* ─── Step 0: Claim Type ──────────────────── */}
        {step === 0 && (
          <div className="animate-fade-in">
            <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
              בחרו סוג תביעה
            </h2>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
              בחרו את סוג הנזק שנגרם לכם
            </p>
            <div className="space-y-2">
              {CLAIM_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => { update('claimType', type.value); setStep(1); }}
                  className="w-full glass-card p-4 flex items-center gap-4 text-right transition-all"
                  style={{
                    borderColor: form.claimType === type.value ? type.color : undefined,
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${type.color}15` }}
                  >
                    <type.icon size={22} color={type.color} />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                      {type.label}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {type.desc}
                    </div>
                  </div>
                  <ChevronLeft size={16} style={{ color: 'var(--color-text-muted)' }} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── Step 1: Event Details ──────────────── */}
        {step === 1 && (
          <div className="animate-fade-in space-y-4">
            <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
              פרטי האירוע
            </h2>

            <div>
              <label className="text-sm font-semibold mb-1 block" style={{ color: 'var(--color-text-secondary)' }}>
                תאריך האירוע *
              </label>
              <input
                type="date"
                className="input"
                value={form.eventDate}
                onChange={(e) => update('eventDate', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-semibold mb-1 block" style={{ color: 'var(--color-text-secondary)' }}>
                כתובת האירוע *
              </label>
              <div className="relative">
                <input
                  className="input pr-9"
                  placeholder="לדוגמה: רחוב הרצל 42, תל אביב"
                  value={form.eventAddress}
                  onChange={(e) => update('eventAddress', e.target.value)}
                />
                <MapPin
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--color-text-muted)' }}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold mb-1 block" style={{ color: 'var(--color-text-secondary)' }}>
                תיאור האירוע *
              </label>
              <textarea
                className="textarea"
                rows={4}
                placeholder="תארו בפירוט את מה שקרה, את הנזק שנגרם, ואת הנסיבות..."
                value={form.eventDescription}
                onChange={(e) => update('eventDescription', e.target.value)}
              />
            </div>

            {form.claimType === 'VEHICLE_DAMAGE' && (
              <div>
                <label className="text-sm font-semibold mb-1 block" style={{ color: 'var(--color-text-secondary)' }}>
                  מספר רכב
                </label>
                <input
                  className="input"
                  placeholder="12-345-67"
                  value={form.vehiclePlate}
                  onChange={(e) => update('vehiclePlate', e.target.value)}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold mb-1 block" style={{ color: 'var(--color-text-secondary)' }}>
                  סכום תביעה (₪)
                </label>
                <input
                  type="number"
                  className="input"
                  placeholder="0"
                  value={form.claimedAmount}
                  onChange={(e) => update('claimedAmount', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block" style={{ color: 'var(--color-text-secondary)' }}>
                  מספר פוליסה
                </label>
                <input
                  className="input"
                  placeholder="אופציונלי"
                  value={form.policyNumber}
                  onChange={(e) => update('policyNumber', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold mb-1 block" style={{ color: 'var(--color-text-secondary)' }}>
                פרטי עדים
              </label>
              <input
                className="input"
                placeholder="שם ונייד של עד (אופציונלי)"
                value={form.witnessInfo}
                onChange={(e) => update('witnessInfo', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* ─── Step 2: Documents ──────────────────── */}
        {step === 2 && (
          <div className="animate-fade-in space-y-4">
            <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
              מסמכים ותמונות
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              צרפו תמונות של הנזק, קבלות, דו״ח שמאי וכד\'
            </p>

            {/* Upload area */}
            <div
              className="rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all hover:border-[#818CF8]"
              style={{
                border: '2px dashed var(--color-border)',
                background: 'var(--color-surface-1)',
              }}
            >
              <Upload size={32} className="mb-3" style={{ color: 'var(--color-text-muted)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                לחצו להעלאת קבצים
              </span>
              <span className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                תמונות, PDF, עד 10MB לקובץ
              </span>
            </div>

            <div className="glass-card p-3">
              <div className="text-xs font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                מסמכים מומלצים:
              </div>
              <ul className="space-y-1">
                {[
                  'תמונות של הנזק (חובה)',
                  'קבלות תיקון / הצעות מחיר',
                  'דו״ח שמאי (אם קיים)',
                  'תמונת מפגע (אם רלוונטי)',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#818CF8' }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* ─── Step 3: Summary ────────────────────── */}
        {step === 3 && (
          <div className="animate-fade-in space-y-4">
            <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
              סיכום התביעה
            </h2>

            <div className="glass-card p-4 space-y-3">
              {[
                { label: 'סוג תביעה', value: selectedType?.label || '' },
                { label: 'תאריך אירוע', value: form.eventDate },
                { label: 'כתובת', value: form.eventAddress },
                { label: 'תיאור', value: form.eventDescription },
                ...(form.vehiclePlate ? [{ label: 'מספר רכב', value: form.vehiclePlate }] : []),
                ...(form.claimedAmount ? [{ label: 'סכום תביעה', value: `₪${Number(form.claimedAmount).toLocaleString()}` }] : []),
              ].map((item) => (
                <div key={item.label} style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
                  <div className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                    {item.label}
                  </div>
                  <div className="text-sm mt-0.5" style={{ color: 'var(--color-text-primary)' }}>
                    {item.value || '—'}
                  </div>
                </div>
              ))}
            </div>

            <div
              className="rounded-xl p-3 flex items-start gap-2"
              style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}
            >
              <AlertTriangle size={16} color="#F59E0B" className="mt-0.5 flex-shrink-0" />
              <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                בלחיצה על "הגש תביעה" אתם מאשרים שהפרטים נכונים ומדויקים. תביעות שקריות עלולות לגרור השלכות משפטיות.
              </span>
            </div>
          </div>
        )}

        {/* ─── Navigation Buttons ─────────────────── */}
        {step > 0 && (
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setStep(step - 1)}
              className="btn-secondary flex-1 justify-center"
            >
              <ChevronRight size={16} />
              חזרה
            </button>

            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="btn-primary flex-1 justify-center"
              >
                המשך
                <ChevronLeft size={16} />
              </button>
            ) : (
              <button
                onClick={async () => {
                  try {
                    setIsSubmitting(true);
                    await api.createClaim(tenant as string, {
                      claimType: form.claimType,
                      eventDate: new Date(form.eventDate).toISOString(),
                      eventDescription: form.witnessInfo 
                        ? `${form.eventDescription}\n\nעדים:\n${form.witnessInfo}`
                        : form.eventDescription,
                      eventAddress: form.eventAddress,
                      vehiclePlate: form.vehiclePlate,
                      claimedAmount: form.claimedAmount ? Number(form.claimedAmount) : undefined,
                      policyNumber: form.policyNumber,
                    }, useAuthStore.getState().accessToken as string);
                    router.push(`/${tenant}/my-claims`);
                  } catch (error) {
                    console.error('Failed to submit claim:', error);
                    alert('אירעה שגיאה בהגשת התביעה. אנא נסו שוב.');
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                disabled={isSubmitting}
                className="btn-primary flex-1 justify-center relative"
                style={{ opacity: isSubmitting ? 0.7 : 1 }}
              >
                {isSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <FileText size={16} />
                    הגש תביעה
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
