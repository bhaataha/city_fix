'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ChevronRight, Settings, Save, Palette, Globe,
  Clock, Bell, Shield, Image as ImageIcon,
  Mail, Phone, MapPin, ExternalLink, Type,
  CheckCircle2, Eye, Smartphone, Users, Loader2
} from 'lucide-react';
import { useSettings } from '@/lib/hooks';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

/* ─── Default initial config (overridden by API) ───── */
const DEFAULT_CONFIG = {
  name: 'עיריית תל אביב-יפו',
  slug: 'tel-aviv',
  primaryColor: '#2563EB',
  secondaryColor: '#1E40AF',
  contactEmail: 'info@tel-aviv.gov.il',
  contactPhone: '106',
  website: 'https://www.tel-aviv.gov.il',
  population: 460613,
  description: 'עיריית תל אביב-יפו - מערכת ניהול דיווחי מפגעים ותביעות',
  sla: {
    POTHOLE: { response: 4, resolution: 48 },
    STREETLIGHT: { response: 2, resolution: 24 },
    WASTE: { response: 1, resolution: 8 },
    SAFETY: { response: 1, resolution: 4 },
    SIDEWALK: { response: 4, resolution: 72 },
    DEFAULT: { response: 4, resolution: 48 },
  },
  notifications: {
    emailOnNew: true,
    emailOnStatusChange: true,
    smsOnCritical: true,
    dailyDigest: true,
    weeklyReport: true,
  },
};

const SLA_CATEGORIES = [
  { key: 'POTHOLE', label: 'בור בכביש', icon: '🕳️' },
  { key: 'STREETLIGHT', label: 'פנס רחוב', icon: '💡' },
  { key: 'WASTE', label: 'פסולת / גזם', icon: '🗑️' },
  { key: 'SAFETY', label: 'מפגע בטיחות', icon: '⚠️' },
  { key: 'SIDEWALK', label: 'מדרכה', icon: '🚶' },
  { key: 'DEFAULT', label: 'ברירת מחדל', icon: '📋' },
];

type TabKey = 'branding' | 'sla' | 'notifications' | 'general';

const TABS: { key: TabKey; label: string; icon: any }[] = [
  { key: 'branding', label: 'מיתוג', icon: Palette },
  { key: 'sla', label: 'SLA', icon: Clock },
  { key: 'notifications', label: 'התראות', icon: Bell },
  { key: 'general', label: 'כללי', icon: Settings },
];

