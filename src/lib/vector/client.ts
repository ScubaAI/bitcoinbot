// src/lib/vector/client.ts
import { Index } from '@upstash/vector';

let vectorIndex: Index | null = null;

export function getVectorIndex(): Index {
  if (!vectorIndex) {
    if (!process.env.UPSTASH_VECTOR_REST_URL) {
      throw new Error('UPSTASH_VECTOR_REST_URL is missing!');
    }
    if (!process.env.UPSTASH_VECTOR_REST_TOKEN) {
      throw new Error('UPSTASH_VECTOR_REST_TOKEN is missing!');
    }

    vectorIndex = new Index({
      url: process.env.UPSTASH_VECTOR_REST_URL,
      token: process.env.UPSTASH_VECTOR_REST_TOKEN,
    });
  }
  return vectorIndex;
}