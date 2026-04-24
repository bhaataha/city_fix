'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Bell, Cloud, Link2, Loader2, Save, Send } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';

type IntegrationsConfig = {
  alerts: {
    inApp: boolean;
    email: boolean;
    sms: boolean;
    criticalOnly: boolean;
  };
  api: {
    enabled: boolean;
    name: string;
    baseUrl: string;
    apiKey?: string;
    docsUrl?: string;
  };
  webhook: {
    enabled: boolean;
    url: string;
    secret?: string;
    events: string[];
    timeoutMs: number;
    retries: number;
  };
};

const DEFAULTS: IntegrationsConfig = {
  alerts: { inApp: true, email: true, sms: false, criticalOnly: false },
  api: { enabled: false, name: '', baseUrl: '', apiKey: '', docsUrl: '' },
  webhook: {
    enabled: false,
    url: '',
    secret: '',
    events: ['ISSUE_CREATED', 'ISSUE_STATUS_CHANGED'],
    timeoutMs: 5000,
    retries: 1,
  },
};

const EVENT_OPTIONS = [
  'ISSUE_CREATED',
  'ISSUE_STATUS_CHANGED',
  'CLAIM_CREATED',
  'CLAIM_STATUS_CHANGED',
];

export default function IntegrationsAdminPage() {
  const { tenant } = useParams();
  const { accessToken } = useAuthStore();
  const [cfg, setCfg] = useState<IntegrationsConfig>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [deliveries, setDeliveries] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!accessToken) return;
      setLoading(true);
      const res = await api.getIntegrations(String(tenant), accessToken);
      if (res.success && res.data) {
        setCfg({ ...DEFAULTS, ...(res.data as any) });
      }
      const logs = await api.getIntegrationsDeliveries(String(tenant), accessToken, 20);
      if (logs.success) setDeliveries((logs.data as any[]) || []);
      setLoading(false);
    };
    load();
  }, [tenant, accessToken]);

  const save = async () => {
    if (!accessToken) return;
    setSaving(true);
    setMsg(null);
    const res = await api.updateIntegrations(String(tenant), accessToken, cfg);
    setSaving(false);
    setMsg(res.success ? 'ההגדרות נשמרו בהצלחה' : `שגיאה בשמירה: ${res.error}`);
    if (res.success) {
      const logs = await api.getIntegrationsDeliveries(String(tenant), accessToken, 20);
      if (logs.success) setDeliveries((logs.data as any[]) || []);
    }
  };

  const testWebhook = async () => {
    if (!accessToken) return;
    setTesting(true);
    setMsg(null);
    const res = await api.testIntegrationsWebhook(String(tenant), accessToken);
    setTesting(false);
    if (res.success) {
      const d = res.data as any;
      setMsg(d?.ok ? `Webhook תקין (HTTP ${d.status ?? '-'})` : `Webhook נכשל: ${d?.body || d?.reason || 'unknown'}`);
    } else {
      setMsg(`בדיקת Webhook נכשלה: ${res.error}`);
    }
    const logs = await api.getIntegrationsDeliveries(String(tenant), accessToken, 20);
    if (logs.success) setDeliveries((logs.data as any[]) || []);
  };

  const toggleEvent = (eventName: string) => {
    setCfg((prev) => {
      const exists = prev.webhook.events.includes(eventName);
      return {
        ...prev,
        webhook: {
          ...prev.webhook,
          events: exists
            ? prev.webhook.events.filter((e) => e !== eventName)
            : [...prev.webhook.events, eventName],
        },
      };
    });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="glass-card p-5">
        <h1 className="text-lg font-bold mb-1">אינטגרציות והתראות</h1>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          הפעלת התראות עירייה, חיבור API, ו-Webhooks לאירועי דיווחים ותביעות.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass-card p-5 space-y-4">
          <h2 className="font-semibold flex items-center gap-2"><Bell size={16} /> מערכת התראות</h2>
          {[
            ['inApp', 'התראות בתוך המערכת'],
            ['email', 'התראות אימייל'],
            ['sms', 'התראות SMS'],
            ['criticalOnly', 'רק אירועים קריטיים'],
          ].map(([k, label]) => (
            <label key={k} className="flex items-center justify-between">
              <span>{label}</span>
              <input
                type="checkbox"
                checked={(cfg.alerts as any)[k]}
                onChange={(e) => setCfg({ ...cfg, alerts: { ...cfg.alerts, [k]: e.target.checked } })}
              />
            </label>
          ))}
        </div>

        <div className="glass-card p-5 space-y-4">
          <h2 className="font-semibold flex items-center gap-2"><Cloud size={16} /> API חיצוני</h2>
          <label className="flex items-center justify-between">
            <span>הפעל API Integration</span>
            <input
              type="checkbox"
              checked={cfg.api.enabled}
              onChange={(e) => setCfg({ ...cfg, api: { ...cfg.api, enabled: e.target.checked } })}
            />
          </label>
          <input className="input" placeholder="שם מערכת" value={cfg.api.name} onChange={(e) => setCfg({ ...cfg, api: { ...cfg.api, name: e.target.value } })} />
          <input className="input" placeholder="Base URL" value={cfg.api.baseUrl} onChange={(e) => setCfg({ ...cfg, api: { ...cfg.api, baseUrl: e.target.value } })} />
          <input className="input" placeholder="API Key (optional)" value={cfg.api.apiKey || ''} onChange={(e) => setCfg({ ...cfg, api: { ...cfg.api, apiKey: e.target.value } })} />
        </div>
      </div>

      <div className="glass-card p-5 space-y-4">
        <h2 className="font-semibold flex items-center gap-2"><Link2 size={16} /> Webhook</h2>
        <label className="flex items-center justify-between">
          <span>הפעל Webhook</span>
          <input
            type="checkbox"
            checked={cfg.webhook.enabled}
            onChange={(e) => setCfg({ ...cfg, webhook: { ...cfg.webhook, enabled: e.target.checked } })}
          />
        </label>
        <input className="input" placeholder="Webhook URL" value={cfg.webhook.url} onChange={(e) => setCfg({ ...cfg, webhook: { ...cfg.webhook, url: e.target.value } })} />
        <input className="input" placeholder="Webhook Secret (optional)" value={cfg.webhook.secret || ''} onChange={(e) => setCfg({ ...cfg, webhook: { ...cfg.webhook, secret: e.target.value } })} />
        <div className="grid grid-cols-2 gap-2">
          {EVENT_OPTIONS.map((evt) => (
            <label key={evt} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={cfg.webhook.events.includes(evt)} onChange={() => toggleEvent(evt)} />
              {evt}
            </label>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input
            className="input"
            type="number"
            placeholder="timeout ms"
            value={cfg.webhook.timeoutMs}
            onChange={(e) => setCfg({ ...cfg, webhook: { ...cfg.webhook, timeoutMs: Number(e.target.value) || 5000 } })}
          />
          <input
            className="input"
            type="number"
            placeholder="retries"
            value={cfg.webhook.retries}
            onChange={(e) => setCfg({ ...cfg, webhook: { ...cfg.webhook, retries: Number(e.target.value) || 0 } })}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button className="btn-primary" onClick={save} disabled={saving}>
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          שמור אינטגרציות
        </button>
        <button className="btn-secondary" onClick={testWebhook} disabled={testing}>
          {testing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          בדוק Webhook
        </button>
      </div>

      {msg && <div className="glass-card p-3 text-sm">{msg}</div>}

      <div className="glass-card p-5">
        <h2 className="font-semibold mb-3">Webhook Delivery Logs</h2>
        <div className="space-y-2">
          {deliveries.map((d) => {
            const ok = d.action === 'WEBHOOK_DELIVERY_OK';
            return (
              <div
                key={d.id}
                className="rounded-lg p-3 text-xs"
                style={{
                  background: ok ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                  border: `1px solid ${ok ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                }}
              >
                <div className="font-semibold">
                  {ok ? 'SUCCESS' : 'FAILED'} · {d.data?.event || 'UNKNOWN'} · attempt {d.data?.attempt ?? '-'}
                </div>
                <div className="mt-1">status: {d.data?.status ?? '-'} · {new Date(d.createdAt).toLocaleString()}</div>
                <div className="mt-1 break-all">deliveryId: {d.deliveryId}</div>
                <div className="mt-1 break-all">url: {d.data?.url || '-'}</div>
              </div>
            );
          })}
          {!deliveries.length && <div className="text-sm">אין לוגים עדיין.</div>}
        </div>
      </div>
    </div>
  );
}

