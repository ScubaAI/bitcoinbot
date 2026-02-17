// Chat message - versión minimal para la API
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Para la UI (con metadata extra)
export interface Message extends ChatMessage {
  id: string;
  createdAt: Date;
  sources?: Source[];
}

// Source for RAG
export interface Source {
  id: string;
  content: string;
  score?: number;
  metadata: {
    title: string;
    url: string;
    chunk?: number;
  };
}

// API Types
export interface ChatRequest {
  messages: ChatMessage[];
  useRAG?: boolean;
  lang?: 'en' | 'es';
}

export interface ChatResponse {
  message: string;
  sources?: Source[];
}

// RAG types
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
  amount: number; // satoshis
  message?: string;
}

export interface TipResponse {
  success: boolean;
  paymentRequest?: string;
  message?: string;
}

// i18n
export type Locale = 'en' | 'es';

// Component props
export interface ChatInterfaceProps {
  lang: Locale;
}

// Terminal types
export interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'system' | 'error';
  content: string;
  timestamp: Date;
}