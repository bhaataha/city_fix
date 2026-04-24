'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ChevronRight, Bell, CheckCircle2,
  AlertTriangle, Clock,
  Check, Loader2
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  sentAt: string;
  data?: any;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'עכשיו';
  if (mins < 60) return `לפני ${mins} דק'`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `לפני ${hours === 1 ? 'שעה' : `${hours} שעות`}`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'אתמול';
  if (days < 7) return `לפני ${days} ימים`;
  return new Date(dateStr).toLocaleDateString('he-IL');
}

function getNotifMeta(notif: Notification) {
  const event = notif.data?.event;
  switch (event) {
    case 'ISSUE_CREATED':
      return { icon: AlertTriangle, color: '#818CF8' };
    case 'ISSUE_STATUS_CHANGED':
      return { icon: Clock, color: '#60A5FA' };
    case 'ISSUE_ASSIGNED':
      return { icon: CheckCircle2, color: '#F59E0B' };
    case 'CLAIM_CREATED':
    case 'CLAIM_STATUS_CHANGED':
      return { icon: AlertTriangle, color: '#EC4899' };
    case 'SLA_WARNING':
    case 'SLA_BREACH':
      return { icon: AlertTriangle, color: '#EF4444' };
    default:
      return { icon: Bell, color: '#9CA3AF' };
  }
}

export default function NotificationsPage() {
  const { tenant } = useParams();
  const { accessToken } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!accessToken || !tenant) return;
    setLoading(true);
    try {
      const res = await api.getNotifications(tenant as string, accessToken);
      if (res.success && res.data) {
        const items = Array.isArray(res.data) ? res.data : (res.data as any).data || [];
        setNotifications(items);
        setUnreadCount(items.filter((n: Notification) => !n.isRead).length);
      }
    } catch (e) {
      console.error('Failed to fetch notifications', e);
    } finally {
      setLoading(false);
    }
  }, [accessToken, tenant]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAllRead = async () => {
    if (!accessToken || !tenant) return;
    await api.markAllNotificationsRead(tenant as string, accessToken);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const markRead = async (id: string) => {
    if (!accessToken || !tenant) return;
    await api.markNotificationRead(tenant as string, id, accessToken);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface-0)', overflowX: 'hidden' }}>
      {/* Header */}
      <header
        className="px-4 sm:px-6 py-3 flex items-center justify-between"
        style={{
          background: 'rgba(11,15,26,0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Link
            href={`/${tenant}`}
            className="p-2 rounded-lg flex-shrink-0"
            style={{ background: 'var(--color-surface-2)' }}
          >
            <ChevronRight size={18} style={{ color: 'var(--color-text-secondary)' }} />
          </Link>
          <h1 className="text-base sm:text-lg font-bold truncate" style={{ color: 'var(--color-text-primary)' }}>
            הודעות
          </h1>
          {unreadCount > 0 && (
            <span
              className="badge flex-shrink-0"
              style={{ background: 'rgba(239,68,68,0.15)', color: '#F87171' }}
            >
              {unreadCount} חדשות
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs font-medium flex items-center gap-1 flex-shrink-0"
            style={{ color: '#818CF8' }}
          >
            <Check size={14} />
            סמן הכל כנקרא
          </button>
        )}
      </header>

      {/* Notification List */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-2">
        {loading ? (
          <div className="text-center py-16">
            <Loader2 size={32} className="mx-auto mb-3 animate-spin" style={{ color: '#818CF8' }} />
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>טוען הודעות...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16">
            <Bell size={40} className="mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
            <p className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              אין הודעות חדשות
            </p>
          </div>
        ) : (
          notifications.map((notif, i) => {
            const meta = getNotifMeta(notif);
            const Icon = meta.icon;
            return (
              <div
                key={notif.id}
                onClick={() => !notif.isRead && markRead(notif.id)}
                className="glass-card p-3 sm:p-4 flex items-start gap-2.5 sm:gap-3 cursor-pointer animate-slide-up"
                style={{
                  animationDelay: `${i * 40}ms`,
                  borderRight: notif.isRead ? 'none' : `3px solid ${meta.color}`,
                  opacity: notif.isRead ? 0.7 : 1,
                }}
              >
                <div
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: `${meta.color}15` }}
                >
                  <Icon size={16} color={meta.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span
                      className="text-sm font-bold truncate"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {notif.title}
                    </span>
                    {!notif.isRead && (
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: '#818CF8' }}
                      />
                    )}
                  </div>
                  <p className="text-xs leading-relaxed mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                    {notif.body}
                  </p>
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {timeAgo(notif.sentAt)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
