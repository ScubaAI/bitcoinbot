/**
 * Normie Bypass API
 * Bitcoin Agent Digital Immune System
 * 
 * Endpoint: POST /api/challenge/bypass
 * 
 * Emergency human verification for users who cannot complete PoW.
 * Heavily monitored and rate-limited to prevent abuse.
 * 
 * Philosophy: "Don't exclude, but verify intent"
 */

import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import crypto from 'crypto';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface BypassRequest {
    challengeId: string;
    reason: 'human-declared' | 'accessibility' | 'mobile-limitation' | 'urgency';
    timestamp: number;
    userAgent?: string;
    // Optional: simple proof of humanity (mousemove pattern, etc.)
    interactionData?: {
        mouseMovements?: number;
        timeOnPage?: number;
        clickPattern?: string;
    };
}

interface BypassResult {
    success: boolean;
    accessToken?: string;
    warning?: string;
    expiresIn?: number;
}

// ============================================================================
// SECURITY CONFIGURATION
// ============================================================================

const CONFIG = {
    // Strict rate limiting for bypass (much stricter than PoW)
    maxBypassPerIp: 3,           // 3 por día
    maxBypassPerSession: 1,      // 1 por sesión
    windowHours: 24,

    // Challenge expiration
    challengeTtl: 300,           // 5 minutos

    // Trust scoring
    baseTrustScore: 30,          // Bypass starts with low trust
    minInteractionTime: 3000,    // 3 segundos mínimo en página

    // Access token duration (shorter than PoW verification)
    tokenDuration: 1800,         // 30 minutos (vs 1 hora PoW)

    // Alert threshold
    alertThreshold: 2,           // Alertar después de 2 bypasses mismo IP
};

// ============================================================================
// RATE LIMITING (Strict controls)
// ============================================================================

async function checkBypassRateLimit(
    ip: string,
    sessionId?: string
): Promise<{ allowed: boolean; reason?: string }> {
    const dailyKey = `btc:bypass:daily:${ip}`;
    const sessionKey = sessionId ? `btc:bypass:session:${sessionId}` : null;

    try {
        // Check daily limit
        const dailyCount = await redis.get<number>(dailyKey) || 0;
        if (dailyCount >= CONFIG.maxBypassPerIp) {
            return {
                allowed: false,
                reason: `Daily bypass limit reached (${CONFIG.maxBypassPerIp} per ${CONFIG.windowHours}h)`,
            };
        }

        // Check session limit
        if (sessionKey) {
            const sessionCount = await redis.get<number>(sessionKey) || 0;
            if (sessionCount >= CONFIG.maxBypassPerSession) {
                return {
                    allowed: false,
                    reason: 'Session bypass limit reached. Complete PoW or wait.',
                };
            }
        }

        return { allowed: true };
    } catch (error) {
        console.error('Rate limit check error:', error);
        // Fail closed (security first)
        return { allowed: false, reason: 'Security check failed' };
    }
}

async function incrementBypassCounters(ip: string, sessionId?: string): Promise<void> {
    const dailyKey = `btc:bypass:daily:${ip}`;
    const sessionKey = sessionId ? `btc:bypass:session:${sessionId}` : null;

    try {
        // Increment daily counter
        const current = await redis.incr(dailyKey);
        if (current === 1) {
            await redis.expire(dailyKey, CONFIG.windowHours * 3600);
        }

        // Increment session counter
        if (sessionKey) {
            await redis.incr(sessionKey);
            await redis.expire(sessionKey, CONFIG.challengeTtl * 2);
        }
    } catch (error) {
        console.error('Counter increment error:', error);
    }
}

// ============================================================================
// CHALLENGE VALIDATION
// ============================================================================

async function validateChallenge(challengeId: string): Promise<{
    valid: boolean;
    difficulty?: number;
    reason?: string;
}> {
    try {
        const challengeKey = `btc:immune:challenge:${challengeId}`;
        const challengeData = await redis.get<string>(challengeKey);

        if (!challengeData) {
            return { valid: false, reason: 'Challenge not found or expired' };
        }

        const parsed = typeof challengeData === 'string' ? JSON.parse(challengeData) : challengeData;
        const age = (Date.now() - parsed.timestamp) / 1000;

        if (age > CONFIG.challengeTtl) {
            await redis.del(challengeKey);
            return { valid: false, reason: 'Challenge expired' };
        }

        return { valid: true, difficulty: parsed.difficulty };
    } catch (error) {
        console.error('Challenge validation error:', error);
        return { valid: false, reason: 'Validation failed' };
    }
}

