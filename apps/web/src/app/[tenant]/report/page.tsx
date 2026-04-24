'use client';

import { useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  ArrowRight, MapPin, Camera, Upload, AlertTriangle,
  CheckCircle2, ChevronLeft, X, Loader2, Send, Info
} from 'lucide-react';
import { DEFAULT_CATEGORIES, URGENCY_LABELS } from '@cityfix/shared';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center" style={{ height: 280, background: 'var(--color-surface-1)' }}>
      <Loader2 size={24} className="animate-spin" style={{ color: '#6366F1' }} />
    </div>
  ),
});

type Step = 'category' | 'location' | 'details' | 'review';

export default function ReportPage() {
  const { tenant } = useParams();
  const router = useRouter();

  const [step, setStep] = useState<Step>('category');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState('NORMAL');
  const [isDanger, setIsDanger] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [address, setAddress] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [pickerPin, setPickerPin] = useState<{ lat: number; lng: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { accessToken } = useAuthStore();
  const [reportNumber, setReportNumber] = useState<string | null>(null);

  const steps: { key: Step; label: string }[] = [
    { key: 'category', label: 'סוג מפגע' },
    { key: 'location', label: 'מיקום' },
    { key: 'details', label: 'פרטים' },
    { key: 'review', label: 'סיכום' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === step);
  const category = DEFAULT_CATEGORIES.find((c) => c.name === selectedCategory);

  const handleSubmit = async () => {
    if (!category) return;
    setSubmitting(true);
    
    // Parse coordinates from picker or use generic center if empty
    const lat = pickerPin?.lat || 32.0853;
    const lng = pickerPin?.lng || 34.7818;

    const payload = {
      categoryId: selectedCategory || category.name,
      description,
      address,
      latitude: lat,
      longitude: lng,
      urgency,
      isImmediateDanger: isDanger,
      isAnonymous,
    };

    try {
      // @ts-ignore
      const res = await api.createIssue(tenant as string, payload, accessToken || undefined);
      
      if (res.success) {
        setReportNumber(res.data?.issue?.reportNumber || 'CF-XXXX-XXXXX');
        setSubmitted(true);
      } else {
        alert(`שגיאה ביצירת הפנייה: ${res.error}`);
      }
    } catch (e) {
      alert('שגיאת תקשורת');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--color-surface-0)' }}>
        <div className="text-center animate-slide-up max-w-md">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(16,185,129,0.12)' }}
          >
            <CheckCircle2 size={40} color="#10B981" />
          </div>
          <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
            הדיווח נשלח בהצלחה! 🎉
          </h1>
          <p className="mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            מספר הפנייה שלך:
          </p>
          <div
            className="text-2xl font-bold mb-6 py-3 px-6 rounded-xl inline-block"
            style={{ background: 'var(--color-surface-2)', color: '#818CF8' }}
          >
            {reportNumber}
          </div>
          <p className="text-sm mb-8" style={{ color: 'var(--color-text-muted)' }}>
            נעדכן אותך בכל שינוי סטטוס דרך הודעה באפליקציה
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href={`/${tenant}`} className="btn-secondary">
              חזרה לדף הבית
            </Link>
            <Link href={`/${tenant}/my-reports`} className="btn-primary">
              הפניות שלי
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface-0)', overflowX: 'hidden' }}>
      {/* ─── Header ─────────────────────────────── */}
      <header
        className="px-4 sm:px-6 py-3 flex items-center gap-3"
        style={{
          background: 'rgba(11, 15, 26, 0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <button
          onClick={() => {
            if (currentStepIndex > 0) {
              setStep(steps[currentStepIndex - 1].key);
            } else {
              router.push(`/${tenant}`);
            }
          }}
          className="p-2 rounded-lg"
          style={{ background: 'var(--color-surface-2)' }}
        >
          <ArrowRight size={18} style={{ color: 'var(--color-text-secondary)' }} />
        </button>
        <h1 className="font-bold" style={{ color: 'var(--color-text-primary)' }}>
          דיווח מפגע
        </h1>
      </header>

      {/* ─── Progress Bar ───────────────────────── */}
      <div className="px-4 sm:px-6 py-3">
        <div className="flex items-center gap-2 mb-2">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2 flex-1">
              <div
                className="h-1.5 rounded-full flex-1 transition-all"
                style={{
                  background: i <= currentStepIndex
                    ? 'linear-gradient(90deg, #6366F1, #818CF8)'
                    : 'var(--color-surface-2)',
                }}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between">
          {steps.map((s, i) => (
            <span
              key={s.key}
              className="text-xs"
              style={{ color: i <= currentStepIndex ? '#A5B4FC' : 'var(--color-text-muted)' }}
            >
              {s.label}
            </span>
          ))}
        </div>
      </div>

      {/* ─── Step: Category ─────────────────────── */}
      {step === 'category' && (
        <div className="px-4 sm:px-6 pb-8 animate-fade-in">
          <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
            מה סוג המפגע?
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
            בחרו את הקטגוריה המתאימה ביותר
          </p>

          <div className="grid grid-cols-2 gap-3">
            {DEFAULT_CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                onClick={() => {
                  setSelectedCategory(cat.name);
                  setStep('location');
                }}
                className="glass-card p-4 text-right flex items-start gap-3 transition-all"
                style={{
                  borderColor: selectedCategory === cat.name ? `${cat.color}80` : undefined,
                  background: selectedCategory === cat.name ? `${cat.color}08` : undefined,
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${cat.color}18` }}
                >
                  <MapPin size={18} color={cat.color} />
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {cat.name}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                    {cat.nameEn}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── Step: Location ─────────────────────── */}
      {step === 'location' && (
        <div className="px-4 sm:px-6 pb-8 animate-fade-in">
          <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
            איפה המפגע?
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
            סמנו על המפה או הזינו כתובת
          </p>

          {/* Interactive Map Picker */}
          <div
            className="rounded-xl overflow-hidden mb-4 relative"
            style={{
              height: 280,
              border: '1px solid var(--color-border)',
            }}
          >
            <MapView
              showControls={true}
              pickerPin={pickerPin}
              onMapClick={(lngLat) => {
                setPickerPin({ lat: lngLat.lat, lng: lngLat.lng });
                setAddress(`${lngLat.lat.toFixed(5)}, ${lngLat.lng.toFixed(5)}`);
              }}
            />
            {!pickerPin && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-2">
                  <MapPin size={16} style={{ color: '#818CF8' }} />
                  <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>לחצו לסימון מיקום</span>
                </div>
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              כתובת
            </label>
            <input
              type="text"
              className="input"
              placeholder="לדוגמה: רחוב הרצל 42, תל אביב"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <button
            onClick={() => setStep('details')}
            className="btn-primary w-full justify-center py-3"
          >
            המשך
            <ChevronLeft size={16} />
          </button>
        </div>
      )}

      {/* ─── Step: Details ──────────────────────── */}
      {step === 'details' && (
        <div className="px-4 sm:px-6 pb-8 animate-fade-in">
          <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
            פרטים נוספים
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
            ככל שתספקו יותר מידע, כך הטיפול יהיה מהיר יותר
          </p>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              תיאור המפגע *
            </label>
            <textarea
              className="textarea"
              placeholder="תארו את המפגע, גודלו, מיקומו המדויק..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          {/* Photos */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              צילומים
            </label>
            <div className="flex gap-3">
              <button
                className="flex-1 py-8 rounded-xl border-2 border-dashed flex flex-col items-center gap-2 transition-all hover:border-[#6366F1]"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-1)' }}
              >
                <Camera size={24} style={{ color: 'var(--color-text-muted)' }} />
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>צלם</span>
              </button>
              <button
                className="flex-1 py-8 rounded-xl border-2 border-dashed flex flex-col items-center gap-2 transition-all hover:border-[#6366F1]"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-1)' }}
              >
                <Upload size={24} style={{ color: 'var(--color-text-muted)' }} />
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>העלה תמונה</span>
              </button>
            </div>
          </div>

          {/* Urgency */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              רמת דחיפות
            </label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(URGENCY_LABELS).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setUrgency(key)}
                  className="py-2 px-3 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: urgency === key ? `${val.color}20` : 'var(--color-surface-2)',
                    color: urgency === key ? val.color : 'var(--color-text-muted)',
                    border: `1px solid ${urgency === key ? `${val.color}40` : 'transparent'}`,
                  }}
                >
                  {val.he}
                </button>
              ))}
            </div>
          </div>

          {/* Danger Toggle */}
          <div className="mb-4">
            <button
              onClick={() => setIsDanger(!isDanger)}
              className="w-full flex items-center gap-3 p-4 rounded-xl transition-all"
              style={{
                background: isDanger ? 'rgba(239,68,68,0.08)' : 'var(--color-surface-1)',
                border: `1px solid ${isDanger ? 'rgba(239,68,68,0.3)' : 'var(--color-border)'}`,
              }}
            >
              <AlertTriangle size={20} color={isDanger ? '#EF4444' : 'var(--color-text-muted)'} />
              <div className="flex-1 text-right">
                <div className="text-sm font-medium" style={{ color: isDanger ? '#FCA5A5' : 'var(--color-text-primary)' }}>
                  סכנה מיידית
                </div>
                <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  מסכן חיי אדם או רכוש
                </div>
              </div>
              <div
                className="w-10 h-6 rounded-full relative transition-all"
                style={{ background: isDanger ? '#EF4444' : 'var(--color-surface-3)' }}
              >
                <div
                  className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                  style={{ right: isDanger ? 'auto' : '2px', left: isDanger ? '2px' : 'auto' }}
                />
              </div>
            </button>
          </div>

          {/* Anonymous */}
          <div className="mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                דיווח אנונימי
              </span>
            </label>
          </div>

          <button
            onClick={() => setStep('review')}
            className="btn-primary w-full justify-center py-3"
            disabled={!description.trim()}
          >
            המשך לסיכום
            <ChevronLeft size={16} />
          </button>
        </div>
      )}

      {/* ─── Step: Review ───────────────────────── */}
      {step === 'review' && (
        <div className="px-4 sm:px-6 pb-8 animate-fade-in">
          <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
            סיכום הדיווח
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
            בדקו את הפרטים ושלחו
          </p>

          <div className="space-y-3 mb-8">
            <div className="glass-card p-4">
              <div className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>סוג מפגע</div>
              <div className="flex items-center gap-2">
                {category && (
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center"
                    style={{ background: `${category.color}18` }}
                  >
                    <MapPin size={12} color={category.color} />
                  </div>
                )}
                <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  {selectedCategory}
                </span>
              </div>
            </div>

            <div className="glass-card p-4">
              <div className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>מיקום</div>
              <div className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {address || 'סומן על המפה'}
              </div>
            </div>

            <div className="glass-card p-4">
              <div className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>תיאור</div>
              <div className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                {description}
              </div>
            </div>

            <div className="glass-card p-4 flex items-center justify-between">
              <div>
                <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>דחיפות</div>
                <div
                  className="font-semibold text-sm"
                  style={{ color: URGENCY_LABELS[urgency]?.color }}
                >
                  {URGENCY_LABELS[urgency]?.he}
                </div>
              </div>
              {isDanger && (
                <div className="badge badge-critical">
                  <AlertTriangle size={12} />
                  סכנה מיידית
                </div>
              )}
            </div>
          </div>

          <div
            className="rounded-xl p-3 mb-6 flex items-start gap-2"
            style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}
          >
            <Info size={16} className="mt-0.5 flex-shrink-0" style={{ color: '#818CF8' }} />
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              הדיווח ינותב אוטומטית למחלקה האחראית. תקבלו עדכונים בכל שינוי סטטוס.
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary w-full justify-center py-3 text-base"
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                שולח...
              </>
            ) : (
              <>
                <Send size={18} />
                שלח דיווח
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
