'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Mail, Lock, User, Phone, MapPin, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';

export default function RegisterPage() {
  const { tenant } = useParams();
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '',
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await api.register(String(tenant), form);
      if (result.success && result.data) {
        setAuth(result.data.user, result.data.accessToken, result.data.refreshToken, String(tenant));
        router.push(`/${tenant}`);
      } else {
        setError(result.error || 'שגיאה ביצירת החשבון');
      }
    } catch {
      setError('שגיאת חיבור לשרת');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 py-12"
      style={{ background: 'var(--color-surface-0)' }}
    >
      <div
        className="fixed bottom-20 left-1/4 w-[400px] h-[400px] rounded-full blur-3xl opacity-8"
        style={{ background: '#10B981' }}
      />

      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
          >
            <MapPin size={26} color="white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            הצטרפו ל-<span className="gradient-text">CityFix</span>
          </h1>
          <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>
            צרו חשבון ודווחו על מפגעים בקלות
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {error && (
            <div
              className="p-3 rounded-lg text-sm text-center"
              style={{ background: 'rgba(239,68,68,0.08)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.15)' }}
            >
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                שם פרטי
              </label>
              <div className="relative">
                <input
                  className="input pr-9"
                  placeholder="ישראל"
                  value={form.firstName}
                  onChange={(e) => updateField('firstName', e.target.value)}
                  required
                />
                <User size={14} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                שם משפחה
              </label>
              <input
                className="input"
                placeholder="ישראלי"
                value={form.lastName}
                onChange={(e) => updateField('lastName', e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
              אימייל
            </label>
            <div className="relative">
              <input
                type="email"
                className="input pr-9"
                placeholder="mail@example.com"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                required
                dir="ltr"
              />
              <Mail size={14} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
              טלפון
            </label>
            <div className="relative">
              <input
                type="tel"
                className="input pr-9"
                placeholder="050-1234567"
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                dir="ltr"
              />
              <Phone size={14} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
              סיסמה
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                className="input pr-9 pl-9"
                placeholder="לפחות 6 תווים"
                value={form.password}
                onChange={(e) => updateField('password', e.target.value)}
                required
                minLength={6}
                dir="ltr"
              />
              <Lock size={14} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute left-3 top-1/2 -translate-y-1/2"
              >
                {showPass ? (
                  <EyeOff size={14} style={{ color: 'var(--color-text-muted)' }} />
                ) : (
                  <Eye size={14} style={{ color: 'var(--color-text-muted)' }} />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center py-3"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                נרשם...
              </>
            ) : (
              'צרו חשבון'
            )}
          </button>
        </form>

        <p className="text-center mt-6 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          כבר יש לך חשבון?{' '}
          <Link href={`/${tenant}/auth/login`} style={{ color: '#818CF8' }}>
            התחבר
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
