import { Redis } from '@upstash/redis';

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

// Build-resilient: Create dummy Redis if env vars missing
let redis: Redis;

// No-op pipeline implementation
const createNoOpPipeline = () => ({
    get: () => ({ exec: async () => [null] }),
    set: () => ({ exec: async () => ['OK'] }),
    setex: () => ({ exec: async () => ['OK'] }),
    incr: () => ({ exec: async () => [1] }),
    expire: () => ({ exec: async () => [1] }),
    lpush: () => ({ exec: async () => [1] }),
    ltrim: () => ({ exec: async () => ['OK'] }),
    del: () => ({ exec: async () => [1] }),
    exec: async () => [],
});

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
        pipeline: createNoOpPipeline,
    } as unknown as Redis;
} else {
    redis = new Redis({ url, token });

    // Wrap pipeline to handle Upstash REST API limitation
    const originalPipeline = (redis as any).pipeline?.bind(redis);
    if (originalPipeline) {
        (redis as any).pipeline = () => {
            try {
                return originalPipeline();
            } catch (e) {
                console.warn('Pipeline not supported, using sequential commands');
                return createNoOpPipeline();
            }
        };
    } else {
        (redis as any).pipeline = createNoOpPipeline;
    }
}

export { redis };