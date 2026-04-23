'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, User, Mail, Phone, Lock, Palette, ArrowLeft, CheckCircle2, Loader2, ChevronRight } from 'lucide-react';

const COLORS = ['#2563EB','#6366F1','#8B5CF6','#EC4899','#EF4444','#F59E0B','#10B981','#14B8A6','#0EA5E9','#22C55E'];

export default function OnboardPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<any>(null);
  const [form, setForm] = useState({
    municipalityName: '', slug: '', contactEmail: '', contactPhone: '', primaryColor: '#2563EB',
    adminFirstName: '', adminLastName: '', adminEmail: '', adminPassword: '',
  });

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const generateSlug = (name: string) => name.trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\u0590-\u05FF-]/g, '').toLowerCase() || name.trim().replace(/\s+/g, '-').toLowerCase();

  const submit = async () => {
    setLoading(true); setError('');
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4100/api';
      const res = await fetch(`${API}/tenants/onboard`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'שגיאה בהרשמה');
      setSuccess(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--color-surface-0)' }}>
        <div className="glass-card p-8 max-w-md w-full text-center animate-slide-up">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(16,185,129,0.15)' }}>
            <CheckCircle2 size={32} style={{ color: '#10B981' }} />
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>ברוכים הבאים! 🎉</h1>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            העירייה <strong>{success.tenant.name}</strong> נוצרה בהצלחה עם {success.departmentsCreated} מחלקות וקטגוריות ברירת מחדל.
          </p>
          <div className="glass-card p-4 text-sm text-right mb-4 space-y-1" style={{ color: 'var(--color-text-secondary)' }}>
            <div>🔗 כתובת: <strong style={{ color: '#818CF8' }}>/{success.tenant.slug}</strong></div>
            <div>👤 מנהל: {success.admin.firstName} {success.admin.lastName}</div>
            <div>📧 מייל: {success.admin.email}</div>
          </div>
          <Link href={`/${success.tenant.slug}/auth/login`} className="btn-primary block text-center py-3 rounded-xl text-sm font-bold" style={{ textDecoration: 'none' }}>
            התחברו לפאנל הניהול
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface-0)' }}>
      <header className="px-6 py-4 flex items-center gap-3" style={{ background: 'rgba(11,15,26,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--color-border)' }}>
        <Link href="/" className="p-2 rounded-lg" style={{ background: 'var(--color-surface-2)' }}>
          <ChevronRight size={18} style={{ color: 'var(--color-text-secondary)' }} />
        </Link>
        <Building2 size={20} style={{ color: '#818CF8' }} />
        <h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>הרשמת עירייה חדשה</h1>
      </header>
      <div className="max-w-lg mx-auto px-6 py-8">
        {/* Steps indicator */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: step >= s ? 'var(--color-primary)' : 'var(--color-surface-2)', color: step >= s ? 'white' : 'var(--color-text-muted)' }}>
                {s}
              </div>
              <span className="text-xs font-medium" style={{ color: step >= s ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
                {s === 1 ? 'פרטי העירייה' : 'חשבון מנהל'}
              </span>
              {s < 2 && <div className="w-8 h-0.5 rounded" style={{ background: step > 1 ? 'var(--color-primary)' : 'var(--color-border)' }} />}
            </div>
          ))}
        </div>

        {error && (
          <div className="rounded-xl p-3 mb-4 text-sm text-center" style={{ background: 'rgba(239,68,68,0.1)', color: '#F87171', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4 animate-slide-up">
            <h2 className="font-bold text-lg mb-1" style={{ color: 'var(--color-text-primary)' }}>פרטי הרשות המקומית</h2>
            <div className="glass-card p-4 space-y-4">
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--color-text-muted)' }}>שם העירייה *</label>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                  <Building2 size={16} style={{ color: '#818CF8' }} />
                  <input value={form.municipalityName} onChange={(e) => { set('municipalityName', e.target.value); set('slug', generateSlug(e.target.value)); }} placeholder='עיריית ירושלים' className="flex-1 bg-transparent outline-none text-sm" style={{ color: 'var(--color-text-primary)' }} />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--color-text-muted)' }}>כתובת URL (slug) *</label>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>cityfix.co.il/</span>
                  <input value={form.slug} onChange={(e) => set('slug', e.target.value)} placeholder="jerusalem" className="flex-1 bg-transparent outline-none text-sm" style={{ color: 'var(--color-text-primary)', direction: 'ltr' }} />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--color-text-muted)' }}>אימייל קשר *</label>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                  <Mail size={16} style={{ color: '#818CF8' }} />
                  <input value={form.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} type="email" placeholder="info@jerusalem.muni.il" className="flex-1 bg-transparent outline-none text-sm" style={{ color: 'var(--color-text-primary)', direction: 'ltr' }} />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--color-text-muted)' }}>טלפון מוקד</label>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                  <Phone size={16} style={{ color: '#818CF8' }} />
                  <input value={form.contactPhone} onChange={(e) => set('contactPhone', e.target.value)} placeholder="106" className="flex-1 bg-transparent outline-none text-sm" style={{ color: 'var(--color-text-primary)' }} />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--color-text-muted)' }}>צבע מותג</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map((c) => (
                    <button key={c} onClick={() => set('primaryColor', c)} className="w-8 h-8 rounded-lg" style={{ background: c, border: form.primaryColor === c ? '3px solid white' : '2px solid transparent', cursor: 'pointer' }} />
                  ))}
                </div>
              </div>
            </div>
            <button onClick={() => setStep(2)} disabled={!form.municipalityName || !form.slug || !form.contactEmail} className="btn-primary w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2" style={{ opacity: !form.municipalityName || !form.slug || !form.contactEmail ? 0.5 : 1 }}>
              המשך <ArrowLeft size={16} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-slide-up">
            <h2 className="font-bold text-lg mb-1" style={{ color: 'var(--color-text-primary)' }}>חשבון מנהל ראשי</h2>
            <div className="glass-card p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--color-text-muted)' }}>שם פרטי *</label>
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                    <User size={16} style={{ color: '#818CF8' }} />
                    <input value={form.adminFirstName} onChange={(e) => set('adminFirstName', e.target.value)} placeholder="ישראל" className="flex-1 bg-transparent outline-none text-sm" style={{ color: 'var(--color-text-primary)' }} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--color-text-muted)' }}>שם משפחה *</label>
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                    <input value={form.adminLastName} onChange={(e) => set('adminLastName', e.target.value)} placeholder="ישראלי" className="flex-1 bg-transparent outline-none text-sm" style={{ color: 'var(--color-text-primary)' }} />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--color-text-muted)' }}>אימייל מנהל *</label>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                  <Mail size={16} style={{ color: '#818CF8' }} />
                  <input value={form.adminEmail} onChange={(e) => set('adminEmail', e.target.value)} type="email" placeholder="admin@jerusalem.muni.il" className="flex-1 bg-transparent outline-none text-sm" style={{ color: 'var(--color-text-primary)', direction: 'ltr' }} />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--color-text-muted)' }}>סיסמה *</label>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                  <Lock size={16} style={{ color: '#818CF8' }} />
                  <input value={form.adminPassword} onChange={(e) => set('adminPassword', e.target.value)} type="password" placeholder="לפחות 6 תווים" className="flex-1 bg-transparent outline-none text-sm" style={{ color: 'var(--color-text-primary)', direction: 'ltr' }} />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="glass-card flex-1 py-3 text-sm font-semibold text-center" style={{ color: 'var(--color-text-secondary)', cursor: 'pointer' }}>חזרה</button>
              <button onClick={submit} disabled={loading || !form.adminEmail || !form.adminPassword || form.adminPassword.length < 6} className="btn-primary flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2" style={{ opacity: loading || !form.adminEmail || !form.adminPassword ? 0.5 : 1 }}>
                {loading ? <><Loader2 size={16} className="animate-spin" /> יוצר...</> : 'צור עירייה 🚀'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
