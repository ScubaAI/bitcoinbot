// Message types for chat
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: Date;
}

// Chat request/response types
export interface ChatRequest {
  messages: Message[];
  lang: 'en' | 'es';
}

export interface ChatResponse {
  message: string;
  sources?: Source[];
}

export interface Source {
  id: string;
  content: string;
  metadata: {
    title: string;
    url: string;
  };
}

// RAG search types
export interface SearchRequest {
  query: string;
  limit?: number;
}

export interface SearchResponse {
  results: SearchResult[];
}

export interface SearchResult {
  id: string;
  score: number;
  text: string;
  metadata: {
    title: string;
    url: string;
    chunk: number;
  };
}

// Tip/Donation types
export interface TipRequest {
  amount: number; // in satoshis
  recipient: string;
  message?: string;
}

export interface TipResponse {
  success: boolean;
  paymentRequest?: string;
  message?: string;
}

// i18n types
export type Locale = 'en' | 'es';

export interface TranslationKeys {
  hero: {
    title: string;
    subtitle: string;
    cta: string;
  };
  chat: {
    placeholder: string;
    thinking: string;
  };
  tip: {
    title: string;
    description: string;
    button: string;
  };
  footer: {
    resources: string;
    documentation: string;
    protocol: string;
  };
}

// Terminal types
export interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'system' | 'error';
  content: string;
  timestamp: Date;
}

// Component props types
export interface HeroSectionProps {
  lang: Locale;
}

export interface ChatInterfaceProps {
  lang: Locale;
}

export interface TerminalWindowProps {
  lines: TerminalLine[];
  onSubmit: (input: string) => void;
  isLoading?: boolean;
}

export interface TipJarProps {
  lang: Locale;
}

export interface FooterProps {
  lang: Locale;
}
