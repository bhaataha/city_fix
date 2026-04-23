'use client';
import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronRight, PenTool, RotateCcw, Download, Check, Trash2 } from 'lucide-react';

export default function SignaturePage() {
  const { tenant } = useParams();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    ctx.strokeStyle = '#A5B4FC';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDraw = () => setIsDrawing(false);

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    setSaved(false);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) return;
    const dataUrl = canvas.toDataURL('image/png');
    localStorage.setItem('cityfix_signature', dataUrl);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const downloadSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) return;
    const link = document.createElement('a');
    link.download = 'signature.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface-0)' }}>
      <header className="px-6 py-4 flex items-center gap-3" style={{ background: 'rgba(11,15,26,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--color-border)' }}>
        <Link href={`/${tenant}`} className="p-2 rounded-lg" style={{ background: 'var(--color-surface-2)' }}>
          <ChevronRight size={18} style={{ color: 'var(--color-text-secondary)' }} />
        </Link>
        <PenTool size={20} style={{ color: '#818CF8' }} />
        <h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>חתימה דיגיטלית</h1>
      </header>
      <div className="max-w-2xl mx-auto px-6 py-6 space-y-6">
        <div className="glass-card p-4">
          <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>
            חתימה דיגיטלית נדרשת לצורך הגשת תביעות תשתית ותצהירים רשמיים.
          </p>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            חתמו באמצעות העכבר או המגע בשטח הלבן למטה.
          </p>
        </div>

        {/* Canvas */}
        <div className="glass-card p-2 overflow-hidden">
          <div className="text-xs font-semibold mb-2 px-2" style={{ color: 'var(--color-text-muted)' }}>
            חתמו כאן ↓
          </div>
          <canvas
            ref={canvasRef}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={stopDraw}
            className="w-full rounded-lg"
            style={{
              height: 200,
              background: 'rgba(255,255,255,0.03)',
              border: '2px dashed var(--color-border)',
              cursor: 'crosshair',
              touchAction: 'none',
            }}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={clear} className="glass-card flex-1 py-3 flex items-center justify-center gap-2 text-sm font-semibold" style={{ color: '#F87171', cursor: 'pointer' }}>
            <Trash2 size={16} /> נקה
          </button>
          <button onClick={downloadSignature} disabled={!hasSignature} className="glass-card flex-1 py-3 flex items-center justify-center gap-2 text-sm font-semibold" style={{ color: hasSignature ? '#818CF8' : 'var(--color-text-muted)', cursor: hasSignature ? 'pointer' : 'not-allowed', opacity: hasSignature ? 1 : 0.5 }}>
            <Download size={16} /> הורד
          </button>
          <button onClick={saveSignature} disabled={!hasSignature} className="flex-1 py-3 flex items-center justify-center gap-2 text-sm font-bold rounded-xl" style={{ background: hasSignature ? 'var(--color-primary)' : 'var(--color-surface-2)', color: hasSignature ? 'white' : 'var(--color-text-muted)', cursor: hasSignature ? 'pointer' : 'not-allowed' }}>
            <Check size={16} /> {saved ? '✓ נשמר!' : 'שמור'}
          </button>
        </div>

        {/* Info */}
        <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
          <PenTool size={18} color="#818CF8" className="flex-shrink-0 mt-0.5" />
          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            החתימה נשמרת מקומית במכשיר שלכם ומצורפת אוטומטית בעת הגשת תביעה או תצהיר דרך המערכת.
          </div>
        </div>
      </div>
    </div>
  );
}
