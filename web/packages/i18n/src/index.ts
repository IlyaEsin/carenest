import i18next, { type i18n } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { namespaces, resources } from './resources';

export const languages = ['ru', 'en'] as const;

export type Language = (typeof languages)[number];

export const defaultLanguage: Language = 'en';

export function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && (languages as readonly string[]).includes(value);
}

export function toLanguage(value: string | undefined): Language {
  return isLanguage(value) ? value : defaultLanguage;
}

export function detectBrowserLanguage(preferred: readonly string[] = navigator.languages): Language {
  for (const tag of preferred) {
    const base = tag.toLowerCase().split('-')[0];
    if (isLanguage(base)) {
      return base;
    }
  }

  return defaultLanguage;
}

// Keys are flat ("email.submit"), so the key separator is off and error codes with dots stay single keys.
export function createI18n(language: Language): i18n {
  const instance = i18next.createInstance();
  void instance.use(initReactI18next).init({
    resources,
    lng: language,
    fallbackLng: defaultLanguage,
    supportedLngs: languages,
    ns: namespaces,
    defaultNS: 'common',
    keySeparator: false,
    interpolation: { escapeValue: false },
    initAsync: false,
  });
  return instance;
}

export { detectTimeZone, formatDateTime, formatLocalTime } from './format';
export { namespaces, resources, type Namespace } from './resources';
