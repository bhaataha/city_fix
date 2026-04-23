'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronRight, ScrollText, Calendar, Shield, Scale } from 'lucide-react';

const S = [
  { t: 'כללי', c: 'פלטפורמת CityFix מופעלת עבור הרשות המקומית ומאפשרת לתושבים לדווח על מפגעי תשתית, לעקוב אחר סטטוס הטיפול ולהגיש תביעות. השימוש כפוף לתנאים אלה.' },
  { t: 'הגדרות', c: '• "משתמש" — כל אדם הנרשם לפלטפורמה.\n• "מפגע" — ליקוי, נזק או סיכון בתשתית ציבורית.\n• "דיווח" — הודעה על מפגע דרך הפלטפורמה.\n• "תביעה" — בקשה לפיצוי בגין נזק ממפגע תשתית.' },
  { t: 'רישום ושימוש', c: '• הרישום פתוח לכל תושב מעל גיל 16.\n• המשתמש מתחייב למסור פרטים מדויקים.\n• חל איסור על דיווחי שווא או הפרעה למערכת.\n• העירייה רשאית לחסום משתמש המפר את התקנון.\n• השימוש חינמי לתושבים.' },
  { t: 'דיווח מפגעים', c: '• המשתמש מתחייב לדווח בתום לב בלבד.\n• דיווח כוזב עלול להוביל לחסימה.\n• העירייה תטפל בהתאם ל-SLA שנקבע.\n• תמונות שמועלות ישמשו לצרכי תיעוד.' },
  { t: 'תביעות תשתית', c: '• הגשת תביעה אינה תחליף לייעוץ משפטי.\n• המשתמש אחראי לדיוק המסמכים.\n• העירייה תבחן בהתאם לנהליה ולחוק.\n• אישור או דחייה יימסרו בצורה מפורטת.' },
  { t: 'פרטיות ואבטחה', c: '• המערכת עומדת בחוק הגנת הפרטיות.\n• המידע ישמש רק לטיפול בדיווחים.\n• לא יועבר מידע לצדדים שלישיים ללא הסכמה.\n• נתוני מיקום נאספים רק לסימון המפגע.' },
  { t: 'קניין רוחני', c: '• כל הזכויות במערכת שייכות למפעיל.\n• תמונות משתמשים נשארות בבעלותם.\n• חל איסור על העתקה או שימוש מסחרי.' },
  { t: 'הגבלת אחריות', c: '• המערכת מסופקת AS IS.\n• אינה תחליף לשירותי חירום.\n• חירום: משטרה 100 | מד"א 101 | כבאות 102.' },
  { t: 'שינויים', c: '• העירייה רשאית לשנות תקנון זה.\n• הודעה על שינויים מהותיים תשלח למשתמשים.\n• המשך שימוש מהווה הסכמה לתנאים החדשים.' },
];

export default function TermsPage() {
  const { tenant } = useParams();
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface-0)' }}>
      <header className="px-6 py-4 flex items-center gap-3" style={{ background: 'rgba(11,15,26,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--color-border)' }}>
        <Link href={`/${tenant}`} className="p-2 rounded-lg" style={{ background: 'var(--color-surface-2)' }}>
          <ChevronRight size={18} style={{ color: 'var(--color-text-secondary)' }} />
        </Link>
        <ScrollText size={20} style={{ color: '#818CF8' }} />
        <h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>תקנון שימוש</h1>
      </header>
      <div className="max-w-2xl mx-auto px-6 py-6 space-y-6">
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-muted)' }}><Calendar size={14} /> עדכון אחרון: אפריל 2026</div>
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-muted)' }}><Scale size={14} /> גרסה 1.0</div>
        </div>
        {S.map((s, i) => (
          <section key={i} className="animate-slide-up" style={{ animationDelay: `${i * 40}ms` }}>
            <h2 className="font-bold mb-2 flex items-center gap-2 text-base" style={{ color: 'var(--color-text-primary)' }}>
              <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: 'rgba(129,140,248,0.15)', color: '#818CF8' }}>{i + 1}</span>
              {s.t}
            </h2>
            <div className="glass-card p-4 text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--color-text-secondary)' }}>{s.c}</div>
          </section>
        ))}
        <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
          <Shield size={20} color="#818CF8" />
          <div>
            <div className="text-sm font-semibold" style={{ color: '#A5B4FC' }}>שמירה על פרטיותך</div>
            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>המערכת עומדת בדרישות חוק הגנת הפרטיות ומיישמת הצפנה מקצה לקצה</div>
          </div>
        </div>
      </div>
    </div>
  );
}
