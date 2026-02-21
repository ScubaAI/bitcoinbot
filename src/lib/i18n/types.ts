import en from './en.json';

// Tipo para los timeframes
type Timeframes = {
  '24h': string;
  '7d': string;
  '30d': string;
};

// Tipo completo para markets - COINCIDE CON TUS JSON
type MarketsTranslation = {
  title: string;
  subtitle: string;
  price: string;
  marketCap: string;
  hashRate: string;        // ← mayúscula R, no hashrate
  networkHealth: string;
  change24h: string;       // ← agregado
  volume: string;          // ← agregado
  dominance: string;       // ← agregado
  source: string;          // ← agregado
  timeframes: Timeframes;
  disclaimer?: string;
  hashrate?: string;
  supply: string;
  ath: string;
  fromATH: string;
};

// Tipo principal
export type TranslationKeys = typeof en & {
  markets: MarketsTranslation;
};

export type Locale = 'en' | 'es';

// Helper type
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};