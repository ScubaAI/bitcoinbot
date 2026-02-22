import Groq from 'groq-sdk';
import { redis } from '@/lib/redis'; // Si tienes circuit breaker distribuido

// ============================================================================
// CONFIGURACIÓN Y VALIDACIÓN
// ============================================================================

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const isProduction = process.env.NODE_ENV === 'production';
const isGroqEnabled = !!GROQ_API_KEY;

if (!isGroqEnabled && isProduction) {
  throw new Error('GROQ_API_KEY is required in production');
}

if (!isGroqEnabled) {
  console.warn('⚠️ GROQ_API_KEY missing - AI features disabled');
}

const groq = isGroqEnabled ? new Groq({ apiKey: GROQ_API_KEY }) : null;

const DEFAULT_MODEL = 'llama-3.3-70b-versatile';
const MAX_INPUT_CHARS = 15000;
const GROQ_TIMEOUT_MS = 10000;
const MAX_RETRIES = 2;

// ============================================================================
// TIPOS
// ============================================================================

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatOptions {
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
}

// ============================================================================
// SYSTEM PROMPT
// ============================================================================

export const BITCOIN_SYSTEM_PROMPT = `You are Bitcoin Agent...`;

// ============================================================================
// HELPERS DE SEGURIDAD
// ============================================================================

function assertGroqEnabled(): asserts groq is Groq {
  if (!groq) {
    throw new Error('Groq client not configured');
  }
}

function validateMessages(messages: ChatMessage[]): void {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('Messages must be non-empty array');
  }

  messages.forEach((m, i) => {
    if (!['user', 'assistant', 'system'].includes(m.role)) {
      throw new Error(`Invalid role at ${i}: ${m.role}`);
    }
    if (typeof m.content !== 'string' || !m.content.trim()) {
      throw new Error(`Invalid content at ${i}`);
    }
  });
}

function safeErrorLog(context: string, error: any) {
  const safe = {
    status: error?.status,
    message: error?.message?.replace(/key-[a-zA-Z0-9]+/gi, '[REDACTED]'),
    type: error?.type,
  };
  console.error(`[GroqClient] ${context}:`, safe);
}

async function withRetry<T>(operation: () => Promise<T>, retries = MAX_RETRIES): Promise<T> {
  let lastError: any;
  for (let i = 0; i <= retries; i++) {
    try {
      return await operation();
    } catch (err: any) {
      lastError = err;
      const isRetryable = !err?.status || err.status === 429 || err.status >= 500;
      if (!isRetryable || i === retries) throw err;
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
    }
  }
  throw lastError;
}

// ============================================================================
// STREAMING CHAT
// ============================================================================

export async function* streamChat(options: ChatOptions) {
  try {
    assertGroqEnabled();
    validateMessages(options.messages);
  } catch (err: any) {
    yield `[Error: ${err.message}]`;
    return;
  }

  const { messages, temperature = 0.7, max_tokens = 2048 } = options;
  const totalChars = messages.reduce((acc, m) => acc + m.content.length, 0);

  if (totalChars > MAX_INPUT_CHARS) {
    yield "[Error: Contexto demasiado largo. Inicia nueva conversación.]";
    return;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GROQ_TIMEOUT_MS);

  try {
    const stream = await withRetry(() => 
      groq.chat.completions.create({
        model: DEFAULT_MODEL,
        messages,
        temperature,
        max_tokens,
        stream: true,
        signal: controller.signal as any, // Groq SDK puede requerir cast
      })
    );

    for await (const chunk of stream) {
      clearTimeout(timeoutId); // Reset timeout en cada chunk
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) yield content;
    }
  } catch (error: any) {
    safeErrorLog('Streaming error', error);
    
    if (error?.name === 'AbortError') {
      yield "\n[⚠️ El agente tardó demasiado. Intenta una pregunta más corta.]";
    } else if (error?.status === 429) {
      yield "\n[⚠️ Demasiadas solicitudes. Espera un momento.]";
    } else if (error?.status === 401) {
      yield "\n[⚠️ Error de autenticación. Contacta al admin.]";
    } else {
      yield "\n[⚠️ Error procesando tu solicitud.]";
    }
  } finally {
    clearTimeout(timeoutId);
  }
}

// ============================================================================
// NON-STREAMING CHAT
// ============================================================================

export async function chat(options: ChatOptions): Promise<string> {
  assertGroqEnabled();
  validateMessages(options.messages);

  const { messages, temperature = 0.7, max_tokens = 2048 } = options;
  const totalChars = messages.reduce((acc, m) => acc + m.content.length, 0);

  if (totalChars > MAX_INPUT_CHARS) {
    throw new Error('Input too large');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GROQ_TIMEOUT_MS);

  try {
    const completion = await withRetry(() =>
      groq.chat.completions.create({
        model: DEFAULT_MODEL,
        messages,
        temperature,
        max_tokens,
        signal: controller.signal as any,
      })
    );

    return completion.choices[0]?.message?.content || '';
  } catch (error: any) {
    safeErrorLog('Chat error', error);
    throw new Error('AI service unavailable');
  } finally {
    clearTimeout(timeoutId);
  }
}