'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronRight, Gavel, Phone, Mail, MapPin, Star, ExternalLink, Shield, Clock, Award } from 'lucide-react';

const LAWYERS = [
  { name: 'עו"ד רונית כהן', firm: 'כהן ושות׳ — משרד עורכי דין', spec: 'נזקי גוף ותשתיות', phone: '03-5551234', email: 'ronit@cohen-law.co.il', address: 'רחוב רוטשילד 22, תל אביב', rating: 4.8, experience: '15 שנות ניסיון', color: '#818CF8' },
  { name: 'עו"ד דוד לוי', firm: 'לוי, בר-און עורכי דין', spec: 'תביעות רשויות מקומיות', phone: '03-5559876', email: 'david@levi-law.co.il', address: 'שדרות שאול המלך 8, תל אביב', rating: 4.9, experience: '20 שנות ניסיון', color: '#F59E0B' },
  { name: 'עו"ד מיכל אברהם', firm: 'אברהם ושות׳', spec: 'נזקי רכוש ורשלנות', phone: '03-5557654', email: 'michal@avraham-law.co.il', address: 'רחוב אבן גבירול 40, תל אביב', rating: 4.7, experience: '12 שנות ניסיון', color: '#10B981' },
  { name: 'עו"ד יוסי מזרחי', firm: 'מזרחי & ברק', spec: 'דיני מוניציפליים', phone: '03-5553210', email: 'yossi@mizrahi-law.co.il', address: 'רחוב הרצל 55, תל אביב', rating: 4.6, experience: '18 שנות ניסיון', color: '#6366F1' },
];

export default function LawyersPage() {
  const { tenant } = useParams();
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface-0)' }}>
      <header className="px-6 py-4 flex items-center gap-3" style={{ background: 'rgba(11,15,26,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--color-border)' }}>
        <Link href={`/${tenant}`} className="p-2 rounded-lg" style={{ background: 'var(--color-surface-2)' }}>
          <ChevronRight size={18} style={{ color: 'var(--color-text-secondary)' }} />
        </Link>
        <Gavel size={20} style={{ color: '#818CF8' }} />
        <h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>עורכי דין מומלצים</h1>
      </header>
      <div className="max-w-2xl mx-auto px-6 py-6 space-y-6">
        {/* Disclaimer */}
        <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
          <Shield size={20} color="#F59E0B" className="flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-semibold" style={{ color: '#FCD34D' }}>גילוי נאות</div>
            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              הרשימה מוצגת לנוחיות המשתמשים בלבד ואינה מהווה המלצה רשמית. בחירת עורך דין היא באחריות המשתמש.
            </div>
          </div>
        </div>

        {/* Lawyers */}
        {LAWYERS.map((lawyer, i) => (
          <div key={i} className="glass-card overflow-hidden animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="h-1" style={{ background: lawyer.color }} />
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-base" style={{ color: 'var(--color-text-primary)' }}>{lawyer.name}</h3>
                  <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{lawyer.firm}</div>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: 'rgba(245,158,11,0.12)' }}>
                  <Star size={12} fill="#F59E0B" color="#F59E0B" />
                  <span className="text-xs font-bold" style={{ color: '#F59E0B' }}>{lawyer.rating}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: `${lawyer.color}18`, color: lawyer.color }}>{lawyer.spec}</span>
                <span className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)' }}>
                  <Award size={10} /> {lawyer.experience}
                </span>
              </div>
              <div className="space-y-2">
                <a href={`tel:${lawyer.phone}`} className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  <Phone size={14} style={{ color: '#10B981' }} /> {lawyer.phone}
                </a>
                <a href={`mailto:${lawyer.email}`} className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  <Mail size={14} style={{ color: '#6366F1' }} /> {lawyer.email}
                </a>
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  <MapPin size={14} style={{ color: '#818CF8' }} /> {lawyer.address}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* CTA */}
        <Link href={`/${tenant}/claim`} className="btn-primary block text-center text-sm py-3 rounded-xl font-semibold" style={{ textDecoration: 'none' }}>
          הגישו תביעת תשתית
        </Link>
      </div>
    </div>
  );
}
