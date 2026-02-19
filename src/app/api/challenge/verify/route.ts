/**
 * Proof-of-Work Verification API
 * Bitcoin Agent Digital Immune System
 * 
 * Endpoint: POST /api/challenge/verify
 * 
 * Validates that the client performed the required computational work.
 * Security-critical: Never trust client-side claims without verification.
 * 
 * Philosophy: "Don't trust, verify" — the server independently recalculates
 */

import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import crypto from 'crypto';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface VerifyRequest {
    challengeId: string;
    nonce: number;
    hash: string;
    difficulty: number;
}

interface VerificationResult {
    valid: boolean;
    reason?: string;
    metadata?: {
        calculatedHash: string;
        expectedPrefix: string;
        timeToVerify: number;
    };
}

// ============================================================================
// SECURITY CONFIGURATION
// ============================================================================

const CONFIG = {
    // Maximum allowed difficulty (prevent DoS via huge computations)
    maxDifficulty: 6,

    // Challenge expiration (5 minutes)
    challengeTtl: 300,

    // Rate limiting for verification endpoint
    maxAttemptsPerIp: 10,
    windowSeconds: 60,

    // Hash prefix length to verify (first 8 chars for performance)
    verificationPrefixLength: 8,
};

// ============================================================================
// RATE LIMITING (Protect verification endpoint)
// ============================================================================

async function checkVerificationRateLimit(ip: string): Promise<boolean> {
    const key = `btc:verify:ratelimit:${ip}`;

    try {
        const current = await redis.incr(key);
        if (current === 1) {
            await redis.expire(key, CONFIG.windowSeconds);
        }

        return current <= CONFIG.maxAttemptsPerIp;
    } catch (error) {
        console.error('Redis rate limit error:', error);
        // Fail open in case of Redis failure (don't block legitimate users)
        return true;
    }
}

// ============================================================================
// CHALLENGE VALIDATION
// ============================================================================

/**
 * Retrieve and validate challenge from Redis
 */
async function getChallengeData(challengeId: string): Promise<{
    valid: boolean;
    difficulty?: number;
    timestamp?: number;
    reason?: string;
}> {
    try {
        const challengeKey = `btc:immune:challenge:${challengeId}`;
        const challengeData = await redis.get<string>(challengeKey);

        if (!challengeData) {
            return {
                valid: false,
                reason: 'Challenge expired or invalid'
            };
        }

        const parsed = typeof challengeData === 'string' ? JSON.parse(challengeData) : challengeData;
        const { difficulty, timestamp } = parsed;

        // Check expiration
        const age = (Date.now() - timestamp) / 1000;
        if (age > CONFIG.challengeTtl) {
            await redis.del(challengeKey);
            return {
                valid: false,
                reason: 'Challenge expired'
            };
        }

        // Validate difficulty bounds
        if (difficulty < 1 || difficulty > CONFIG.maxDifficulty) {
            return {
                valid: false,
                reason: 'Invalid difficulty level'
            };
        }

        return { valid: true, difficulty, timestamp };
    } catch (error) {
        console.error('Challenge validation error:', error);
        return {
            valid: false,
            reason: 'Challenge validation failed'
        };
    }
}

/**
 * Mark challenge as used (prevent replay attacks)
 */
async function consumeChallenge(challengeId: string): Promise<void> {
    try {
        // Move to used challenges set with expiration
        await redis.setex(
            `btc:challenge:used:${challengeId}`,
            CONFIG.challengeTtl * 2, // Keep longer for audit
            Date.now().toString()
        );

        // Delete active challenge
        await redis.del(`btc:immune:challenge:${challengeId}`);
    } catch (error) {
        console.error('Error consuming challenge:', error);
    }
}

// ============================================================================
// CRYPTOGRAPHIC VERIFICATION
// ============================================================================

/**
 * Server-side SHA-256 verification
 * This is the critical security function — never trust client hash
 */
