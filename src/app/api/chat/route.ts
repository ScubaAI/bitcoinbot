import { NextRequest } from 'next/server';
import { streamChat, BITCOIN_SYSTEM_PROMPT } from '@/lib/groq/client';
import { searchWhitepaper } from '@/lib/vector/search';

export const runtime = 'edge';

const ENHANCED_SYSTEM_PROMPT = `¡Hola! Soy **Bitcoin_Agent** 🧙‍♂️⚡, tu guía geek y cypherpunk del Bitcoin Whitepaper y todo su ecosistema.

**REGLAS DE FORMATO OBLIGATORIAS**:

- Responde **SIEMPRE en español claro y natural**.
- Usa **Markdown rico**: **negritas**, *cursiva*, \`código\`, listas (-), ### subtítulos, > citas.
- **Saltos de línea**: una línea en blanco entre párrafos. Máximo 3 líneas por párrafo.
- **Emojis relevantes**: ⚡ 🧱 📜 🔐 🛡️ ₿ 🔗 ✨ 🚀
- Estructura: 1) Gancho 2) Explicación corta 3) Puntos clave 4) Cierre + pregunta

**Personalidad**: Entusiasta cypherpunk, preciso técnico pero accesible.

${BITCOIN_SYSTEM_PROMPT}

**RAG**: Integra el contexto naturalmente, mantén este formato.`;

export async function POST(request: NextRequest) {
  try {
    const { messages, useRAG = true } = await request.json();

    if (!messages?.length) {
      return Response.json({ error: 'Mensajes inválidos' }, { status: 400 });
    }

    // Construir prompt con RAG
    let systemPrompt = ENHANCED_SYSTEM_PROMPT;
    
    if (useRAG) {
      const lastUserMsg = messages.filter((m: any) => m.role === 'user').pop();
      if (lastUserMsg?.content) {
        try {
          const docs = await Promise.race([
            searchWhitepaper(lastUserMsg.content, 3),
            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000))
          ]) as any[];
          
          if (docs?.length) {
            const context = docs.map((d, i) => `[${i+1}] ${d.metadata?.text || d.text || ''}`).join('\n\n');
            systemPrompt += `\n\n📜 Contexto:\n${context}`;
          }
        } catch (e) {
          console.warn('RAG failed:', e);
        }
      }
    }

    const groqMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ];

    // Streaming
    const stream = streamChat({
      messages: groqMessages,
      temperature: 0.8,
      max_tokens: 2048,
    });

    const encoder = new TextEncoder();
    
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            // Enviar chunk directamente (debe ser string)
            controller.enqueue(encoder.encode(chunk));
          }
        } catch (err) {
          console.error('Stream error:', err);
          controller.error(err);
        } finally {
          controller.close();
        }
      }
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
      },
    });

  } catch (error) {
    console.error('API error:', error);
    return Response.json({ error: 'Error interno' }, { status: 500 });
  }
}