'use client';

import Link from 'next/link';
import { ChevronRight, PenTool } from 'lucide-react';

export default function ContractPage() {
  return (
    <div className="min-h-screen" style={{ background: '#080B16', color: '#F0F2F8', direction: 'rtl' }}>
      <nav style={{ padding: '24px', display: 'flex', alignItems: 'center' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#8B95B0', textDecoration: 'none' }}>
          <ChevronRight size={18} /> חזרה לדף הבית
        </Link>
      </nav>
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(236,72,153,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PenTool size={24} color="#EC4899" />
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800 }}>טופס חתימה דיגיטלי</h1>
        </div>

        <div style={{ background: 'rgba(23,31,56,0.6)', border: '1px solid rgba(236,72,153,0.06)', borderRadius: 16, padding: '32px' }}>
          <p style={{ color: '#8B95B0', marginBottom: 24, lineHeight: 1.6 }}>אנא מלאו את הפרטים מטה כדי להצטרף לתוכנית הרשויות והשותפים המשפטיים של CityFix. החתימה הינה דיגיטלית ובעלת תוקף משפטי מלא בהתאם לחוק חתימה אלקטרונית, התשס"א-2001.</p>
          
          <form style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 14, color: '#F0F2F8', marginBottom: 8 }}>שם מלא / שם רשות מקומית</label>
              <input type="text" style={{ width: '100%', background: 'rgba(15,22,41,0.8)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 16px', borderRadius: 12, color: 'white' }} placeholder="ישראל ישראלי" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 14, color: '#F0F2F8', marginBottom: 8 }}>כתובת אימייל</label>
              <input type="email" style={{ width: '100%', background: 'rgba(15,22,41,0.8)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 16px', borderRadius: 12, color: 'white' }} placeholder="mail@example.com" />
            </div>
            
            <div style={{ marginTop: 24, padding: 24, background: 'rgba(15,22,41,0.5)', borderRadius: 12, border: '1px dashed rgba(255,255,255,0.2)' }}>
              <p style={{ color: '#8B95B0', fontSize: 14, textAlign: 'center', marginBottom: 16 }}>ציירו את חתימתכם כאן בעזרת העכבר או מגע</p>
              <div style={{ height: 150, cursor: 'crosshair' }}></div>
            </div>

            <button type="button" style={{ 
              marginTop: 16, padding: '14px', fontSize: 16, 
              background: 'linear-gradient(135deg, #EC4899, #BE185D)', 
              color: 'white', borderRadius: 12, fontWeight: 700, border: 'none', cursor: 'pointer' 
            }}>
              אשר וחתום
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
