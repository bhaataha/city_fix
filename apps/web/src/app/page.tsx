'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MapPin, Shield, BarChart3, Bell, ChevronLeft,
  Building2, Users, Clock, Zap, Globe, Sparkles,
  CheckCircle2, TrendingUp, Layers
} from 'lucide-react';

const DEMO_CITIES = [
  { name: 'עיריית תל אביב-יפו', slug: 'tel-aviv', population: '460,000', color: '#6366F1' },
  { name: 'עיריית כפר קאסם', slug: 'kafr-qasim', population: '24,000', color: '#10B981' },
  { name: 'עיריית ראש העין', slug: 'rosh-haayin', population: '62,000', color: '#0EA5E9' },
  { name: 'עיריית ירושלים', slug: 'jerusalem', population: '970,000', color: '#F59E0B' },
  { name: 'עיריית חיפה', slug: 'haifa', population: '285,000', color: '#8B5CF6' },
  { name: 'עיריית באר שבע', slug: 'beer-sheva', population: '210,000', color: '#EC4899' },
];

const FEATURES = [
  { icon: MapPin, title: 'דיווח מבוסס מיקום', desc: 'סמנו על המפה, צלמו, ותארו את המפגע — תוך שניות', color: '#6366F1' },
  { icon: Zap, title: 'ניתוב אוטומטי', desc: 'המערכת מזהה את המחלקה האחראית ומנתבת אוטומטית', color: '#F59E0B' },
  { icon: Bell, title: 'עדכונים בזמן אמת', desc: 'קבלו התראות על כל שינוי סטטוס בפנייה שלכם', color: '#10B981' },
  { icon: BarChart3, title: 'דשבורד ואנליטיקה', desc: 'מדדי ביצועים, SLA, ומפות חום לקבלת החלטות', color: '#EC4899' },
  { icon: Shield, title: 'אבטחה ופרטיות', desc: 'הצפנה מלאה, RBAC, ובידוד נתונים בין רשויות', color: '#8B5CF6' },
  { icon: Globe, title: 'רב-שפתי ונגיש', desc: 'עברית, ערבית, אנגלית — עם תמיכה מלאה בנגישות', color: '#0EA5E9' },
];

const STATS = [
  { value: '50+', label: 'רשויות מקומיות', icon: Building2, color: '#6366F1' },
  { value: '1.2M+', label: 'דיווחים שטופלו', icon: TrendingUp, color: '#10B981' },
  { value: '4 שעות', label: 'זמן תגובה ממוצע', icon: Clock, color: '#F59E0B' },
  { value: '94%', label: 'שביעות רצון', icon: CheckCircle2, color: '#EC4899' },
];

