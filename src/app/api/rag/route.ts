import { NextRequest, NextResponse } from 'next/server';
import { searchWhitepaper } from '@/lib/vector/search';
import { SearchResult } from '@/types';

export interface SearchResponse {
  results: SearchResult[];
  query: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, limit = 5 } = body as {
      query: string;
      limit?: number;
    };

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query inválida 🤔. Envía un string válido.' },
        { status: 400 }
      );
    }

    const results = await searchWhitepaper(query, limit);

    const response: SearchResponse = {
      results,
      query,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('RAG API error:', error);
    return NextResponse.json(
      { error: 'La búsqueda vectorial falló. ¿El nodo está sincronizado? 😅' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';