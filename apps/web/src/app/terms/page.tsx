'use client';

import Link from 'next/link';
import { ChevronRight, FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen" style={{ background: '#080B16', color: '#F0F2F8', direction: 'rtl' }}>
      <nav style={{ padding: '24px', display: 'flex', alignItems: 'center' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#8B95B0', textDecoration: 'none' }}>
          <ChevronRight size={18} /> חזרה לדף הבית
        </Link>
      </nav>
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={24} color="#34D399" />
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800 }}>תקנון ותנאי שימוש</h1>
        </div>

        <div style={{ background: 'rgba(23,31,56,0.6)', border: '1px solid rgba(16,185,129,0.06)', borderRadius: 16, padding: '32px', lineHeight: 1.8, color: '#8B95B0' }}>
          <h2 style={{ fontSize: 20, color: '#F0F2F8', marginBottom: 16 }}>1. כללי</h2>
          <p style={{ marginBottom: 24 }}>ברוכים הבאים ל-CityFix. פלטפורמה זו נועדה לספק שירותי דיווח עירוניים ותביעות תשתית לרשויות מקומיות ותושבים. השימוש באפליקציה או באתר כפוף לתנאים המפורטים להלן.</p>
          
          <h2 style={{ fontSize: 20, color: '#F0F2F8', marginBottom: 16 }}>2. פרטיות ושמירת נתונים</h2>
          <p style={{ marginBottom: 24 }}>כל הנתונים המוזנים במערכת, כולל פרטים אישיים, מיקומי GPS ותמונות, מוצפנים ונשמרים בהתאם להוראות חוק הגנת הפרטיות ותקנות ה-GDPR. אין להשתמש בנתוני משתמשים אחרים ללא הרשאתם המפורשת.</p>

          <h2 style={{ fontSize: 20, color: '#F0F2F8', marginBottom: 16 }}>3. אחריות דיווח</h2>
          <p style={{ marginBottom: 24 }}>המשתמש מתחייב למסור פרטים מדויקים ולהימנע מהגשת דיווחי סרק שעלולים להעמיס על המוקד העירוני. המערכת רשאית לחסום משתמשים המנצלים את השירות לרעה.</p>

          <h2 style={{ fontSize: 20, color: '#F0F2F8', marginBottom: 16 }}>4. שירותים משפטיים ועורכי דין</h2>
          <p>המידע המופק מהמערכת מהווה רישום דיגיטלי הכולל חותמת זמן. עם זאת, CityFix אינה נושאת באחריות על פסיקות בית משפט או תוצאות הליכים משפטיים המסתמכים על המידע המופק מתוכה.</p>
        </div>
      </main>
    </div>
  );
}
