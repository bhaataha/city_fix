'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ChevronRight, ChevronDown, HelpCircle, Search,
  FileText, AlertTriangle, MapPin, Camera, Users,
  Shield, Clock, Bell,
} from 'lucide-react';

const FAQ_CATEGORIES = [
  {
    title: 'דיווח על מפגעים',
    icon: MapPin,
    color: '#818CF8',
    questions: [
      {
        q: 'איך מדווחים על מפגע?',
        a: 'לחצו על כפתור "דווח על מפגע" בעמוד הראשי, בחרו קטגוריה, סמנו את המיקום על המפה, צרפו תמונה ותיאור, ושלחו. הדיווח יועבר אוטומטית למחלקה המתאימה.',
      },
      {
        q: 'האם חייבים לצרף תמונה?',
        a: 'לא חובה, אך מומלץ מאוד. תמונה מסייעת לצוות העירייה להבין את חומרת המפגע ולהגיע מוכנים עם הציוד המתאים.',
      },
      {
        q: 'האם אפשר לדווח בצורה אנונימית?',
        a: 'כן, ניתן לסמן "דיווח אנונימי" בטופס הדיווח. שימו לב שבמקרה זה לא תוכלו לקבל עדכונים על הטיפול בפנייה.',
      },
      {
        q: 'מה קורה אחרי שאני מדווח?',
        a: 'הדיווח מועבר למחלקה הרלוונטית, מוקצה מספר פנייה ייחודי, ומתחיל תהליך טיפול עם מעקב SLA. תקבלו עדכונים בכל שלב.',
      },
      {
        q: 'כמה זמן לוקח לטפל בפנייה?',
        a: 'תלוי בסוג המפגע: מפגע בטיחותי — עד 4 שעות, תאורת רחוב — עד 24 שעות, בור בכביש — עד 48 שעות, מפגעים רגילים — עד 72 שעות.',
      },
    ],
  },
  {
    title: 'תביעות תשתית',
    icon: FileText,
    color: '#F59E0B',
    questions: [
      {
        q: 'מתי כדאי להגיש תביעת תשתית?',
        a: 'כאשר נגרם לכם נזק ממשי (לרכב, לרכוש, או פציעה) בעקבות מפגע תשתית עירוני — למשל בור בכביש, מדרכה שבורה, או עמוד שנפל.',
      },
      {
        q: 'אילו מסמכים צריך לצרף?',
        a: 'תמונות של הנזק והמפגע, אומדן שמאי או קבלות תיקון, אישור רפואי (בפציעות), ותצהיר חתום. ככל שתצרפו יותר — כך הסיכוי לאישור גבוה יותר.',
      },
      {
        q: 'כמה זמן יש להגיש תביעה?',
        a: 'מומלץ להגיש בהקדם האפשרי. לפי חוק, ההתיישנות היא 7 שנים מיום האירוע, אך ככל שמדווחים מוקדם יותר — כך התיעוד איכותי יותר.',
      },
      {
        q: 'כמה זמן לוקח הטיפול בתביעה?',
        a: 'תהליך סטנדרטי אורך 30-90 ימים. תביעות מורכבות הכוללות בדיקת מהנדס או חוות דעת משפטית עשויות לקחת יותר.',
      },
    ],
  },
  {
    title: 'חשבון משתמש',
    icon: Users,
    color: '#10B981',
    questions: [
      {
        q: 'איך נרשמים למערכת?',
        a: 'לחצו "הרשמה" בעמוד העירייה, הזינו שם, אימייל וסיסמה. ההרשמה מיידית ותוכלו להתחיל לדווח.',
      },
      {
        q: 'שכחתי סיסמה, מה עושים?',
        a: 'בדף ההתחברות לחצו "שכחתי סיסמה", הזינו את כתובת המייל ותקבלו קישור לאיפוס.',
      },
      {
        q: 'האם המידע שלי מוגן?',
        a: 'בהחלט. המערכת עומדת בתקני אבטחת מידע מתקדמים, כל התקשורת מוצפנת, והמידע האישי שלכם נשמר באופן מאובטח.',
      },
    ],
  },
  {
    title: 'מעקב וסטטוס',
    icon: Bell,
    color: '#6366F1',
    questions: [
      {
        q: 'איך עוקבים אחרי הדיווח שלי?',
        a: 'בדף "הדיווחים שלי" תוכלו לראות את כל הדיווחים שהגשתם ואת הסטטוס המעודכן שלהם בזמן אמת.',
      },
      {
        q: 'מה המשמעות של כל סטטוס?',
        a: 'חדש — טרם נקרא | בבדיקה — מאמתים את הדיווח | הוקצה — הועבר לטיפול | בטיפול — צוות עובד | נפתר — הטיפול הושלם | נסגר — אושר ונסגר.',
      },
      {
        q: 'למה הדיווח שלי סומן כ"כפילות"?',
        a: 'כאשר מספר אזרחים מדווחים על אותו מפגע, המערכת מאחדת את הדיווחים כדי לייעל את הטיפול. הדיווח שלכם עדיין תורם לעדיפות הטיפול.',
      },
    ],
  },
];

