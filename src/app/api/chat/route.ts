import { NextRequest } from 'next/server';
import { streamChat, BITCOIN_SYSTEM_PROMPT } from '@/lib/groq/client';
import { searchWhitepaper } from '@/lib/vector/search';

// ⚠️ IMPORTANTE: Si usas Prisma para guardar mensajes, cambia a 'nodejs'
// Si solo usas Upstash (Redis/Vector), 'edge' funciona bien
export const runtime = 'edge';

// 🚀 System prompt evolutivo
const ENHANCED_SYSTEM_PROMPT = `¡Hola! Soy tu guía geek del Bitcoin Whitepaper 🧙‍♂️✨

Mi misión es ayudarte a entender Bitcoin desde sus raíces cypherpunk hasta sus evoluciones más recientes...

${BITCOIN_SYSTEM_PROMPT}`;

export async function POST(request: NextRequest) {
  try {
    const { messages, useRAG = true } = await request.json();

    // Validación robusta
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json(
        { error: '¡Ups! Los mensajes no son válidos 🤔' }, 
        { status: 400 }
      );
    }

    // Validar estructura de mensajes
    const validMessages = messages.every(
      (m: any) => 
        typeof m === 'object' && 
        ['user', 'assistant', 'system'].includes(m.role) &&
        typeof m.content === 'string'
    );

    if (!validMessages) {
      return Response.json(
        { error: 'Formato de mensajes incorrecto' }, 
        { status: 400 }
      );
    }

    // Construir system prompt con contexto RAG (async)
    let systemPrompt = ENHANCED_SYSTEM_PROMPT;
    let sources: any[] = [];

    if (useRAG) {
      const lastUserMessage = messages
        .filter((m: any) => m.role === 'user')
        .pop();

      if (lastUserMessage?.content) {
        try {
          // Timeout para no bloquear demasiado
          const ragPromise = Promise.race([
            searchWhitepaper(lastUserMessage.content, 3),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('RAG timeout')), 2000)
            )
          ]);
          
          const relevantDocs = await ragPromise as any[];
          
          if (relevantDocs?.length > 0) {
            const contextText = relevantDocs
              .map((r, i) => `[${i + 1}] ${r.metadata?.text || r.text || ''}`)
              .join('\n\n');
            
            systemPrompt += `\n\n📜 Contexto relevante del whitepaper:\n${contextText}\n\nUsa estas citas como anclaje histórico cuando sea relevante.`;
            sources = relevantDocs;
          }
        } catch (ragError) {
          console.warn('RAG search failed, continuing without context:', ragError);
          // Continuar sin RAG si falla
        }
      }
    }

    // Preparar mensajes para Groq
    const groqMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
      })),
    ];

    // Streaming desde Groq
    const stream = streamChat({
      messages: groqMessages,
      temperature: 0.85,
      max_tokens: 2048,
    });

    // Convertir AsyncGenerator a ReadableStream
    const encoder = new TextEncoder();
    let isClosed = false;

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (isClosed) break;
            controller.enqueue(encoder.encode(chunk));
          }
        } catch (error) {
          console.error('Stream error:', error);
          if (!isClosed) {
            controller.error(error);
          }
        } finally {
          if (!isClosed) {
            controller.close();
            isClosed = true;
          }
        }
      },
      cancel() {
        isClosed = true;
      }
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'X-Accel-Buffering': 'no', // Desactivar buffering de nginx
        'X-Bitcoin-Agent': '⚡ Whitepaper Roots, Open Branches ⚡',
      },
    });
    
  } catch (error) {
    console.error('Chat API error:', error);
    return Response.json(
      { error: '¡Error crítico! Alguien intentó un 51% attack en mi código 😅' }, 
      { status: 500 }
    );
  }
}