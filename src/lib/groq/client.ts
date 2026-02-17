import Groq from 'groq-sdk';

// Validación de env var
if (!process.env.GROQ_API_KEY) {
  throw new Error('GROQ_API_KEY is not defined');
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Modelo actualizado - llama-3.3-70b-versatile es el más capaz actualmente
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

// Tipo simplificado para la API
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatOptions {
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
}

export const BITCOIN_SYSTEM_PROMPT = `You are Bitcoin Agent, an AI assistant specialized in Bitcoin and Lightning Network technology...`;

/**
 * Streaming chat con Groq - versión generadora
 */
export async function* streamChat(options: ChatOptions) {
  const { messages, temperature = 0.7, max_tokens = 2048 } = options;

  try {
    const stream = await groq.chat.completions.create({
      model: DEFAULT_MODEL,
      messages,
      temperature,
      max_tokens,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        yield content;
      }
    }
  } catch (error) {
    console.error('Groq streaming error:', error);
    throw new Error('Failed to stream response from AI');
  }
}

/**
 * Chat no-streaming (para RAG o procesamiento interno)
 */
export async function chat(options: ChatOptions): Promise<string> {
  const { messages, temperature = 0.7, max_tokens = 2048 } = options;

  try {
    const completion = await groq.chat.completions.create({
      model: DEFAULT_MODEL,
      messages,
      temperature,
      max_tokens,
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Groq API error:', error);
    throw new Error('Failed to get response from AI');
  }
}