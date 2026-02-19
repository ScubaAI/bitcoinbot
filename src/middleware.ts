/**
 * BITCOIN AGENT - Digital Immune System
 * Build-Resilient Middleware with Safe Redis
 * 
 * Philosophy: "Don't trust, verify"
 */

import { NextRequest, NextResponse } from 'next/server';
import { redis } from './lib/redis';
import crypto from 'crypto';

// ============================================================================
// SAFE REDIS WRAPPER (Prevents build-time crashes)
// ============================================================================

async function safeRedis<T>(operation: () => Promise<T>, fallback: T): Promise<T> {
  // Check if we are in build mode or missing credentials
  const isNoOp = !process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN;

  if (isNoOp) {
    return fallback;
  }

  try {
    return await operation();
  } catch (error) {
    console.error('🛡️ Immune System [Redis Error]:', error);
    return fallback;
  }
}

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

interface ImmuneConfig {
  tiers: {
    public: { requests: number; window: number };
    node: { requests: number; window: number };
    miner: { requests: number; window: number };
    satoshi: { requests: number; window: number };
  };
  threatDetection: {
    enabled: boolean;
    challengeThreshold: number;
    blockThreshold: number;
  };
}

const CONFIG: ImmuneConfig = {
  tiers: {
    public: { requests: 20, window: 60000 },
    node: { requests: 60, window: 60000 },
    miner: { requests: 120, window: 60000 },
    satoshi: { requests: 300, window: 60000 },
  },
  threatDetection: {
    enabled: true,
    challengeThreshold: 0.6,
    blockThreshold: 0.85,
  },
};

const THREAT_SIGNATURES = [
  { pattern: /(ignore (all |previous )?(instructions?|prompts?)|system prompt|override (safety|rules)|jailbreak)/i, severity: 0.35, description: 'Prompt Injection' },
  { pattern: /(bc1q[a-z0-9]{38,42}|1[a-zA-Z0-9]{33}|3[a-zA-Z0-9]{33})/, severity: 0.1, description: 'Address Poisoning' },
  { pattern: /(\.\.\/|\.\.\\|%2e%2e%2f)/i, severity: 0.25, description: 'Path Traversal' },
  { pattern: /(\b(SELECT|INSERT|UPDATE|UPDATE|DELETE)\b)/i, severity: 0.3, description: 'SQL Injection' },
  { pattern: /(<script|javascript:|onerror=)/i, severity: 0.3, description: 'XSS Attempt' },
];

// ============================================================================
// HELPERS
// ============================================================================

function isChallengeZone(request: NextRequest): boolean {
  const path = request.nextUrl.pathname;
  const zones = [
    '/challenge/pow',
    '/challenge/verify',
    '/challenge/bypass',
    '/api/challenge/verify',
    '/api/challenge/bypass',
    '/api/satoshi/immune', // Allow dashboard APIs to load
  ];
  return zones.some(route => path === route || path.startsWith(`${route}/`));
}

function isStaticAsset(path: string): boolean {
  return (
    path.startsWith('/_next/') ||
    path.startsWith('/static/') ||
    path.includes('/api/health') ||
    /\.(ico|png|jpg|jpeg|svg|webp|gif|css|js|wasm|map|json)$/.test(path)
  );
}

// ============================================================================
// MAIN MIDDLEWARE
// ============================================================================

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const path = request.nextUrl.pathname;
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';

  // 1. Skip checks for challenge zone and static assets
  if (isChallengeZone(request) || isStaticAsset(path)) {
    return NextResponse.next();
  }

  // 2. Check Banlist (Safe)
  const banInfo = await safeRedis<string | null>(() => redis.get(`btc:banlist:${ip}`), null);
  if (banInfo) {
    return new NextResponse(
      JSON.stringify({ error: 'Node Banned', message: 'Byzantine behavior detected' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 3. Threat Analysis
  let threatScore = 0;
  const matchedFactors: string[] = [];
  const url = request.nextUrl.toString();
  const userAgent = request.headers.get('user-agent') || '';

  // Parse body safely (once)
  let body = '';
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    try {
      body = await request.clone().text();
    } catch (e) { /* ignore */ }
  }

  for (const sig of THREAT_SIGNATURES) {
    if (sig.pattern.test(url) || sig.pattern.test(userAgent) || sig.pattern.test(body)) {
      threatScore += sig.severity;
      matchedFactors.push(sig.description);
    }
  }

  // 4. Immune Response
  if (threatScore >= CONFIG.threatDetection.blockThreshold) {
    await safeRedis(() => redis.setex(`btc:banlist:${ip}`, 3600, 'Byzantine actor'), null);
    return new NextResponse(JSON.stringify({ error: 'Banned' }), { status: 403 });
  }

  if (threatScore >= CONFIG.threatDetection.challengeThreshold) {
    // Verified check
    const isVerified = request.cookies.has('btc-pow-verified') ||
      await safeRedis(() => redis.get(`btc:immune:verified:${ip}`), null);

    if (!isVerified) {
      const challengeUrl = new URL('/challenge/pow', request.url);
      challengeUrl.searchParams.set('returnTo', request.url);
      challengeUrl.searchParams.set('difficulty', '3');
      return NextResponse.redirect(challengeUrl);
    }
  }

  // 5. Rate Limiting (Safe)
  let tier: keyof ImmuneConfig['tiers'] = 'public';
  if (path.startsWith('/api/satoshi/') || path.startsWith('/satoshi/')) {
    tier = 'satoshi';
    const apiKey = request.headers.get('x-api-key') || request.nextUrl.searchParams.get('apiKey');
    if (apiKey !== process.env.ADMIN_API_KEY) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }
  }

  const limitKey = `btc:ratelimit:${ip}:${tier}:${Math.floor(Date.now() / 60000)}`;
  const currentReqs = await safeRedis(() => redis.incr(limitKey), 1);
  if (currentReqs === 1) await safeRedis(() => redis.expire(limitKey, 60), null);

  if (currentReqs > CONFIG.tiers[tier].requests) {
    return new NextResponse(JSON.stringify({ error: 'Rate limit' }), { status: 429 });
  }

  // 6. Audit Log (Safe/Background)
  if (threatScore > 0) {
    safeRedis(() => redis.lpush('btc:immune:audit', JSON.stringify({
      ip, path, score: threatScore, factors: matchedFactors, timestamp: Date.now()
    })), null);
  }

  // 7. Success
  const response = NextResponse.next();
  response.headers.set('X-Immune-Status', 'active');
  response.headers.set('X-Threat-Score', threatScore.toFixed(2));
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};