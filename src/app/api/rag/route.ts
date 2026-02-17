import { NextRequest, NextResponse } from 'next/server';
import { semanticSearch } from '@/lib/vector/search';
import { SearchResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, limit = 5 } = body as {
      query: string;
      limit?: number;
    };

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Invalid query parameter' },
        { status: 400 }
      );
    }

    const results = await semanticSearch(query, limit);

    const response: SearchResponse = {
      results,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('RAG API error:', error);
    return NextResponse.json(
      { error: 'Failed to search vector database' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