export default function LandingPage() {
  const [activeCity, setActiveCity] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCity((prev) => (prev + 1) % DEMO_CITIES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: '#080B16' }}>

      {/* ─── Navbar ─── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1rem 2rem',
        background: 'rgba(8,11,22,0.8)', backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(99,102,241,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
            boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
          }}>
            <MapPin size={18} color="white" />
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, background: 'linear-gradient(135deg,#818CF8,#34D399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CityFix</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link href="/tel-aviv" style={{ fontSize: 14, color: '#8B95B0', textDecoration: 'none' }}>הדגמה</Link>
          <Link href="/tel-aviv/auth/login" className="btn-primary" style={{ padding: '8px 20px', fontSize: 14 }}>כניסת עירייה</Link>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section style={{ position: 'relative', paddingTop: 160, paddingBottom: 80, textAlign: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -200, right: '10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle,rgba(99,102,241,0.08),transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -200, left: '15%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(52,211,153,0.05),transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 18px', borderRadius: 999, marginBottom: 32,
            background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)',
          }}>
            <Sparkles size={14} color="#818CF8" />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#A5B4FC' }}>הפלטפורמה המובילה בישראל</span>
          </div>

          <h1 style={{ fontSize: 'clamp(2.5rem,6vw,4.5rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: 28, letterSpacing: '-0.02em' }}>
            <span style={{ background: 'linear-gradient(135deg,#818CF8,#6EE7B7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>עיר חכמה</span>
            <br />
            <span style={{ color: '#F0F2F8' }}>מתחילה בתושבים</span>
          </h1>

          <p style={{ fontSize: 18, color: '#8B95B0', maxWidth: 550, margin: '0 auto 40px', lineHeight: 1.7 }}>
            דווחו על מפגעים עירוניים, עקבו אחרי הטיפול בזמן אמת, ושלחו תביעות תשתית — הכל מפלטפורמה אחת מתקדמת
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            <Link href="/tel-aviv/report" className="btn-primary" style={{ fontSize: 16, padding: '14px 36px' }}>
              <MapPin size={18} /> דווח על מפגע
            </Link>
            <Link href="/tel-aviv/map" className="btn-secondary" style={{ fontSize: 16, padding: '14px 36px' }}>
              <Globe size={18} /> צפה במפה
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Stats (cards) ─── */}
      <section style={{ padding: '48px 24px 64px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
          {STATS.map((s, i) => (
            <div key={i} style={{
              background: `linear-gradient(145deg, ${s.color}0A, ${s.color}04)`,
              border: `1px solid ${s.color}18`,
              borderRadius: 20, padding: '28px 16px', textAlign: 'center',
              transition: 'all 0.3s ease',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 14, margin: '0 auto 14px',
                background: `${s.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <s.icon size={20} color={s.color} />
              </div>
              <div style={{ fontSize: 'clamp(1.5rem,3vw,2.2rem)', fontWeight: 800, color: s.color, marginBottom: 4 }}>
                {s.value}
              </div>
              <div style={{ fontSize: 13, color: '#566082', fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features ─── */}
      <section style={{ padding: '64px 24px 80px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 16px', borderRadius: 999, marginBottom: 16,
              background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.1)',
            }}>
              <Layers size={13} color="#818CF8" />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#A5B4FC' }}>יכולות מתקדמות</span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.6rem,3.5vw,2.4rem)', fontWeight: 700, color: '#F0F2F8', marginBottom: 10 }}>
              כל מה שרשות מקומית צריכה
            </h2>
            <p style={{ fontSize: 15, color: '#8B95B0' }}>פלטפורמה אחודה לניהול מפגעים, שירות לתושב ותביעות תשתית</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{
                borderRadius: 24, overflow: 'hidden', transition: 'all 0.4s ease',
                background: 'linear-gradient(145deg, rgba(15,22,41,0.9), rgba(23,31,56,0.6))',
                border: '1px solid rgba(99,102,241,0.06)',
                position: 'relative',
              }}
                className="feature-card"
              >
                {/* colored top accent line */}
                <div style={{ height: 3, background: `linear-gradient(90deg, ${f.color}, transparent)` }} />
                <div style={{ padding: '28px 24px 24px' }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 16, marginBottom: 20,
                    background: `linear-gradient(135deg, ${f.color}15, ${f.color}08)`,
                    border: `1px solid ${f.color}12`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <f.icon size={24} color={f.color} />
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: '#F0F2F8', marginBottom: 8 }}>{f.title}</h3>
                  <p style={{ fontSize: 14, color: '#8B95B0', lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── City Selector ─── */}
      <section style={{ padding: '80px 24px', background: 'linear-gradient(180deg, rgba(15,22,41,0.4), #080B16)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 16px', borderRadius: 999, marginBottom: 16,
            background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)',
          }}>
            <Building2 size={13} color="#34D399" />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#6EE7B7' }}>רשויות מקומיות</span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.6rem,3.5vw,2.4rem)', fontWeight: 700, color: '#F0F2F8', marginBottom: 10 }}>בחרו את הרשות שלכם</h2>
          <p style={{ fontSize: 15, color: '#8B95B0', marginBottom: 40 }}>כל עירייה מקבלת פורטל ממותג ודשבורד ייעודי</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {DEMO_CITIES.map((city, i) => (
              <Link key={city.slug} href={`/${city.slug}`} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: 20, borderRadius: 20, textDecoration: 'none',
                background: activeCity === i
                  ? `linear-gradient(145deg, ${city.color}10, ${city.color}05)`
                  : 'linear-gradient(145deg, rgba(15,22,41,0.7), rgba(23,31,56,0.4))',
                border: `1px solid ${activeCity === i ? city.color + '30' : 'rgba(99,102,241,0.06)'}`,
                transition: 'all 0.4s ease',
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 16, flexShrink: 0,
                  background: `${city.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `1px solid ${city.color}15`,
                }}>
                  <Building2 size={20} color={city.color} />
                </div>
                <div style={{ flex: 1, textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: '#F0F2F8', fontSize: 15 }}>{city.name}</div>
                  <div style={{ fontSize: 12, color: '#566082', marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Users size={11} /> {city.population} תושבים
                  </div>
                </div>
                <ChevronLeft size={16} color="#566082" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{
          maxWidth: 700, margin: '0 auto', borderRadius: 28, padding: '56px 40px', position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(145deg, rgba(99,102,241,0.07), rgba(16,185,129,0.03))',
          border: '1px solid rgba(99,102,241,0.1)',
        }}>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle,rgba(99,102,241,0.1),transparent 70%)', pointerEvents: 'none' }} />
          <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 700, color: '#F0F2F8', marginBottom: 12 }}>מוכנים לשדרג את השירות לתושב?</h2>
          <p style={{ fontSize: 15, color: '#8B95B0', marginBottom: 32 }}>הצטרפו לעשרות רשויות שכבר משתמשות ב-CityFix</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
            <button className="btn-primary" style={{ fontSize: 16, padding: '14px 36px' }}><Sparkles size={18} /> בקשו הדגמה</button>
            <button className="btn-secondary" style={{ fontSize: 16, padding: '14px 36px' }}>צרו קשר</button>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer style={{ padding: '48px 24px', borderTop: '1px solid rgba(99,102,241,0.06)', color: '#566082' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 40 }}>
          
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#6366F1,#4F46E5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={16} color="white" />
              </div>
              <span style={{ fontWeight: 800, color: '#F0F2F8', fontSize: 18 }}>CityFix</span>
            </div>
            <p style={{ fontSize: 14, maxWidth: 250, lineHeight: 1.6 }}>
              הפלטפורמה המתקדמת בישראל לניהול מפגעים וקשר עם התושב.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 64 }}>
            <div>
              <h4 style={{ color: '#F0F2F8', fontWeight: 600, marginBottom: 16 }}>קישורים שימושיים</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <li><Link href="/faq" style={{ color: '#8B95B0', textDecoration: 'none', fontSize: 14 }}>שאלות נפוצות (FAQ)</Link></li>
                <li><Link href="/onboard" style={{ color: '#8B95B0', textDecoration: 'none', fontSize: 14 }}>הרשמת עירייה חדשה</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 style={{ color: '#F0F2F8', fontWeight: 600, marginBottom: 16 }}>מידע משפטי</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <li><Link href="/terms" style={{ color: '#8B95B0', textDecoration: 'none', fontSize: 14 }}>תקנון ותנאי שימוש</Link></li>
                <li><Link href="/contract" style={{ color: '#8B95B0', textDecoration: 'none', fontSize: 14 }}>טופס חתימה</Link></li>
                <li><Link href="/lawyers" style={{ color: '#8B95B0', textDecoration: 'none', fontSize: 14 }}>הוראות לעורכי דין</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1000, margin: '40px auto 0', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 24, fontSize: 13 }}>
          © {new Date().getFullYear()} CityFix. כל הזכויות שמורות.
        </div>
      </footer>
    </div>
  );
}
