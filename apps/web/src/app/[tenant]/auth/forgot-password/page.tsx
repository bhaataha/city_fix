'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronRight, Mail, Lock, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
  const { tenant } = useParams();
  const [step, setStep] = useState<'email' | 'reset' | 'done'>('email');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4100/api';

  const sendReset = async () => {
    setLoading(true); setError('');
    try {
      const res = await api.forgotPassword(tenant as string, email);
      if (!res.success) throw new Error(res.error || 'שגיאה בשליחת קישור');
      setMessage(res.meta?.message || res.data?.message || 'נשלח קישור לאיפוס');
      setStep('reset');
    } catch (err: any) { setError(err.message || 'שגיאת רשת'); }
    finally { setLoading(false); }
  };

  const resetPassword = async () => {
    setLoading(true); setError('');
    try {
      const res = await api.resetPassword(tenant as string, { token, password });
      if (!res.success) throw new Error(res.error || 'שגיאה באיפוס סיסמה');
      setStep('done');
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--color-surface-0)' }}>
      <div className="glass-card p-6 max-w-sm w-full animate-slide-up">
        <Link href={`/${tenant}/auth/login`} className="flex items-center gap-1 text-xs mb-4" style={{ color: '#818CF8' }}>
          <ChevronRight size={14} /> חזרה להתחברות
        </Link>

        {step === 'email' && (
          <>
            <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>שכחתי סיסמה</h1>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>הזינו את כתובת המייל ונשלח קוד איפוס</p>
            {error && <div className="rounded-lg p-2 mb-3 text-xs text-center" style={{ background: 'rgba(239,68,68,0.1)', color: '#F87171' }}>{error}</div>}
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-4" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
              <Mail size={16} style={{ color: '#818CF8' }} />
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="your@email.com" className="flex-1 bg-transparent outline-none text-sm" style={{ color: 'var(--color-text-primary)', direction: 'ltr' }} />
            </div>
            <button onClick={sendReset} disabled={loading || !email} className="btn-primary w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'שלח קישור'}
            </button>
          </>
        )}

        {step === 'reset' && (
          <>
            <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>איפוס סיסמה</h1>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>{message}</p>
            {error && <div className="rounded-lg p-2 mb-3 text-xs text-center" style={{ background: 'rgba(239,68,68,0.1)', color: '#F87171' }}>{error}</div>}
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                <Mail size={16} style={{ color: '#818CF8' }} />
                <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="קוד איפוס" className="flex-1 bg-transparent outline-none text-sm" style={{ color: 'var(--color-text-primary)', direction: 'ltr' }} />
              </div>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                <Lock size={16} style={{ color: '#818CF8' }} />
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="סיסמה חדשה" className="flex-1 bg-transparent outline-none text-sm" style={{ color: 'var(--color-text-primary)', direction: 'ltr' }} />
              </div>
            </div>
            <button onClick={resetPassword} disabled={loading || !token || password.length < 6} className="btn-primary w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'עדכן סיסמה'}
            </button>
          </>
        )}

        {step === 'done' && (
          <div className="text-center py-4">
            <CheckCircle2 size={48} className="mx-auto mb-3" style={{ color: '#10B981' }} />
            <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>הסיסמה עודכנה!</h1>
            <Link href={`/${tenant}/auth/login`} className="btn-primary inline-block px-6 py-2.5 rounded-xl text-sm font-bold" style={{ textDecoration: 'none' }}>
              התחברו עכשיו
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
