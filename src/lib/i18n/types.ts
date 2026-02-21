import en from './en.json';

export type TranslationKeys = typeof en & {
  markets?: {
    networkHealth?: string;
  };
};
export type Locale = 'en' | 'es';

// Helper type for nested keys
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
