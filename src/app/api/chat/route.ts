import { NextRequest, NextResponse } from 'next/server';
import { chat } from '@/lib/groq/client';
import { getContextFromSearch } from '@/lib/vector/search';
import { Message, ChatResponse } from '@/types';
import { Ratelimit } from '@upstash/ratelimit';
import { redis } from '@/lib/vector/client';

// Rate limiter: 10 requests per minute
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'),
});

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    const { success } = await ratelimit.limit(ip);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { messages, lang } = body as {
      messages: Message[];
      lang: 'en' | 'es';
    };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages array' },
        { status: 400 }
      );
    }

    // Get the last user message for RAG context
    const lastUserMessage = messages
      .filter((m) => m.role === 'user')
      .pop();

    let context = '';
    if (lastUserMessage) {
      // Search for relevant context in vector DB
      context = await getContextFromSearch(lastUserMessage.content);
    }

    // Get response from Groq
    const response = await chat({
      messages,
      context,
    });

    const chatResponse: ChatResponse = {
      message: response,
    };

    return NextResponse.json(chatResponse);
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}

// Enable streaming for better UX
export const runtime = 'edge';