async function consumeChallenge(challengeId: string): Promise<void> {
    try {
        await redis.setex(
            `btc:challenge:used:${challengeId}`,
            CONFIG.challengeTtl * 2,
            JSON.stringify({
                usedAt: Date.now(),
                method: 'bypass',
            })
        );
        await redis.del(`btc:immune:challenge:${challengeId}`);
    } catch (error) {
        console.error('Error consuming challenge:', error);
    }
}

// ============================================================================
// HUMAN VERIFICATION HEURISTICS
// ============================================================================

/**
 * Analyze interaction data for signs of humanity
 * Not foolproof, but raises trust score
 */
function calculateTrustScore(
    request: BypassRequest,
    ip: string
): number {
    let score = CONFIG.baseTrustScore; // Start at 30

    // Time on page (humans take time to read)
    if (request.interactionData?.timeOnPage) {
        if (request.interactionData.timeOnPage > 10000) {
            score += 20; // +20 for 10+ seconds
        } else if (request.interactionData.timeOnPage > CONFIG.minInteractionTime) {
            score += 10; // +10 for 3+ seconds
        } else {
            score -= 10; // -10 for rushing
        }
    }

    // Mouse movements (bots often have 0 or perfect patterns)
    if (request.interactionData?.mouseMovements) {
        if (request.interactionData.mouseMovements > 50) {
            score += 15; // Natural human movement
        }
    }

    // Reason credibility
    switch (request.reason) {
        case 'accessibility':
            score += 25; // High credibility
            break;
        case 'mobile-limitation':
            score += 15;
            break;
        case 'urgency':
            score += 5; // Lowest, easily claimed
            break;
        case 'human-declared':
        default:
            score += 10;
    }

    // User agent analysis
    const ua = request.userAgent || '';
    if (ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone')) {
        score += 10; // Mobile users more likely to need bypass
    }

    return Math.min(score, 100);
}

// ============================================================================
// AUDIT & ALERTING
// ============================================================================

