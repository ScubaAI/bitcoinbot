import Groq from 'groq';
import { Message } from '@/types';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface ChatOptions {
  messages: Message[];
  context?: string;
  onChunk?: (chunk: string) => void;
}

export async function* chatStream(options: ChatOptions) {
  const { messages, context, onChunk } = options;

  const systemPrompt = getSystemPrompt(context);

  const stream = await groq.chat.completions.create({
    model: 'mixtral-8x7b-32768',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    ],
    temperature: 0.7,
    max_tokens: 2048,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    if (content) {
      onChunk?.(content);
      yield content;
    }
  }
}

export async function chat(options: ChatOptions): Promise<string> {
  const { messages, context } = options;

  const systemPrompt = getSystemPrompt(context);

  const completion = await groq.chat.completions.create({
    model: 'mixtral-8x7b-32768',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    ],
    temperature: 0.7,
    max_tokens: 2048,
  });

  return completion.choices[0]?.message?.content || '';
}

function getSystemPrompt(context?: string): string {
  const basePrompt = `You are Bitcoin Agent, an AI assistant specialized in Bitcoin and Lightning Network technology. 
Your role is to help users understand Bitcoin's technical architecture, including:
- Bitcoin protocol and consensus mechanisms
- Lightning Network and payment channels
- Mining and proof of work
- Wallet security and best practices
- On-chain vs off-chain transactions

Always provide accurate, educational information. When relevant, cite technical details and explain concepts clearly.
If you don't know something, admit it and suggest where to find more information.`;

  if (context) {
    return `${basePrompt}

Here is relevant context from the Bitcoin whitepaper and documentation:
${context}

Use this context to provide accurate, well-sourced answers.`;
  }

  return basePrompt;
}
