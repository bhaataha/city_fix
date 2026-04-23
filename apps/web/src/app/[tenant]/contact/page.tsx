'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ChevronRight, Phone, Mail, MapPin,
  Clock, Globe, MessageCircle, ExternalLink,
  Building2, AlertTriangle
} from 'lucide-react';

const CONTACT_CHANNELS = [
  {
    icon: Phone,
    label: 'מוקד עירוני 106',
    desc: 'פתוח 24/7 לכל פנייה',
    action: 'tel:106',
    actionLabel: 'חייגו עכשיו',
    color: '#10B981',
    gradient: 'linear-gradient(135deg, #10B981, #059669)',
  },
  {
    icon: Phone,
    label: 'מוקד חירום',
    desc: 'למקרים מסכנים חיים',
    action: 'tel:100',
    actionLabel: 'חייגו 100',
    color: '#EF4444',
    gradient: 'linear-gradient(135deg, #EF4444, #DC2626)',
  },
  {
    icon: Mail,
    label: 'דוא״ל',
    desc: 'info@tel-aviv.gov.il',
    action: 'mailto:info@tel-aviv.gov.il',
    actionLabel: 'שלחו מייל',
    color: '#6366F1',
    gradient: 'linear-gradient(135deg, #6366F1, #4F46E5)',
  },
  {
    icon: Globe,
    label: 'אתר העירייה',
    desc: 'www.tel-aviv.gov.il',
    action: 'https://www.tel-aviv.gov.il',
    actionLabel: 'בקרו באתר',
    color: '#0EA5E9',
    gradient: 'linear-gradient(135deg, #0EA5E9, #0284C7)',
  },
];

const OFFICE_HOURS = [
  { day: 'ראשון - חמישי', hours: '08:00 - 16:00' },
  { day: 'שישי', hours: '08:00 - 12:00' },
  { day: 'שבת', hours: 'סגור' },
];

const FAQ = [
  {
    q: 'כמה זמן לוקח לטפל בפנייה?',
    a: 'זמן הטיפול תלוי בסוג המפגע ודחיפותו. מפגעי בטיחות מטופלים תוך שעות, ומפגעים רגילים תוך 48-72 שעות.',
  },
  {
    q: 'האם אפשר לדווח בצורה אנונימית?',
    a: 'כן, ניתן לדווח על מפגעים ללא הזדהות. עם זאת, דיווח מזוהה מאפשר לנו לעדכן אתכם על התקדמות הטיפול.',
  },
  {
    q: 'איך אני יודע שהפנייה שלי טופלה?',
    a: 'תקבלו עדכון בהודעות באפליקציה ובמייל (אם הזנתם) כשהפנייה מעודכנת או נסגרת.',
  },
];

export default function ContactPage() {
  const { tenant } = useParams();

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface-0)' }}>
      {/* Header */}
      <header
        className="px-6 py-4 flex items-center gap-3"
        style={{
          background: 'rgba(11,15,26,0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <Link
          href={`/${tenant}`}
          className="p-2 rounded-lg"
          style={{ background: 'var(--color-surface-2)' }}
        >
          <ChevronRight size={18} style={{ color: 'var(--color-text-secondary)' }} />
        </Link>
        <h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
          יצירת קשר
        </h1>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-6">
        {/* Contact channels */}
        <section>
          <h2 className="font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
            ערוצי תקשורת
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {CONTACT_CHANNELS.map((channel, i) => (
              <a
                key={channel.label}
                href={channel.action}
                target={channel.action.startsWith('http') ? '_blank' : undefined}
                rel={channel.action.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="glass-card p-4 flex flex-col items-center text-center animate-slide-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: channel.gradient }}
                >
                  <channel.icon size={22} color="white" />
                </div>
                <div className="font-semibold text-sm mb-0.5" style={{ color: 'var(--color-text-primary)' }}>
                  {channel.label}
                </div>
                <div className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
                  {channel.desc}
                </div>
                <span
                  className="text-xs font-semibold flex items-center gap-1"
                  style={{ color: channel.color }}
                >
                  {channel.actionLabel}
                  <ExternalLink size={10} />
                </span>
              </a>
            ))}
          </div>
        </section>

        {/* Office hours */}
        <section>
          <h2 className="font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
            <Clock size={16} style={{ color: '#818CF8' }} />
            שעות פעילות
          </h2>
          <div className="glass-card p-4 space-y-2">
            {OFFICE_HOURS.map((item) => (
              <div key={item.day} className="flex items-center justify-between">
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {item.day}
                </span>
                <span
                  className="text-sm font-semibold"
                  style={{ color: item.hours === 'סגור' ? '#F87171' : 'var(--color-text-primary)' }}
                >
                  {item.hours}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Address */}
        <section>
          <h2 className="font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
            <MapPin size={16} style={{ color: '#818CF8' }} />
            כתובת
          </h2>
          <div className="glass-card p-4">
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(99,102,241,0.12)' }}
              >
                <Building2 size={20} style={{ color: '#818CF8' }} />
              </div>
              <div>
                <div className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  בניין העירייה
                </div>
                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  רחוב אבן גבירול 69, תל אביב-יפו
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
            <MessageCircle size={16} style={{ color: '#818CF8' }} />
            שאלות נפוצות
          </h2>
          <div className="space-y-2">
            {FAQ.map((item, i) => (
              <div key={i} className="glass-card p-4">
                <div className="text-sm font-bold mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
                  {item.q}
                </div>
                <div className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  {item.a}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Emergency */}
        <div
          className="rounded-xl p-4 flex items-center gap-3"
          style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.15)',
          }}
        >
          <AlertTriangle size={20} color="#EF4444" />
          <div className="flex-1">
            <div className="text-sm font-semibold" style={{ color: '#FCA5A5' }}>
              חירום?
            </div>
            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              משטרה: 100 | מד״א: 101 | כיבוי: 102
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