async function verifyProofOfWork(
    challengeId: string,
    nonce: number,
    claimedHash: string,
    difficulty: number
): Promise<VerificationResult> {
    const startTime = Date.now();

    // Recalculate hash server-side
    const message = challengeId + nonce;
    const calculatedHash = crypto
        .createHash('sha256')
        .update(message)
        .digest('hex');

    // Verify hash matches client's claim (detect tampering)
    if (calculatedHash !== claimedHash.toLowerCase()) {
        return {
            valid: false,
            reason: 'Hash mismatch — client may have tampered with result',
            metadata: {
                calculatedHash: calculatedHash.slice(0, CONFIG.verificationPrefixLength),
                expectedPrefix: claimedHash.slice(0, CONFIG.verificationPrefixLength),
                timeToVerify: Date.now() - startTime,
            },
        };
    }

    // Verify difficulty target
    const targetPrefix = Array(difficulty + 1).join('0');
    if (!calculatedHash.startsWith(targetPrefix)) {
        return {
            valid: false,
            reason: `Hash does not meet difficulty target (needs ${difficulty} leading zeros)`,
            metadata: {
                calculatedHash: calculatedHash.slice(0, 16),
                expectedPrefix: targetPrefix,
                timeToVerify: Date.now() - startTime,
            },
        };
    }

    // Success
    return {
        valid: true,
        metadata: {
            calculatedHash: calculatedHash.slice(0, 16),
            expectedPrefix: targetPrefix,
            timeToVerify: Date.now() - startTime,
        },
    };
}

// ============================================================================
// AUDIT LOGGING
// ============================================================================

async function logVerificationAttempt(
    ip: string,
    challengeId: string,
    result: VerificationResult,
    requestData: VerifyRequest
): Promise<void> {
    const logEntry = {
        timestamp: Date.now(),
        ip,
        challengeId,
        nonce: requestData.nonce,
        difficulty: requestData.difficulty,
        valid: result.valid,
        reason: result.reason,
        timeToVerify: result.metadata?.timeToVerify,
    };

    try {
        // Add to audit log
        await redis.lpush('btc:pow:audit', JSON.stringify(logEntry));
        await redis.ltrim('btc:pow:audit', 0, 999);

        // Track failed attempts for IP analysis
        if (!result.valid) {
            await redis.incr(`btc:pow:failures:${ip}`);
            await redis.expire(`btc:pow:failures:${ip}`, 3600);
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
    const startTime = Date.now();

    try {
        // 1. Rate limiting check
        const allowed = await checkVerificationRateLimit(ip);
        if (!allowed) {
            return NextResponse.json(
                {
                    valid: false,
                    error: 'Rate limit exceeded',
                    message: 'Too many verification attempts. Please wait.',
                },
                {
                    status: 429,
                    headers: {
                        'Retry-After': '60',
                        'X-RateLimit-Reset': String(Math.floor(Date.now() / 1000) + 60),
                    },
                }
            );
        }

        // 2. Parse and validate request body
        let body: VerifyRequest;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                {
                    valid: false,
                    error: 'Invalid JSON',
                    message: 'Request body must be valid JSON',
                },
                { status: 400 }
            );
        }

        const { challengeId, nonce, hash, difficulty } = body;

        // Validate required fields
        if (!challengeId || typeof nonce !== 'number' || !hash || typeof difficulty !== 'number') {
            return NextResponse.json(
                {
                    valid: false,
                    error: 'Missing fields',
                    message: 'Required: challengeId, nonce, hash, difficulty',
                },
                { status: 400 }
            );
        }

        // Validate types
        if (typeof nonce !== 'number' || nonce < 0 || !Number.isInteger(nonce)) {
            return NextResponse.json(
                {
                    valid: false,
                    error: 'Invalid nonce',
                    message: 'Nonce must be a non-negative integer',
                },
                { status: 400 }
            );
        }

        if (!/^[a-f0-9]{64}$/i.test(hash)) {
            return NextResponse.json(
                {
                    valid: false,
                    error: 'Invalid hash format',
                    message: 'Hash must be 64 hexadecimal characters',
                },
                { status: 400 }
            );
        }

        // 3. Check if challenge was already used (replay protection)
        const usedChallenge = await redis.get(`btc:challenge:used:${challengeId}`);
        if (usedChallenge) {
            await logVerificationAttempt(ip, challengeId, {
                valid: false,
                reason: 'Challenge already used (replay attempt)',
            }, body);

            return NextResponse.json(
                {
                    valid: false,
                    error: 'Replay detected',
                    message: 'This challenge has already been solved',
                },
                { status: 400 }
            );
        }

        // 4. Validate challenge exists and is active
        const challengeStatus = await getChallengeData(challengeId);
        if (!challengeStatus.valid) {
            await logVerificationAttempt(ip, challengeId, {
                valid: false,
                reason: challengeStatus.reason,
            }, body);

            return NextResponse.json(
                {
                    valid: false,
                    error: 'Invalid challenge',
                    message: challengeStatus.reason,
                },
                { status: 400 }
            );
        }

        // 5. Verify difficulty matches
        if (challengeStatus.difficulty !== difficulty) {
            await logVerificationAttempt(ip, challengeId, {
                valid: false,
                reason: 'Difficulty mismatch',
            }, body);

            return NextResponse.json(
                {
                    valid: false,
                    error: 'Difficulty mismatch',
                    message: 'Claimed difficulty does not match challenge',
                },
                { status: 400 }
            );
        }

        // 6. Cryptographic verification (THE CRITICAL STEP)
        const verificationResult = await verifyProofOfWork(
            challengeId,
            nonce,
            hash,
            difficulty
        );

        // 7. Log attempt
        await logVerificationAttempt(ip, challengeId, verificationResult, body);

        // 8. If valid, consume challenge and grant access
        if (verificationResult.valid) {
            await consumeChallenge(challengeId);

            // Grant temporary access token
            const accessToken = crypto.randomUUID();
            await redis.setex(
                `btc:access:${accessToken}`,
                3600, // 1 hour access
                JSON.stringify({
                    ip,
                    challengeId,
                    grantedAt: Date.now(),
                })
            );

            // Also set verification markers for middleware
            await redis.setex(`btc:immune:verified:${ip}`, 3600, 'true');

            const response = NextResponse.json(
                {
                    valid: true,
                    message: 'Proof of work verified. Access granted.',
                    accessToken,
                    metadata: {
                        timeToVerify: verificationResult.metadata?.timeToVerify,
                        totalTime: Date.now() - startTime,
                    },
                },
                {
                    status: 200,
                    headers: {
                        'X-Verified': 'true',
                        'X-Verification-Time': String(verificationResult.metadata?.timeToVerify),
                    },
                }
            );

            // Set cookie for middleware
            response.cookies.set('btc-pow-verified', 'true', {
                maxAge: 3600,
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
            });

            return response;
        }

        // 9. Invalid proof
        return NextResponse.json(
            {
                valid: false,
                error: 'Invalid proof',
                message: verificationResult.reason,
                metadata: verificationResult.metadata,
            },
            {
                status: 400,
                headers: {
                    'X-Verified': 'false',
                },
            }
        );

    } catch (error) {
        console.error('Verification endpoint error:', error);

        return NextResponse.json(
            {
                valid: false,
                error: 'Internal error',
                message: 'Verification failed due to server error',
            },
            { status: 500 }
        );
    }
}