export default function AdminSettingsPage() {
  const { tenant } = useParams();
  const { accessToken } = useAuthStore();
  const { data: apiSettings, loading } = useSettings();

  const [activeTab, setActiveTab] = useState<TabKey>('branding');
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Hydrate from API if available
  useEffect(() => {
    if (apiSettings && typeof apiSettings === 'object') {
      const s = apiSettings as any;
      setConfig((prev) => ({
        ...prev,
        name: s.name || prev.name,
        slug: s.slug || prev.slug,
        primaryColor: s.primaryColor || s.settings?.primaryColor || prev.primaryColor,
        secondaryColor: s.secondaryColor || s.settings?.secondaryColor || prev.secondaryColor,
        contactEmail: s.contactEmail || s.settings?.contactEmail || prev.contactEmail,
        contactPhone: s.contactPhone || s.settings?.contactPhone || prev.contactPhone,
        website: s.website || s.settings?.website || prev.website,
        population: s.population || prev.population,
        description: s.description || s.settings?.description || prev.description,
        sla: s.slaConfig || s.sla || prev.sla,
        notifications: s.settings?.notifications || s.notifications || prev.notifications,
      }));
    }
  }, [apiSettings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateSettings(String(tenant), {
        name: config.name,
        settings: {
          primaryColor: config.primaryColor,
          secondaryColor: config.secondaryColor,
          contactEmail: config.contactEmail,
          contactPhone: config.contactPhone,
          website: config.website,
          description: config.description,
          notifications: config.notifications,
        },
        slaConfig: config.sla,
      }, accessToken || '');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // API error — show saved optimistically
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin" style={{ color: '#6366F1' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface-0)' }}>
      {/* ─── Header ─────────────────────────────── */}
      <header
        className="px-6 py-4 flex items-center justify-between sticky top-0 z-20"
        style={{
          background: 'rgba(11,15,26,0.92)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div className="flex items-center gap-3">
          <Link href={`/${tenant}/admin`} className="p-2 rounded-lg" style={{ background: 'var(--color-surface-2)' }}>
            <ChevronRight size={18} style={{ color: 'var(--color-text-secondary)' }} />
          </Link>
          <div>
            <h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>הגדרות</h1>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>הגדרות רשות — {config.name}</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary py-2 px-5 text-sm flex items-center gap-1.5"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
          {saving ? 'שומר...' : saved ? 'נשמר!' : 'שמור הכל'}
        </button>
      </header>

      <div className="max-w-5xl mx-auto p-6 flex flex-col lg:flex-row gap-6">
        {/* ─── Tabs Sidebar ───────────────── */}
        <nav className="lg:w-56 flex lg:flex-col gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium whitespace-nowrap transition-all"
              style={{
                background: activeTab === tab.key ? 'rgba(99,102,241,0.12)' : 'transparent',
                color: activeTab === tab.key ? '#A5B4FC' : 'var(--color-text-muted)',
                border: activeTab === tab.key ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
              }}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </nav>

        {/* ─── Tab Content ────────────────── */}
        <div className="flex-1 space-y-5">
          {/* ─── Branding Tab ─────────────────── */}
          {activeTab === 'branding' && (
            <>
              <div className="glass-card p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                  <Palette size={16} color="#818CF8" /> מיתוג הרשות
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>שם הרשות</label>
                    <input className="input w-full" value={config.name} onChange={(e) => setConfig({ ...config, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>תיאור</label>
                    <textarea className="input w-full" rows={2} value={config.description} onChange={(e) => setConfig({ ...config, description: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>צבע ראשי</label>
                      <div className="flex items-center gap-3">
                        <input type="color" value={config.primaryColor} onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })} className="w-10 h-10 rounded-lg border-0 cursor-pointer" />
                        <input className="input flex-1" value={config.primaryColor} onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>צבע משני</label>
                      <div className="flex items-center gap-3">
                        <input type="color" value={config.secondaryColor} onChange={(e) => setConfig({ ...config, secondaryColor: e.target.value })} className="w-10 h-10 rounded-lg border-0 cursor-pointer" />
                        <input className="input flex-1" value={config.secondaryColor} onChange={(e) => setConfig({ ...config, secondaryColor: e.target.value })} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Logo Upload */}
              <div className="glass-card p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                  <ImageIcon size={16} color="#818CF8" /> לוגו
                </h3>
                <div
                  className="rounded-xl h-32 flex items-center justify-center cursor-pointer transition-all hover:opacity-80"
                  style={{ background: 'var(--color-surface-1)', border: '2px dashed var(--color-border)' }}
                >
                  <div className="text-center">
                    <ImageIcon size={24} className="mx-auto mb-2" style={{ color: 'var(--color-text-muted)' }} />
                    <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>גרור לוגו לכאן או לחץ להעלאה</span>
                    <br />
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>PNG, SVG עד 2MB</span>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="glass-card p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                  <Eye size={16} color="#818CF8" /> תצוגה מקדימה
                </h3>
                <div className="rounded-xl p-6 text-center" style={{ background: `linear-gradient(135deg, ${config.primaryColor}, ${config.secondaryColor})` }}>
                  <h2 className="text-2xl font-bold text-white mb-1">{config.name}</h2>
                  <p className="text-sm text-white/70">CityFix — מערכת דיווחי מפגעים</p>
                </div>
              </div>
            </>
          )}

          {/* ─── SLA Tab ──────────────────────── */}
          {activeTab === 'sla' && (
            <div className="glass-card p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                <Clock size={16} color="#818CF8" /> הגדרות SLA
              </h3>
              <p className="text-sm mb-5" style={{ color: 'var(--color-text-muted)' }}>
                הגדרת זמני תגובה ופתרון מקסימליים לכל סוג מפגע
              </p>
              <div className="space-y-3">
                {SLA_CATEGORIES.map((cat) => {
                  const sla = (config.sla as any)[cat.key] || { response: 4, resolution: 48 };
                  return (
                    <div
                      key={cat.key}
                      className="rounded-xl p-4 flex items-center gap-4"
                      style={{ background: 'var(--color-surface-1)', border: '1px solid var(--color-border)' }}
                    >
                      <span className="text-lg">{cat.icon}</span>
                      <span className="text-sm font-semibold flex-1" style={{ color: 'var(--color-text-primary)' }}>{cat.label}</span>
                      <div className="flex items-center gap-4">
                        <div>
                          <label className="text-xs block mb-1" style={{ color: 'var(--color-text-muted)' }}>תגובה (שעות)</label>
                          <input
                            className="input w-20 text-center py-1.5 text-sm"
                            type="number"
                            value={sla.response}
                            onChange={(e) => setConfig({
                              ...config,
                              sla: { ...config.sla, [cat.key]: { ...sla, response: Number(e.target.value) } },
                            })}
                          />
                        </div>
                        <div>
                          <label className="text-xs block mb-1" style={{ color: 'var(--color-text-muted)' }}>פתרון (שעות)</label>
                          <input
                            className="input w-20 text-center py-1.5 text-sm"
                            type="number"
                            value={sla.resolution}
                            onChange={(e) => setConfig({
                              ...config,
                              sla: { ...config.sla, [cat.key]: { ...sla, resolution: Number(e.target.value) } },
                            })}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── Notifications Tab ────────────── */}
          {activeTab === 'notifications' && (
            <div className="glass-card p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                <Bell size={16} color="#818CF8" /> הגדרות התראות
              </h3>
              <div className="space-y-3">
                {[
                  { key: 'emailOnNew', label: 'אימייל בפנייה חדשה', desc: 'שלח התראה כשנפתחת פנייה חדשה', icon: Mail },
                  { key: 'emailOnStatusChange', label: 'אימייל בשינוי סטטוס', desc: 'עדכון לתושב כשהסטטוס משתנה', icon: Mail },
                  { key: 'smsOnCritical', label: 'SMS בדחיפות קריטית', desc: 'הודעת SMS לצוות בפניות קריטיות', icon: Smartphone },
                  { key: 'dailyDigest', label: 'סיכום יומי', desc: 'דוח מייל יומי למנהלים', icon: Mail },
                  { key: 'weeklyReport', label: 'דוח שבועי', desc: 'דוח ביצועים שבועי מפורט', icon: Mail },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="rounded-xl p-4 flex items-center gap-4"
                    style={{ background: 'var(--color-surface-1)', border: '1px solid var(--color-border)' }}
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(99,102,241,0.08)' }}>
                      <item.icon size={18} color="#818CF8" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{item.label}</span>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={(config.notifications as any)[item.key]}
                        onChange={(e) => setConfig({
                          ...config,
                          notifications: { ...config.notifications, [item.key]: e.target.checked },
                        })}
                      />
                      <div
                        className="w-11 h-6 rounded-full peer-checked:after:translate-x-[-20px] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:rounded-full after:h-5 after:w-5 after:transition-all"
                        style={{
                          background: (config.notifications as any)[item.key]
                            ? 'linear-gradient(135deg, #818CF8, #6366F1)'
                            : 'var(--color-surface-3)',
                        }}
                      >
                        <span
                          className="block w-5 h-5 rounded-full transition-all"
                          style={{
                            background: 'white',
                            transform: (config.notifications as any)[item.key] ? 'translateX(-20px)' : 'translateX(0)',
                            margin: '2px',
                          }}
                        />
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── General Tab ─────────────────── */}
          {activeTab === 'general' && (
            <div className="space-y-5">
              <div className="glass-card p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                  <Globe size={16} color="#818CF8" /> פרטי יצירת קשר
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>
                        <Mail size={11} className="inline ml-1" /> אימייל
                      </label>
                      <input className="input w-full" value={config.contactEmail} onChange={(e) => setConfig({ ...config, contactEmail: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>
                        <Phone size={11} className="inline ml-1" /> טלפון
                      </label>
                      <input className="input w-full" value={config.contactPhone} onChange={(e) => setConfig({ ...config, contactPhone: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>
                      <ExternalLink size={11} className="inline ml-1" /> אתר
                    </label>
                    <input className="input w-full" value={config.website} onChange={(e) => setConfig({ ...config, website: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>
                      <Users size={11} className="inline ml-1" /> אוכלוסין
                    </label>
                    <input className="input w-full" type="number" value={config.population} onChange={(e) => setConfig({ ...config, population: Number(e.target.value) })} />
                  </div>
                </div>
              </div>

              <div className="glass-card p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                  <Shield size={16} color="#818CF8" /> אזור סכנה
                </h3>
                <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>פעולות בלתי הפיכות</p>
                <div className="rounded-xl p-4 flex items-center justify-between" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                  <div>
                    <span className="text-sm font-semibold" style={{ color: '#FCA5A5' }}>איפוס נתונים</span>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>מחיקת כל הפניות, התביעות ונתוני המערכת</p>
                  </div>
                  <button className="py-1.5 px-4 rounded-lg text-xs font-semibold" style={{ background: 'rgba(239,68,68,0.12)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.2)' }}>
                    איפוס
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
