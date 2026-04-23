'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ChevronRight, Bell, CheckCircle2,
  AlertTriangle, MapPin, Clock, Settings,
  Check, X
} from 'lucide-react';

const NOTIFICATIONS = [
  {
    id: '1',
    title: 'הפנייה שלך עודכנה',
    body: 'פנייה CF-2026-00312 (בור בכביש) הועברה לטיפול מחלקת כבישים.',
    time: 'לפני 22 דק\'',
    isRead: false,
    type: 'status',
    icon: AlertTriangle,
    color: '#818CF8',
  },
  {
    id: '2',
    title: 'תגובה חדשה לפנייה',
    body: 'משה כהן הגיב על פנייה CF-2026-00312: "צפי לתיקון תוך 48 שעות."',
    time: 'לפני שעה',
    isRead: false,
    type: 'comment',
    icon: Bell,
    color: '#F59E0B',
  },
  {
    id: '3',
    title: 'פנייה טופלה בהצלחה! ✅',
    body: 'פנייה CF-2026-00298 (פנס רחוב תקול) טופלה. תודה שדיווחת!',
    time: 'לפני 5 שעות',
    isRead: true,
    type: 'resolved',
    icon: CheckCircle2,
    color: '#10B981',
  },
  {
    id: '4',
    title: 'סטטוס פנייה שונה',
    body: 'פנייה CF-2026-00284 (פסולת / גזם) שונתה לסטטוס "בטיפול".',
    time: 'אתמול',
    isRead: true,
    type: 'status',
    icon: Clock,
    color: '#60A5FA',
  },
  {
    id: '5',
    title: 'הודעת מערכת',
    body: 'תודה שהצטרפת ל-CityFix! דווח על מפגעים בעיר שלך ועזור לשפר את איכות החיים.',
    time: 'לפני 3 ימים',
    isRead: true,
    type: 'system',
    icon: Bell,
    color: '#9CA3AF',
  },
];

export default function NotificationsPage() {
  const { tenant } = useParams();
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const markRead = (id: string) => {
    setNotifications(notifications.map((n) => n.id === id ? { ...n, isRead: true } : n));
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface-0)' }}>
      {/* Header */}
      <header
        className="px-6 py-4 flex items-center justify-between"
        style={{
          background: 'rgba(11,15,26,0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div className="flex items-center gap-3">
          <Link
            href={`/${tenant}`}
            className="p-2 rounded-lg"
            style={{ background: 'var(--color-surface-2)' }}
          >
            <ChevronRight size={18} style={{ color: 'var(--color-text-secondary)' }} />
          </Link>
          <h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
            הודעות
          </h1>
          {unreadCount > 0 && (
            <span
              className="badge"
              style={{ background: 'rgba(239,68,68,0.15)', color: '#F87171' }}
            >
              {unreadCount} חדשות
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs font-medium flex items-center gap-1"
            style={{ color: '#818CF8' }}
          >
            <Check size={14} />
            סמן הכל כנקרא
          </button>
        )}
      </header>

      {/* Notification List */}
      <div className="max-w-2xl mx-auto px-6 py-6 space-y-2">
        {notifications.length === 0 ? (
          <div className="text-center py-16">
            <Bell size={40} className="mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
            <p className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              אין הודעות חדשות
            </p>
          </div>
        ) : (
          notifications.map((notif, i) => (
            <div
              key={notif.id}
              onClick={() => markRead(notif.id)}
              className="glass-card p-4 flex items-start gap-3 cursor-pointer animate-slide-up"
              style={{
                animationDelay: `${i * 40}ms`,
                borderRight: notif.isRead ? 'none' : `3px solid ${notif.color}`,
                opacity: notif.isRead ? 0.7 : 1,
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: `${notif.color}15` }}
              >
                <notif.icon size={18} color={notif.color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="text-sm font-bold"
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
                  {notif.time}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
