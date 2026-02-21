import en from './en.json';

// Tipo para los timeframes
type Timeframes = {
  '24h': string;
  '7d': string;
  '30d': string;
};

// Tipo completo para markets (sin opcionales)
type MarketsTranslation = {
  title: string;
  subtitle: string;
  disclaimer: string;
  price: string;
  marketCap: string;
  volume: string;
  dominance: string;
  hashrate: string;
  supply: string;
  ath: string;
  fromATH: string;
  source: string;
  timeframes: Timeframes;
  networkHealth: string;
};

// Tipo principal - ahora markets es requerido
export type TranslationKeys = typeof en & {
  markets: MarketsTranslation;
};

export type Locale = 'en' | 'es';

// Helper type para traducciones parciales (si las necesitas)
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};