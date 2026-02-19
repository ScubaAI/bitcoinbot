import { Redis } from '@upstash/redis';

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

// Build-resilient: Create dummy Redis if env vars missing
let redis: Redis;

if (!url || !token) {
    console.warn('⚠️ Redis not configured - using no-op mode for build');

    // No-op Redis for build time
    redis = {
        get: async () => null,
        set: async () => 'OK',
        setex: async () => 'OK',
        incr: async () => 1,
        expire: async () => 1,
        lpush: async () => 1,
        ltrim: async () => 'OK',
        publish: async () => 1,
        del: async () => 1,
    } as unknown as Redis;
} else {
    redis = new Redis({ url, token });
}

export { redis };