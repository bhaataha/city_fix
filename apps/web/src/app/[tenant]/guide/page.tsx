'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronRight, BookOpen, MapPin, Camera, FileText, Bell, Shield, Search, CheckCircle2, ArrowLeft } from 'lucide-react';

const STEPS = [
  { icon: MapPin, title: 'בחרו קטגוריה', desc: 'בחרו את סוג המפגע מתוך הרשימה — בור בכביש, תאורה, פסולת, בטיחות ועוד.', color: '#818CF8' },
  { icon: Search, title: 'סמנו מיקום', desc: 'סמנו את מיקום המפגע על המפה האינטראקטיבית, או הזינו כתובת ידנית.', color: '#10B981' },
  { icon: Camera, title: 'צרפו תמונה', desc: 'צלמו את המפגע מהטלפון או העלו תמונה קיימת. ניתן עד 5 תמונות.', color: '#F59E0B' },
  { icon: FileText, title: 'תארו את המפגע', desc: 'כתבו תיאור קצר — מה הבעיה, מתי הבחנתם, האם מסכן חיים.', color: '#EF4444' },
  { icon: Bell, title: 'קבלו עדכונים', desc: 'עקבו אחרי הסטטוס בזמן אמת. נעדכן אתכם בכל שלב של הטיפול.', color: '#6366F1' },
  { icon: CheckCircle2, title: 'אישור טיפול', desc: 'כשהמפגע מטופל, תקבלו הודעה. ניתן לדרג את השירות.', color: '#22C55E' },
];

const TIPS = [
  'צלמו תמונה ברורה באור טוב',
  'סמנו מיקום מדויק ככל האפשר',
  'ציינו אם המפגע מסכן חיים — זה יזרז את הטיפול',
  'הירשמו כדי לקבל עדכונים (דיווח אנונימי לא מאפשר מעקב)',
  'בדקו תחילה שהמפגע לא דווח כבר ע"י אחרים במפה',
];

const CLAIM_STEPS = [
  'תעדו את הנזק מיד — צלמו תמונות מכל זווית',
  'שמרו קבלות תיקון, חוות דעת שמאי, ואישורים רפואיים',
  'הגישו תביעה דרך המערכת עם כל המסמכים',
  'העירייה תבחן את התביעה ותעדכן אתכם בתוך 30 יום',
  'במקרה הצורך, המערכת תפנה אתכם לייעוץ משפטי',
];

export default function GuidePage() {
  const { tenant } = useParams();
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface-0)', overflowX: 'hidden' }}>
      <header className="px-4 sm:px-6 py-3 flex items-center gap-3" style={{ background: 'rgba(11,15,26,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--color-border)' }}>
        <Link href={`/${tenant}`} className="p-2 rounded-lg" style={{ background: 'var(--color-surface-2)' }}>
          <ChevronRight size={18} style={{ color: 'var(--color-text-secondary)' }} />
        </Link>
        <BookOpen size={20} style={{ color: '#818CF8' }} />
        <h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>הוראות שימוש</h1>
      </header>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5 sm:py-6 space-y-6 sm:space-y-8">
        {/* How to report */}
        <section>
          <h2 className="font-bold text-lg mb-4" style={{ color: 'var(--color-text-primary)' }}>🔹 איך מדווחים על מפגע?</h2>
          <div className="space-y-3">
            {STEPS.map((step, i) => (
              <div key={i} className="glass-card p-4 flex items-start gap-4 animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${step.color}18` }}>
                    <step.icon size={20} style={{ color: step.color }} />
                  </div>
                  <span className="text-xs font-bold" style={{ color: step.color }}>{i + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>{step.title}</div>
                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tips */}
        <section>
          <h2 className="font-bold text-lg mb-3" style={{ color: 'var(--color-text-primary)' }}>💡 טיפים לדיווח יעיל</h2>
          <div className="glass-card p-4 space-y-3">
            {TIPS.map((tip, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle2 size={16} style={{ color: '#10B981', marginTop: 2, flexShrink: 0 }} />
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{tip}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Claims */}
        <section>
          <h2 className="font-bold text-lg mb-3" style={{ color: 'var(--color-text-primary)' }}>📋 תביעות תשתית — שלב אחרי שלב</h2>
          <div className="space-y-2">
            {CLAIM_STEPS.map((step, i) => (
              <div key={i} className="glass-card p-4 flex items-start gap-3 animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B' }}>{i + 1}</span>
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{step}</span>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="flex gap-3">
          <Link href={`/${tenant}/report`} className="btn-primary flex-1 text-center text-sm py-3 rounded-xl font-semibold" style={{ textDecoration: 'none' }}>
            דווחו על מפגע
          </Link>
          <Link href={`/${tenant}/faq`} className="glass-card flex-1 text-center text-sm py-3 font-semibold" style={{ color: 'var(--color-text-primary)', textDecoration: 'none' }}>
            שאלות נפוצות
          </Link>
        </div>
      </div>
    </div>
  );
}
