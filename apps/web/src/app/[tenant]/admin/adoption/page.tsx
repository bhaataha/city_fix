'use client';

import { useMemo, useState } from 'react';
import { Building2, CheckCircle2, Loader2, MapPin } from 'lucide-react';
import { api } from '@/lib/api';
import { useAdoptionOrphans } from '@/lib/hooks';
import { useAuthStore } from '@/lib/store';

type OrphanIssue = {
  id: string;
  reportNumber: string;
  description: string;
  address?: string | null;
  urgency: string;
};

export default function AdoptionPage() {
  const { accessToken } = useAuthStore();
  const { data, loading, refetch } = useAdoptionOrphans();
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [adopting, setAdopting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const preview = (data as any)?.data ?? (data as any);
  const issues = useMemo(() => (preview?.issues || []) as OrphanIssue[], [preview]);
  const selectedIds = useMemo(
    () => Object.entries(selected).filter(([, v]) => v).map(([k]) => k),
    [selected],
  );

  const toggle = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }));

  const adopt = async (all: boolean) => {
    if (!accessToken) return;
    setAdopting(true);
    setMessage(null);
    const res = await api.adoptOrphans(accessToken, all ? undefined : selectedIds);
    setAdopting(false);
    if (!res.success) {
      setMessage(`שגיאה: ${res.error}`);
      return;
    }
    const adopted = (res.data as any)?.adopted ?? 0;
    setMessage(`אומצו בהצלחה ${adopted} דיווחים.`);
    setSelected({});
    refetch();
  };

  return (
    <div className="p-6 space-y-4">
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-2">
          <Building2 size={18} />
          <h1 className="text-lg font-bold">אימוץ דיווחים ציבוריים</h1>
        </div>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          כאן אפשר לאמץ דיווחים אזרחיים פתוחים שנמצאים בגבולות העיר שלכם.
        </p>
      </div>

      {loading ? (
        <div className="glass-card p-6 flex items-center gap-2">
          <Loader2 className="animate-spin" size={16} />
          טוען...
        </div>
      ) : (
        <>
          <div className="glass-card p-4 flex items-center justify-between">
            <div className="text-sm">
              נמצאו <strong>{preview?.count || 0}</strong> דיווחים לאימוץ
            </div>
            <div className="flex gap-2">
              <button
                className="btn-secondary"
                onClick={() => adopt(false)}
                disabled={adopting || selectedIds.length === 0}
              >
                {adopting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                אמץ מסומנים
              </button>
              <button className="btn-primary" onClick={() => adopt(true)} disabled={adopting || !issues.length}>
                {adopting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                אמץ הכל
              </button>
            </div>
          </div>

          {message && <div className="glass-card p-3 text-sm">{message}</div>}

          <div className="space-y-2">
            {issues.map((issue) => (
              <label key={issue.id} className="glass-card p-4 flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={!!selected[issue.id]} onChange={() => toggle(issue.id)} />
                <div className="flex-1">
                  <div className="font-semibold">{issue.reportNumber}</div>
                  <div className="text-sm mt-1">{issue.description}</div>
                  <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                    <MapPin size={12} className="inline" /> {issue.address || 'ללא כתובת'} · {issue.urgency}
                  </div>
                </div>
              </label>
            ))}
            {!issues.length && <div className="glass-card p-4 text-sm">אין כרגע דיווחים ציבוריים לאימוץ באזור העיר.</div>}
          </div>
        </>
      )}
    </div>
  );
}

