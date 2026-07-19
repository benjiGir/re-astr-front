import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import translation files
import translationFR from './locales/fr/translation.json'
import commonFR from './locales/fr/common.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: {
        translation: translationFR,
        common: commonFR,
      },
    },
    fallbackLng: 'fr',
    defaultNS: 'translation',
    ns: ['translation', 'common'],
    debug: import.meta.env.DEV,
    interpolation: {
      escapeValue: false, // React already escapes
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    react: {
      useSuspense: true,
    },
  })

export default i18n