export default function FAQPage() {
  const { tenant } = useParams();
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');

  const toggle = (key: string) =>
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));

  const allQuestions = FAQ_CATEGORIES.flatMap((cat) =>
    cat.questions.map((q) => ({ ...q, category: cat.title, color: cat.color })),
  );

  const filtered = searchTerm
    ? allQuestions.filter(
        (q) =>
          q.q.includes(searchTerm) || q.a.includes(searchTerm),
      )
    : null;

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface-0)', overflowX: 'hidden' }}>
      <header
        className="px-4 sm:px-6 py-3 flex items-center gap-3"
        style={{
          background: 'rgba(11,15,26,0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <Link href={`/${tenant}`} className="p-2 rounded-lg" style={{ background: 'var(--color-surface-2)' }}>
          <ChevronRight size={18} style={{ color: 'var(--color-text-secondary)' }} />
        </Link>
        <HelpCircle size={20} style={{ color: '#818CF8' }} />
        <h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
          שאלות נפוצות
        </h1>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5 sm:py-6 space-y-5 sm:space-y-6">
        {/* Search */}
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{
            background: 'var(--color-surface-1)',
            border: '1px solid var(--color-border)',
          }}
        >
          <Search size={18} style={{ color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            placeholder="חפשו שאלה..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'var(--color-text-primary)' }}
          />
        </div>

        {/* Search results */}
        {filtered && (
          <section>
            <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-muted)' }}>
              {filtered.length} תוצאות
            </h2>
            <div className="space-y-2">
              {filtered.map((item, i) => (
                <div key={i} className="glass-card p-4">
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full mb-2 inline-block"
                    style={{ background: `${item.color}22`, color: item.color }}
                  >
                    {item.category}
                  </span>
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
        )}

        {/* Categories */}
        {!filtered &&
          FAQ_CATEGORIES.map((cat, catIdx) => (
            <section key={cat.title} className="animate-slide-up" style={{ animationDelay: `${catIdx * 60}ms` }}>
              <h2
                className="font-bold mb-3 flex items-center gap-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                <cat.icon size={18} style={{ color: cat.color }} />
                {cat.title}
                <span
                  className="text-xs px-2 py-0.5 rounded-full mr-auto"
                  style={{ background: `${cat.color}18`, color: cat.color }}
                >
                  {cat.questions.length}
                </span>
              </h2>
              <div className="space-y-2">
                {cat.questions.map((item, i) => {
                  const key = `${catIdx}-${i}`;
                  const isOpen = openItems[key];
                  return (
                    <button
                      key={i}
                      onClick={() => toggle(key)}
                      className="glass-card p-4 w-full text-right"
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex-1 text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                          {item.q}
                        </div>
                        <ChevronDown
                          size={16}
                          style={{
                            color: 'var(--color-text-muted)',
                            transition: 'transform 0.2s',
                            transform: isOpen ? 'rotate(180deg)' : 'none',
                          }}
                        />
                      </div>
                      {isOpen && (
                        <div
                          className="text-sm leading-relaxed mt-3 pt-3"
                          style={{
                            color: 'var(--color-text-secondary)',
                            borderTop: '1px solid var(--color-border)',
                          }}
                        >
                          {item.a}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
      </div>
    </div>
  );
}
