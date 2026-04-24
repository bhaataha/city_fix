'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  getLanguageDirection,
  isLanguage,
  translate,
  type Language,
  type TranslationKey,
} from './i18n';

function readStoredLanguage(): Language {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return isLanguage(stored) ? stored : DEFAULT_LANGUAGE;
}

export function useI18n() {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);

  useEffect(() => {
    setLanguageState(readStoredLanguage());
  }, []);

  useEffect(() => {
    const dir = getLanguageDirection(language);
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }, [language]);

  return useMemo(() => {
    const dir = getLanguageDirection(language);
    return {
      language,
      dir,
      setLanguage: setLanguageState,
      t: (key: TranslationKey, values?: Record<string, string | number>) => translate(language, key, values),
    };
  }, [language]);
}
