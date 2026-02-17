import { Index } from '@upstash/vector';
import { createClient } from '@upstash/redis';
import { SearchResult } from '@/types';

export interface VectorDocument {
  id: string;
  text: string;
  metadata: {
    title: string;
    url: string;
    chunk: number;
  };
}

// Initialize Upstash Vector index
export const vectorIndex = new Index<VectorDocument>({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
});

// Initialize Upstash Redis for chat history
export const redis = createClient({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function getChatHistory(
  sessionId: string,
  limit: number = 10
): Promise<{ role: string; content: string }[]> {
  const key = `chat:${sessionId}:history`;
  const history = await redis.lrange(key, 0, limit - 1);
  return history.map((item: string) => JSON.parse(item));
}

export async function addToChatHistory(
  sessionId: string,
  message: { role: string; content: string }
): Promise<void> {
  const key = `chat:${sessionId}:history`;
  await redis.rpush(key, JSON.stringify(message));
  
  // Keep only last 50 messages
  await redis.ltrim(key, -50, -1);
  
  // Set expiry to 24 hours
  await redis.expire(key, 86400);
}

export async function clearChatHistory(sessionId: string): Promise<void> {
  const key = `chat:${sessionId}:history`;
  await redis.del(key);
}
