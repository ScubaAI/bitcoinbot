import { Locale } from '@/types';

export const i18n = {
  defaultLocale: 'en' as Locale,
  locales: ['en', 'es'] as Locale[],
} as const;

export const dictionaries: Record<Locale, () => Promise<any>> = {
  en: () => import('./en.json').then((module) => module.default),
  es: () => import('./es.json').then((module) => module.default),
};

export async function getDictionary(locale: Locale) {
  return dictionaries[locale]();
}
