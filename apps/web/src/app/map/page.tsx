'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Bell, MapPin, ThumbsUp } from 'lucide-react';
import { api } from '@/lib/api';
import { usePublicIssues } from '@/lib/hooks';
import { useAuthStore } from '@/lib/store';

type PublicIssue = {
  id: string;
  reportNumber: string;
  description: string;
  address?: string | null;
  isOrphaned: boolean;
  upvoteCount: number;
  followerCount: number;
  tenant: { name: string; slug: string; isClaimed: boolean };
};

export default function PublicMapPage() {
  const { accessToken } = useAuthStore();
  const { data, loading, refetch } = usePublicIssues({ perPage: '100' });
  const [busyId, setBusyId] = useState<string | null>(null);

  const issues = useMemo(() => ((data as any)?.issues || []) as PublicIssue[], [data]);

  const upvote = async (id: string) => {
    if (!accessToken) return;
    setBusyId(id);
    await api.upvoteIssue(id, accessToken);
    setBusyId(null);
    refetch();
  };

  const follow = async (id: string) => {
    if (!accessToken) return;
    setBusyId(id);
    await api.followIssue(id, accessToken);
    setBusyId(null);
    refetch();
  };

  return (
    <div className="min-h-screen px-4 py-10" style={{ background: 'var(--color-surface-0)' }}>
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              מפת דיווחים ציבורית
            </h1>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              כל הדיווחים גלויים לכולם. אפשר לתמוך ולעקוב.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/report" className="btn-primary">דווח עכשיו</Link>
            <Link href="/" className="btn-secondary">בית</Link>
          </div>
        </div>

        {loading ? (
          <div className="glass-card p-6">טוען דיווחים...</div>
        ) : (
          <div className="space-y-3">
            {issues.map((issue) => (
              <div key={issue.id} className="glass-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">{issue.reportNumber}</div>
                    <div className="text-sm mt-1">{issue.description}</div>
                    <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                      {issue.address || 'ללא כתובת'} · {issue.tenant.name}
                      {issue.isOrphaned ? ' · ממתין לאימוץ עירייה' : ''}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="btn-secondary"
                      disabled={!accessToken || busyId === issue.id}
                      onClick={() => upvote(issue.id)}
                      title="אני גם נתקלתי בזה"
                    >
                      <ThumbsUp size={14} />
                      {issue.upvoteCount}
                    </button>
                    <button
                      className="btn-secondary"
                      disabled={!accessToken || busyId === issue.id}
                      onClick={() => follow(issue.id)}
                      title="עקוב אחרי העדכונים"
                    >
                      <Bell size={14} />
                      {issue.followerCount}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {!issues.length && <div className="glass-card p-6">אין דיווחים ציבוריים כרגע.</div>}
          </div>
        )}

        {!accessToken && (
          <div className="mt-4 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            להתחברות כדי להשתמש ב-\"אני גם\" ו-\"עקוב\" אפשר להיכנס דרך אחד מדפי העירייה.
          </div>
        )}
      </div>
    </div>
  );
}

