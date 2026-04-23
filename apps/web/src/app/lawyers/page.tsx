'use client';

import Link from 'next/link';
import { ChevronRight, Scale } from 'lucide-react';

export default function LawyersPage() {
  return (
    <div className="min-h-screen" style={{ background: '#080B16', color: '#F0F2F8', direction: 'rtl' }}>
      <nav style={{ padding: '24px', display: 'flex', alignItems: 'center' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#8B95B0', textDecoration: 'none' }}>
          <ChevronRight size={18} /> חזרה לדף הבית
        </Link>
      </nav>
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Scale size={24} color="#F59E0B" />
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800 }}>הוראות שימוש - עורכי דין</h1>
        </div>

        <div style={{ background: 'rgba(23,31,56,0.6)', border: '1px solid rgba(245,158,11,0.06)', borderRadius: 16, padding: '32px', lineHeight: 1.8, color: '#8B95B0' }}>
          <h2 style={{ fontSize: 20, color: '#F0F2F8', marginBottom: 16 }}>גישה למערכת ותביעות תשתית</h2>
          <p style={{ marginBottom: 24 }}>מערכת CityFix מציעה פורטל ייעודי לעורכי דין המייצגים אזרחים בתביעות נזיקין מול רשויות מקומיות (למשל, נפילה עקב בור במדרכה, תאורת רחוב לקויה שגרמה לנזק). מודול זה מאפשר שליפת היסטוריית דיווחים כראיה קבילה בבית משפט.</p>
          
          <h2 style={{ fontSize: 20, color: '#F0F2F8', marginBottom: 16 }}>קבילות משפטית (Audit Logs)</h2>
          <p style={{ marginBottom: 24 }}>כל דיווח במערכת מקבל חותמת זמן בלתי ניתנת לשינוי (Immutable Timestamp). ניתן להפיק תעודת אישור דיווח דיגיטלית הכוללת את מיקום ה-GPS המדויק, התמונה המקורית מזירת האירוע עם מטא-דאטה מקורי, ואת זמני התגובה הרשמיים של העירייה. מערכת זו עומדת בתקני אבטחה מחמירים.</p>

          <h2 style={{ fontSize: 20, color: '#F0F2F8', marginBottom: 16 }}>פתיחת תיק משפטי למשתמש קצה</h2>
          <p style={{ marginBottom: 24 }}>אזרחים רשאים להעניק הרשאת קריאה (Read-Only) לתיק המפגע שלהם לעורך דין מורשה על ידי שיתוף קישור מאובטח וחד פעמי מהאזור האישי שלהם.</p>

          <h2 style={{ fontSize: 20, color: '#F0F2F8', marginBottom: 16 }}>הרשמה לשירות השותפים</h2>
          <p>כדי לקבל גישת API למערכת או לנהל תיקים באופן מרוכז כעורך דין או כמשרד עורכי דין, יש ליצור חשבון "שותף משפטי", למלא טופס חתימה, ולעבור אימות זהות (KYC) מול צוות CityFix.</p>
        </div>
      </main>
    </div>
  );
}