async function logBypassAttempt(
    ip: string,
    request: BypassRequest,
    result: BypassResult,
    trustScore: number
): Promise<void> {
    const logEntry = {
        timestamp: Date.now(),
        ip,
        challengeId: request.challengeId,
        reason: request.reason,
        trustScore,
        success: result.success,
        userAgent: request.userAgent,
        interactionData: request.interactionData,
        warning: result.warning,
    };

    try {
        // Add to bypass audit log
        await redis.lpush('btc:bypass:audit', JSON.stringify(logEntry));
        await redis.ltrim('btc:bypass:audit', 0, 999);

        // Track per-IP bypass count for alerting
        const ipBypassCount = await redis.incr(`btc:bypass:count:${ip}`);
        await redis.expire(`btc:bypass:count:${ip}`, 86400);

        // Alert if threshold reached
        if (ipBypassCount >= CONFIG.alertThreshold) {
            await redis.lpush('btc:security:alerts', JSON.stringify({
                severity: 'medium',
                component: 'normie-bypass',
                title: `Multiple bypass attempts from ${ip}`,
                message: `${ipBypassCount} bypasses in 24h`,
                metadata: {
                    ip,
                    latestChallenge: request.challengeId,
                    trustScore,
                },
                timestamp: Date.now(),
            }));
        }
    } catch (error) {
        console.error('Audit logging error:', error);
    }
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const sessionId = request.cookies.get('btc-session')?.value;

    try {
        // 1. Parse request
        let body: BypassRequest;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid JSON',
                    message: 'Please try again or contact support',
                },
                { status: 400 }
            );
        }

        const { challengeId, reason, timestamp } = body;

        // 2. Validate required fields
        if (!challengeId || !reason) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Missing fields',
                    message: 'Required: challengeId, reason',
                },
                { status: 400 }
            );
        }

        // Validate reason
        const validReasons = ['human-declared', 'accessibility', 'mobile-limitation', 'urgency'];
        if (!validReasons.includes(reason)) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid reason',
                    message: `Valid reasons: ${validReasons.join(', ')}`,
                },
                { status: 400 }
            );
        }

        // 3. Check rate limits
        const rateLimit = await checkBypassRateLimit(ip, sessionId);
        if (!rateLimit.allowed) {
            await logBypassAttempt(ip, body, {
                success: false,
                warning: rateLimit.reason,
            }, 0);

            return NextResponse.json(
                {
                    success: false,
                    error: 'Rate limit exceeded',
                    message: rateLimit.reason,
                    suggestion: 'Please complete the Proof-of-Work challenge or try again tomorrow.',
                },
                {
                    status: 429,
                    headers: {
                        'X-Bypass-Allowed': 'false',
                        'Retry-After': String(CONFIG.windowHours * 3600),
                    },
                }
            );
        }

        // 4. Validate challenge
        const challengeStatus = await validateChallenge(challengeId);
        if (!challengeStatus.valid) {
            await logBypassAttempt(ip, body, {
                success: false,
                warning: challengeStatus.reason,
            }, 0);

            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid challenge',
                    message: challengeStatus.reason,
                },
                { status: 400 }
            );
        }

        // 5. Calculate trust score
        const trustScore = calculateTrustScore(body, ip);

        // 6. Generate access token (shorter duration than PoW)
        const accessToken = crypto.randomUUID();
        await redis.setex(
            `btc:access:${accessToken}`,
            CONFIG.tokenDuration,
            JSON.stringify({
                ip,
                challengeId,
                method: 'bypass',
                trustScore,
                reason,
                grantedAt: Date.now(),
            })
        );

        // Also mark as verified for middleware
        await redis.setex(`btc:immune:verified:${ip}`, CONFIG.tokenDuration, 'human-bypass');

        // 7. Consume challenge
        await consumeChallenge(challengeId);

        // 8. Increment counters
        await incrementBypassCounters(ip, sessionId);

        // 9. Build response
        const result: BypassResult = {
            success: true,
            accessToken,
            expiresIn: CONFIG.tokenDuration,
        };

        // Add warning for low trust scores
        if (trustScore < 50) {
            result.warning = 'Low trust verification. Complete PoW next time for full access.';
        }

        // 10. Log attempt
        await logBypassAttempt(ip, body, result, trustScore);

        const response = NextResponse.json(result, {
            status: 200,
            headers: {
                'X-Bypass-Allowed': 'true',
                'X-Trust-Score': String(trustScore),
                'X-Token-Expires': String(CONFIG.tokenDuration),
            },
        });

        // Set cookie for middleware
        response.cookies.set('btc-pow-verified', 'human', {
            maxAge: CONFIG.tokenDuration,
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });

        return response;

    } catch (error) {
        console.error('Bypass endpoint error:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Internal error',
                message: 'Verification failed. Please try the PoW challenge.',
            },
            { status: 500 }
        );
    }
}

// ============================================================================
// GET HANDLER (Bypass info & limits)
// ============================================================================

export async function GET(request: NextRequest): Promise<NextResponse> {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const sessionId = request.cookies.get('btc-session')?.value;

    try {
        const dailyKey = `btc:bypass:daily:${ip}`;
        const dailyCount = await redis.get<number>(dailyKey) || 0;
        const remaining = Math.max(0, CONFIG.maxBypassPerIp - dailyCount);

        const ttl = await redis.ttl(dailyKey);

        return NextResponse.json({
            allowed: remaining > 0,
            remaining,
            maxPerDay: CONFIG.maxBypassPerIp,
            windowHours: CONFIG.windowHours,
            resetIn: ttl > 0 ? ttl : 0,
            reasons: [
                { id: 'human-declared', label: 'I\'m human / Normie', description: 'General human verification' },
                { id: 'accessibility', label: 'Accessibility needs', description: 'Screen reader, motor disability, etc.' },
                { id: 'mobile-limitation', label: 'Mobile device limitation', description: 'Low battery, old phone, etc.' },
                { id: 'urgency', label: 'Urgent access needed', description: 'Time-sensitive request' },
            ],
        });

    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to check bypass status' },
            { status: 500 }
        );
    }
}
