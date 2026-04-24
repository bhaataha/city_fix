'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, MapPin, Send } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

export default function PublicReportPage() {
  const { accessToken } = useAuthStore();
  const [categoryName, setCategoryName] = useState('בור בכביש');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('32.0853');
  const [longitude, setLongitude] = useState('34.7818');
  const [statusText, setStatusText] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!description.trim()) return;
    setSubmitting(true);
    setStatusText(null);
    const res = await api.createPublicIssue(
      {
        categoryName,
        description,
        address: address || undefined,
        latitude: Number(latitude),
        longitude: Number(longitude),
      },
      accessToken || undefined,
    );
    setSubmitting(false);
    if (!res.success) {
      setStatusText(`שגיאה: ${res.error}`);
      return;
    }
    const reportNumber = (res.data as any)?.issue?.reportNumber;
    const adoptionStatus = (res.data as any)?.adoptionStatus;
    setStatusText(
      `דיווח נשלח בהצלחה (${reportNumber || 'ללא מספר'}). ${adoptionStatus || ''}`.trim(),
    );
    setDescription('');
  };

  return (
    <div className="min-h-screen px-4 py-10" style={{ background: 'var(--color-surface-0)' }}>
      <div className="mx-auto max-w-2xl glass-card p-6">
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          דיווח ציבורי פתוח
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
          כל דיווח פתוח לציבור לפי מיקום. עירייה יכולה לאמץ ולטפל אם תרצה.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">קטגוריה</label>
            <input className="input" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">תיאור</label>
            <textarea
              className="textarea"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="מה הבעיה שראית?"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">כתובת (אופציונלי)</label>
            <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Latitude</label>
              <input className="input" value={latitude} onChange={(e) => setLatitude(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm mb-1">Longitude</label>
              <input className="input" value={longitude} onChange={(e) => setLongitude(e.target.value)} />
            </div>
          </div>

          <button className="btn-primary w-full justify-center" onClick={submit} disabled={submitting}>
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            שלח דיווח
          </button>
        </div>

        {statusText && (
          <div className="mt-4 rounded-lg p-3 text-sm" style={{ background: 'var(--color-surface-2)' }}>
            {statusText}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <Link href="/map" className="btn-secondary">
            <MapPin size={14} />
            צפייה בדיווחים ציבוריים
          </Link>
          <Link href="/" className="btn-secondary">
            חזרה לדף הבית
          </Link>
        </div>
      </div>
    </div>
  );
}

