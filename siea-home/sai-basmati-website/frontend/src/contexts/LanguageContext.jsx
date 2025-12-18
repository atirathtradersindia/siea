import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../data/translations';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem('preferredLang') || 'en';
  });

  // Sync localStorage with currentLang immediately
  useEffect(() => {
    localStorage.setItem('preferredLang', currentLang);
  }, [currentLang]);

  const setLanguage = (lang) => {
    if (translations[lang]) {
      setCurrentLang(lang); // Immediate update
    } else {
      console.warn(`Language ${lang} not supported`);
    }
  };

  const t = (key) => {
    return translations[currentLang]?.[key] || key; // Fallback to key if translation missing
  };

  const value = {
    currentLang,
    setLanguage,
    t,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};