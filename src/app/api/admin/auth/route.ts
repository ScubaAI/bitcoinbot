import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

// ============================================================================
// Configuration
// ============================================================================

const SESSION_DURATION = 3600; // 1 hour
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 900; // 15 minutes
const TIMING_DELAY_MS = 150; // Anti-timing attack delay

// ============================================================================
// Safe Redis Wrapper (Local)
// ============================================================================

async function safeRedis<T>(operation: () => Promise<T>, fallback: T): Promise<T> {
    const isNoOp = !process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN;
    
    if (isNoOp) {
        return fallback;
    }
    
    try {
        return await operation();
    } catch (error) {
        console.error('Redis error:', error);
        return fallback;
    }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Extracts client IP from request headers
 */
function extractClientIP(request: NextRequest): string {
    // Check various headers for real IP
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        // Take the last IP in the chain (most reliable)
        const ips = forwarded.split(',').map(ip => ip.trim());
        return ips[ips.length - 1] || 'unknown';
    }
    
    return request.headers.get('x-real-ip') 
        || request.headers.get('cf-connecting-ip')
        || 'unknown';
}

/**
 * Validates API key format (basic check)
 */
function isValidApiKeyFormat(key: string): boolean {
    // API keys should be alphanumeric with underscores, minimum 20 chars
    return /^API_KEY_[A-Za-z0-9_]{15,}$/.test(key);
}

/**
 * Constant-time comparison to prevent timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    
    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
}

/**
 * Adds a delay to normalize response times
 */
async function normalizeTiming(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, TIMING_DELAY_MS));
}

// ============================================================================
// POST /api/admin/auth - Authenticate with API Key
// ============================================================================

export async function POST(request: NextRequest) {
    const ip = extractClientIP(request);
    
    try {
        // Check rate limiting
        const rateLimitResult = await safeRedis(
            async () => {
                const key = `btc:auth:attempts:${ip}`;
                const attempts = await redis.incr(key);
                
                if (attempts === 1) {
                    await redis.expire(key, LOCKOUT_DURATION);
                }
                
                if (attempts > MAX_ATTEMPTS) {
                    const ttl = await redis.ttl(key);
                    return { allowed: false, remaining: 0, locked: true, lockoutTtl: ttl };
                }
                
                return { allowed: true, remaining: MAX_ATTEMPTS - attempts, locked: false };
            },
            { allowed: true, remaining: MAX_ATTEMPTS, locked: false }
        );
        
        if (!rateLimitResult.allowed) {
            await normalizeTiming();
            
            if (rateLimitResult.locked) {
                return NextResponse.json(
                    { error: 'Account temporarily locked', remaining: 0 },
                    { 
                        status: 423,
                        headers: { 'Retry-After': String(rateLimitResult.lockoutTtl || LOCKOUT_DURATION) }
                    }
                );
            }
            
            return NextResponse.json(
                { error: 'Too many attempts', remaining: 0 },
                { status: 429 }
            );
        }
        
        // Parse request body
        const contentType = request.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
            return NextResponse.json(
                { error: 'Unsupported media type' },
                { status: 415 }
            );
        }
        
        const body = await request.json();
        const { key } = body;
        
        // Validate key presence
        if (!key || typeof key !== 'string') {
            await normalizeTiming();
            return NextResponse.json(
                { error: 'Authentication required', remaining: rateLimitResult.remaining - 1 },
                { status: 401 }
            );
        }
        
        // Validate key format
        if (!isValidApiKeyFormat(key)) {
            await normalizeTiming();
            return NextResponse.json(
                { error: 'Authentication failed', remaining: rateLimitResult.remaining - 1 },
                { status: 401 }
            );
        }
        
        // Get valid API key from environment
        const validKey = process.env.ADMIN_API_KEY;
        
        if (!validKey) {
            console.error('ADMIN_API_KEY not configured');
            await normalizeTiming();
            return NextResponse.json(
                { error: 'Internal error' },
                { status: 500 }
            );
        }
        
        // Timing-safe comparison
        const isValid = timingSafeEqual(key, validKey);
        
        if (!isValid) {
            await normalizeTiming();
            return NextResponse.json(
                { error: 'Authentication failed', remaining: rateLimitResult.remaining - 1 },
                { status: 401 }
            );
        }
        
        // Reset rate limit on successful auth
        await safeRedis(
            async () => redis.del(`btc:auth:attempts:${ip}`),
            null
        );
        
        // Generate session token
        const sessionToken = crypto.randomUUID();
        const sessionData = {
            ip,
            createdAt: Date.now(),
        };
        
        // Store session in Redis
        await safeRedis(
            async () => redis.setex(
                `btc:auth:session:${sessionToken}`,
                SESSION_DURATION,
                JSON.stringify(sessionData)
            ),
            null
        );
        
        await normalizeTiming();
        
        return NextResponse.json({
            success: true,
            token: sessionToken,
            expiresIn: SESSION_DURATION,
        });
        
    } catch (error) {
        console.error('Auth error:', error);
        await normalizeTiming();
        return NextResponse.json(
            { error: 'Internal error' },
            { status: 500 }
        );
    }
}

// ============================================================================
// GET /api/admin/auth - Verify Session
// ============================================================================

export async function GET(request: NextRequest) {
    const token = request.headers.get('X-Session-Token');
    
    if (!token) {
        return NextResponse.json(
            { valid: false, error: 'No session token provided' },
            { status: 401 }
        );
    }
    
    try {
        const sessionKey = `btc:auth:session:${token}`;
        const sessionData = await safeRedis<string | null>(
            async () => redis.get(sessionKey),
            null
        );
        
        if (!sessionData) {
            return NextResponse.json(
                { valid: false, error: 'Session expired or invalid' },
                { status: 401 }
            );
        }
        
        const session = JSON.parse(sessionData);
        const ttl = await safeRedis(
            async () => redis.ttl(sessionKey),
            0
        );
        
        // Extend session if about to expire (< 5 minutes)
        if (ttl > 0 && ttl < 300) {
            await safeRedis(
                async () => redis.expire(sessionKey, SESSION_DURATION),
                null
            );
        }
        
        return NextResponse.json({
            valid: true,
            expiresIn: ttl > 0 ? ttl : SESSION_DURATION,
        });
        
    } catch (error) {
        console.error('Session verification error:', error);
        return NextResponse.json(
            { valid: false, error: 'Internal error' },
            { status: 500 }
        );
    }
}

// ============================================================================
// DELETE /api/admin/auth - Logout
// ============================================================================

export async function DELETE(request: NextRequest) {
    const token = request.headers.get('X-Session-Token');
    
    if (!token) {
        // Idempotent: return success even without token
        return NextResponse.json({ success: true });
    }
    
    try {
        await safeRedis(
            async () => redis.del(`btc:auth:session:${token}`),
            null
        );
        
        return NextResponse.json({ success: true });
        
    } catch (error) {
        console.error('Logout error:', error);
        // Still return success for idempotency
        return NextResponse.json({ success: true });
    }
}
