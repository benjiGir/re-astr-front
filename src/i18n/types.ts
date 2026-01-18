import 'react-i18next'
import type translation from './locales/fr/translation.json'
import type common from './locales/fr/common.json'

declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation'
    resources: {
      translation: typeof translation
      common: typeof common
    }
  }
}