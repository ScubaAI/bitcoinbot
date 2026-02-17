import { getVectorIndex } from './client';
import { SearchResult } from '@/types';

// Interfaz para documentos que upserteas
export interface VectorDocument {
  id: string;
  text: string;
  metadata: {
    title: string;
    url: string;
    chunk: number;
    [key: string]: any;
  };
}

/**
 * Búsqueda semántica en el índice vectorial
 */
export async function searchWhitepaper(
  query: string,
  limit: number = 5
): Promise<SearchResult[]> {
  if (!query.trim()) {
    return [];
  }

  try {
    const index = getVectorIndex();
    
    const results = await index.query({
      data: query,
      topK: limit,
      includeMetadata: true,
    });

    if (!results || results.length === 0) {
      return [];
    }

    return results.map((result) => ({
      id: String(result.id),
      score: result.score,
      text: String(result.metadata?.text || ''),
      metadata: {
        title: String(result.metadata?.title || 'Whitepaper'),
        url: String(result.metadata?.url || 'https://bitcoin.org/bitcoin.pdf'),
        chunk: Number(result.metadata?.chunk || 0),
      },
    }));
  } catch (error) {
    console.error('Vector search error:', error);
    // Fail silently para no romper el chat si RAG falla
    return [];
  }
}

/**
 * Obtiene contexto formateado para el prompt
 */
export async function getContextFromSearch(
  query: string,
  maxLength: number = 2000
): Promise<string> {
  try {
    const results = await searchWhitepaper(query, 3);
    
    if (results.length === 0) {
      return '';
    }

    return results
      .map((r, i) => `[${i + 1}] ${r.text}`)
      .join('\n\n')
      .slice(0, maxLength);
  } catch {
    return '';
  }
}

/**
 * Admin functions - solo usar en scripts o API routes protegidos
 */
export async function addDocument(document: VectorDocument): Promise<void> {
  const index = getVectorIndex();
  await index.upsert({
    id: document.id,
    data: document.text,
    metadata: document.metadata,
  });
}

export async function deleteDocument(id: string): Promise<void> {
  await getVectorIndex().delete(id);
}

export async function resetIndex(): Promise<void> {
  await getVectorIndex().reset();
}