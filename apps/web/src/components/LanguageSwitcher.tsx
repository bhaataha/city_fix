'use client';

import { Globe2 } from 'lucide-react';
import { LANGUAGES, type Language } from '@/lib/i18n';
import { useI18n } from '@/lib/useI18n';

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage, t } = useI18n();

  return (
    <label
      className="language-switcher"
      aria-label={t('language.label')}
      title={t('language.label')}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        border: '1px solid rgba(99,102,241,0.16)',
        borderRadius: 12,
        padding: compact ? '7px 9px' : '8px 12px',
        background: 'rgba(23,31,56,0.82)',
        color: 'var(--color-text-primary)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <Globe2 size={16} aria-hidden="true" style={{ color: '#A5B4FC', flexShrink: 0 }} />
      <span className="sr-only">{t('language.label')}</span>
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value as Language)}
        style={{
          appearance: 'none',
          border: 0,
          outline: 0,
          background: 'transparent',
          color: 'inherit',
          fontSize: compact ? 12 : 14,
          fontWeight: 700,
          cursor: 'pointer',
          minWidth: compact ? 74 : 92,
        }}
      >
        {LANGUAGES.map((item) => (
          <option key={item.code} value={item.code} style={{ color: '#0F1629' }}>
            {item.nativeName}
          </option>
        ))}
      </select>
    </label>
  );
}
