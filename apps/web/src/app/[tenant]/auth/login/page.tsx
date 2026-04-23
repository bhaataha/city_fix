'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Mail, Lock, Eye, EyeOff, MapPin, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';

export default function LoginPage() {
  const { tenant } = useParams();
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await api.login(String(tenant), { email, password });
      if (result.success && result.data) {
        setAuth(result.data.user, result.data.accessToken, result.data.refreshToken, String(tenant));
        // Redirect admin users to dashboard, others to home
        const isAdmin = ['ADMIN', 'DEPT_MANAGER', 'CALL_CENTER'].includes(result.data.user.role);
        router.push(`/${tenant}${isAdmin ? '/admin' : ''}`);
      } else {
        setError(result.error || 'שם משתמש או סיסמה שגויים');
      }
    } catch {
      setError('שגיאת חיבור לשרת');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: 'var(--color-surface-0)' }}
    >
      {/* Background glow */}
      <div
        className="fixed top-20 right-1/3 w-[500px] h-[500px] rounded-full blur-3xl opacity-10"
        style={{ background: '#6366F1' }}
      />

      <div className="w-full max-w-sm animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)' }}
          >
            <MapPin size={26} color="white" />
          </div>
          <h1 className="text-2xl font-bold gradient-text">CityFix</h1>
          <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>
            התחברו לחשבון שלכם
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div
              className="p-3 rounded-lg text-sm text-center"
              style={{ background: 'rgba(239,68,68,0.08)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.15)' }}
            >
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
              אימייל
            </label>
            <div className="relative">
              <input
                type="email"
                className="input pr-10"
                placeholder="mail@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                dir="ltr"
              />
              <Mail
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--color-text-muted)' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
              סיסמה
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                className="input pr-10 pl-10"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                dir="ltr"
              />
              <Lock
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--color-text-muted)' }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute left-3 top-1/2 -translate-y-1/2"
              >
                {showPass ? (
                  <EyeOff size={16} style={{ color: 'var(--color-text-muted)' }} />
                ) : (
                  <Eye size={16} style={{ color: 'var(--color-text-muted)' }} />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded" />
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                זכור אותי
              </span>
            </label>
            <Link
              href={`/${tenant}/auth/forgot`}
              className="text-xs"
              style={{ color: '#818CF8' }}
            >
              שכחתי סיסמה
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center py-3"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                מתחבר...
              </>
            ) : (
              'התחבר'
            )}
          </button>
        </form>

        <p className="text-center mt-6 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          אין לך חשבון?{' '}
          <Link href={`/${tenant}/auth/register`} style={{ color: '#818CF8' }}>
            הירשם
          </Link>
        </p>

        <Link
          href={`/${tenant}`}
          className="flex items-center justify-center gap-1 mt-4 text-xs"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <ArrowRight size={12} />
          חזרה לדף הבית
        </Link>
      </div>
    </div>
  );
}
