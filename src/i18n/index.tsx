import React, { createContext, useContext, useState, useEffect } from 'react';
import en from './translations/en.json';
import te from './translations/te.json';
import hi from './translations/hi.json';
import { db } from '../db';

export type Language = 'en' | 'te' | 'hi';

const translations: Record<Language, any> = {
  en,
  te,
  hi,
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (keyPath: string, fallback?: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  language: 'en',
  setLanguage: async () => {},
  t: (key: string) => key,
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLangState] = useState<Language>('en');

  useEffect(() => {
    // Load persisted language from settings
    db.settings.get('current_settings').then((settings) => {
      if (settings?.language) {
        setLangState(settings.language);
      }
    }).catch(console.error);
  }, []);

  const setLanguage = async (newLang: Language) => {
    setLangState(newLang);
    try {
      const current = await db.settings.get('current_settings');
      if (current) {
        await db.settings.update('current_settings', { language: newLang });
      }
    } catch (e) {
      console.error('Failed to persist language', e);
    }
  };

  const t = (keyPath: string, fallback?: string): string => {
    const parts = keyPath.split('.');
    let cur: any = translations[language] || translations.en;

    for (const part of parts) {
      if (cur && typeof cur === 'object' && part in cur) {
        cur = cur[part];
      } else {
        // Fallback to English
        let fallbackCur: any = translations.en;
        for (const fbPart of parts) {
          if (fallbackCur && typeof fallbackCur === 'object' && fbPart in fallbackCur) {
            fallbackCur = fallbackCur[fbPart];
          } else {
            return fallback || keyPath;
          }
        }
        return typeof fallbackCur === 'string' ? fallbackCur : (fallback || keyPath);
      }
    }

    return typeof cur === 'string' ? cur : (fallback || keyPath);
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);
