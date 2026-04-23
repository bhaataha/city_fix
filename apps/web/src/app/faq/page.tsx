'use client';

import Link from 'next/link';
import { ChevronRight, HelpCircle } from 'lucide-react';

export default function FAQPage() {
  return (
    <div className="min-h-screen" style={{ background: '#080B16', color: '#F0F2F8', direction: 'rtl' }}>
      <nav style={{ padding: '24px', display: 'flex', alignItems: 'center' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#8B95B0', textDecoration: 'none' }}>
          <ChevronRight size={18} /> חזרה לדף הבית
        </Link>
      </nav>
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HelpCircle size={24} color="#818CF8" />
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800 }}>שאלות נפוצות</h1>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { q: 'איך אני מדווח על מפגע?', a: 'ניתן לדווח על מפגע דרך האפליקציה או האתר. בוחרים את העיר, מצלמים את המפגע, ומסמנים על המפה.' },
            { q: 'תוך כמה זמן מתקבלת תגובה?', a: 'רוב הרשויות מתחייבות לתגובה ראשונית תוך 4 שעות בימי חול.' },
            { q: 'האם הדיווח אנונימי?', a: 'כן, קיימת אפשרות לדווח כמדווח אנונימי ללא השארת פרטים מזהים.' },
            { q: 'איך אני יודע שהמפגע טופל?', a: 'המערכת תשלח לכם התראות בזמן אמת (מייל או SMS) ברגע שהסטטוס ישתנה.' },
            { q: 'האם ניתן לפתוח תביעה נגד העירייה?', a: 'כן, המערכת מאפשרת לעורכי דין מורשים לשלוף מידע אודות מפגעים עם חותמת זמן לצורך הליכים משפטיים.' }
          ].map((item, i) => (
            <div key={i} style={{ background: 'rgba(23,31,56,0.6)', border: '1px solid rgba(99,102,241,0.06)', borderRadius: 16, padding: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>{item.q}</h3>
              <p style={{ color: '#8B95B0', lineHeight: 1.6 }}>{item.a}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
