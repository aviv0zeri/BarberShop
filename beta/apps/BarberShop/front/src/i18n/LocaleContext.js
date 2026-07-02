import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { STR } from './strings';

const LocaleContext = createContext(null);

export function LocaleProvider({ children, initialLang = 'he' }) {
  const [lang, setLang] = useState(initialLang);

  const toggleLang = useCallback(() => {
    setLang((prev) => (prev === 'he' ? 'en' : 'he'));
  }, []);

  const value = useMemo(
    () => ({
      lang,
      rtl: lang === 'he',
      t: STR[lang] ?? STR.he,
      setLang,
      toggleLang,
    }),
    [lang, toggleLang],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}