// ============================================================================
// GET HANDLER (Challenge status check)
// ============================================================================

export async function GET(request: NextRequest): Promise<NextResponse> {
    const { searchParams } = new URL(request.url);
    const challengeId = searchParams.get('challengeId');

    if (!challengeId) {
        return NextResponse.json(
            { error: 'Missing challengeId' },
            { status: 400 }
        );
    }

    try {
        const challengeData = await redis.get<string>(`btc:immune:challenge:${challengeId}`);
        const isUsed = await redis.get(`btc:challenge:used:${challengeId}`);

        if (!challengeData && !isUsed) {
            return NextResponse.json(
                { exists: false, status: 'not_found' },
                { status: 404 }
            );
        }

        if (isUsed) {
            return NextResponse.json(
                { exists: true, status: 'used' },
                { status: 200 }
            );
        }

        const parsed = typeof challengeData === 'string' ? JSON.parse(challengeData) : challengeData;
        const age = (Date.now() - parsed.timestamp) / 1000;
        const remaining = Math.max(0, CONFIG.challengeTtl - age);

        return NextResponse.json({
            exists: true,
            status: 'active',
            difficulty: parsed.difficulty,
            expiresIn: Math.floor(remaining),
        });

    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to check challenge status' },
            { status: 500 }
        );
    }
}
