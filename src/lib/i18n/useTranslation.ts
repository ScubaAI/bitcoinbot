import en from './en.json';
import es from './es.json';

const translations = { en, es };

export function useTranslation(lang: 'en' | 'es') {
  return translations[lang];
}

// Helper type for accessing nested translations
export function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((acc, part) => acc?.[part], obj) || path;
}