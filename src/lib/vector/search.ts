import { vectorIndex, VectorDocument } from './client';
import { SearchResult } from '@/types';

export async function semanticSearch(
  query: string,
  limit: number = 5
): Promise<SearchResult[]> {
  try {
    const results = await vectorIndex.query({
      data: query,
      topK: limit,
      includeMetadata: true,
    });

    return results.map((result) => ({
      id: result.id,
      score: result.score,
      text: result.metadata?.text || '',
      metadata: {
        title: result.metadata?.title || '',
        url: result.metadata?.url || '',
        chunk: result.metadata?.chunk || 0,
      },
    }));
  } catch (error) {
    console.error('Vector search error:', error);
    return [];
  }
}

export async function getContextFromSearch(
  query: string,
  maxLength: number = 2000
): Promise<string> {
  const results = await semanticSearch(query, 3);
  
  if (results.length === 0) {
    return '';
  }

  const context = results
    .map((r) => r.text)
    .join('\n\n')
    .slice(0, maxLength);

  return context;
}

export async function addDocument(document: VectorDocument): Promise<void> {
  await vectorIndex.upsert({
    id: document.id,
    data: document.text,
    metadata: document.metadata,
  });
}

export async function deleteDocument(id: string): Promise<void> {
  await vectorIndex.delete(id);
}

export async function resetIndex(): Promise<void> {
  await vectorIndex.reset();
}
