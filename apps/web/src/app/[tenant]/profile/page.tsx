'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ChevronRight, User, Mail, Phone, Car, Shield, Camera, Save, Loader2, CheckCircle2, LogOut } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';

export default function ProfilePage() {
  const { tenant } = useParams();
  const router = useRouter();
  const { accessToken, user, logout: storeLogout } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '',
    vehiclePlate: '', vehicleModel: '', vehicleColor: '',
  });

  useEffect(() => {
    if (!accessToken) {
      router.push(`/${tenant}/auth/login`);
      return;
    }
    const loadProfile = async () => {
      const res = await api.getProfile(tenant as string, accessToken);
      if (res.success && res.data) {
        setForm({
          firstName: res.data.firstName || '',
          lastName: res.data.lastName || '',
          phone: res.data.phone || '',
          vehiclePlate: res.data.vehicles?.[0]?.plate || '',
          vehicleModel: res.data.vehicles?.[0]?.model || '',
          vehicleColor: res.data.vehicles?.[0]?.color || '',
        });
      }
    };
    loadProfile();
  }, [tenant, accessToken, router]);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const save = async () => {
    if (!accessToken) return;
    setLoading(true);
    
    const vehicles = form.vehiclePlate ? [{
      plate: form.vehiclePlate,
      model: form.vehicleModel,
      color: form.vehicleColor,
    }] : [];

    const res = await api.updateProfile(tenant as string, {
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone,
      vehicles,
    }, accessToken);

    setLoading(false);
    if (res.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleLogout = () => {
    storeLogout();
    router.push(`/${tenant}/auth/login`);
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface-0)' }}>
      <header className="px-6 py-4 flex items-center gap-3" style={{ background: 'rgba(11,15,26,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--color-border)' }}>
        <Link href={`/${tenant}`} className="p-2 rounded-lg" style={{ background: 'var(--color-surface-2)' }}>
          <ChevronRight size={18} style={{ color: 'var(--color-text-secondary)' }} />
        </Link>
        <User size={20} style={{ color: '#818CF8' }} />
        <h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>הפרופיל שלי</h1>
      </header>

      <div className="max-w-lg mx-auto px-6 py-6 space-y-6">
        {/* Avatar */}
        <div className="flex flex-col items-center animate-slide-up">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-3 relative" style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
            <User size={36} color="white" />
            <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'var(--color-surface-1)', border: '2px solid var(--color-border)', cursor: 'pointer' }}>
              <Camera size={12} style={{ color: '#818CF8' }} />
            </button>
          </div>
          <div className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {form.firstName || 'שם'} {form.lastName || 'משפחה'}
          </div>
          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {user?.role === 'ADMIN' ? 'מנהל מערכת' : 'תושב/ת'}
          </div>
        </div>

        {/* Personal */}
        <section className="animate-slide-up" style={{ animationDelay: '60ms' }}>
          <h2 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
            <User size={14} style={{ color: '#818CF8' }} /> פרטים אישיים
          </h2>
          <div className="glass-card p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>שם פרטי</label>
                <input value={form.firstName} onChange={(e) => set('firstName', e.target.value)} placeholder="ישראל" className="w-full px-3 py-2 rounded-lg bg-transparent outline-none text-sm" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }} />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>שם משפחה</label>
                <input value={form.lastName} onChange={(e) => set('lastName', e.target.value)} placeholder="ישראלי" className="w-full px-3 py-2 rounded-lg bg-transparent outline-none text-sm" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }} />
              </div>
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>טלפון</label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                <Phone size={14} style={{ color: '#818CF8' }} />
                <input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="050-1234567" className="flex-1 bg-transparent outline-none text-sm" style={{ color: 'var(--color-text-primary)' }} />
              </div>
            </div>
          </div>
        </section>

        {/* Vehicle */}
        <section className="animate-slide-up" style={{ animationDelay: '120ms' }}>
          <h2 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
            <Car size={14} style={{ color: '#F59E0B' }} /> פרטי רכב (לתביעות)
          </h2>
          <div className="glass-card p-4 space-y-3">
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>מספר לוחית</label>
              <input value={form.vehiclePlate} onChange={(e) => set('vehiclePlate', e.target.value)} placeholder="12-345-67" className="w-full px-3 py-2 rounded-lg bg-transparent outline-none text-sm" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', direction: 'ltr' }} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>דגם רכב</label>
                <input value={form.vehicleModel} onChange={(e) => set('vehicleModel', e.target.value)} placeholder="טויוטה קורולה" className="w-full px-3 py-2 rounded-lg bg-transparent outline-none text-sm" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }} />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>צבע</label>
                <input value={form.vehicleColor} onChange={(e) => set('vehicleColor', e.target.value)} placeholder="לבן" className="w-full px-3 py-2 rounded-lg bg-transparent outline-none text-sm" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }} />
              </div>
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="space-y-3 animate-slide-up" style={{ animationDelay: '180ms' }}>
          <button onClick={save} disabled={loading} className="btn-primary w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : saved ? <><CheckCircle2 size={16} /> נשמר!</> : <><Save size={16} /> שמור שינויים</>}
          </button>

          <div className="flex gap-3">
            <Link href={`/${tenant}/auth/forgot-password`} className="glass-card flex-1 py-3 text-center text-sm font-semibold flex items-center justify-center gap-2" style={{ color: '#818CF8', textDecoration: 'none' }}>
              <Shield size={14} /> שנה סיסמה
            </Link>
            <button onClick={handleLogout} className="glass-card flex-1 py-3 text-center text-sm font-semibold flex items-center justify-center gap-2" style={{ color: '#EF4444', cursor: 'pointer' }}>
              <LogOut size={14} /> התנתק
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
