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
    '/api/satoshi/immune',
  ];
  return zones.some(route => path === route || path.startsWith(`${route}/`));
}

function isStaticAsset(path: string): boolean {
  // FIX: Mejor detección de archivos estáticos
  if (
    path.startsWith('/_next/') ||
    path.startsWith('/static/') ||
    path.includes('/api/health')
  ) {
    return true;
  }

  // FIX: Regex más amplia para favicon y otros assets
  return /\.(ico|png|jpg|jpeg|svg|webp|gif|css|js|wasm|map|json|txt|xml|webmanifest)$/i.test(path);
}

// ============================================================================
// MAIN MIDDLEWARE
// ============================================================================

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const path = request.nextUrl.pathname;
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';

  // FIX: Early return para favicon.ico específicamente
  if (path === '/favicon.ico' || path.endsWith('.ico')) {
    return NextResponse.next();
  }

  // Skip checks for challenge zone and static assets
  if (isChallengeZone(request) || isStaticAsset(path)) {
    return NextResponse.next();
  }

  // Check Banlist (Safe)
  const banInfo = await safeRedis<string | null>(() => redis.get(`btc:banlist:${ip}`), null);
  if (banInfo) {
    return new NextResponse(
      JSON.stringify({ error: 'Node Banned', message: 'Byzantine behavior detected' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Threat Analysis
  let threatScore = 0;
  const matchedFactors: string[] = [];
  const url = request.nextUrl.toString();
  const userAgent = request.headers.get('user-agent') || '';

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

  // Immune Response
  if (threatScore >= CONFIG.threatDetection.blockThreshold) {
    await safeRedis(() => redis.setex(`btc:banlist:${ip}`, 3600, 'Byzantine actor'), null);
    return new NextResponse(JSON.stringify({ error: 'Banned' }), { status: 403 });
  }

  if (threatScore >= CONFIG.threatDetection.challengeThreshold) {
    const isVerified = request.cookies.has('btc-pow-verified') ||
      await safeRedis(() => redis.get(`btc:immune:verified:${ip}`), null);

    if (!isVerified) {
      const challengeUrl = new URL('/challenge/pow', request.url);
      challengeUrl.searchParams.set('returnTo', request.url);
      challengeUrl.searchParams.set('difficulty', '3');
      return NextResponse.redirect(challengeUrl);
    }
  }

  // Rate Limiting (Safe) - ATOMIC using setex
  let tier: keyof ImmuneConfig['tiers'] = 'public';
  if (path.startsWith('/api/satoshi/') || path.startsWith('/satoshi/')) {
    tier = 'satoshi';
    const apiKey = request.headers.get('x-api-key') || request.nextUrl.searchParams.get('apiKey');
    if (apiKey !== process.env.ADMIN_API_KEY) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }
  }

  const limitKey = `btc:ratelimit:${ip}:${tier}:${Math.floor(Date.now() / 60000)}`;

  let currentReqs = await safeRedis<string | number | null>(() => redis.get(limitKey), 0);
  const count = typeof currentReqs === 'string' ? parseInt(currentReqs) : (typeof currentReqs === 'number' ? currentReqs : 0);

  if (count === 0) {
    await safeRedis(() => redis.setex(limitKey, 60, '1'), null);
    currentReqs = 1;
  } else {
    const newCount = await safeRedis(() => redis.incr(limitKey), count + 1);
    currentReqs = typeof newCount === 'number' ? newCount : count + 1;
  }

  if (currentReqs > CONFIG.tiers[tier].requests) {
    return new NextResponse(JSON.stringify({ error: 'Rate limit' }), { status: 429 });
  }

  // Audit Log (Safe/Background)
  if (threatScore > 0) {
    safeRedis(() => redis.lpush('btc:immune:audit', JSON.stringify({
      ip, path, score: threatScore, factors: matchedFactors, timestamp: Date.now()
    })), null);
  }

  // Success
  const response = NextResponse.next();
  response.headers.set('X-Immune-Status', 'active');
  response.headers.set('X-Threat-Score', threatScore.toFixed(2));
  return response;
}

// FIX: Matcher simplificado y más permisivo
export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     * - _next/* (Next.js internals)
     * - static/* (static files)
     * - *.ico, *.png, *.jpg, etc (assets)
     * - api/health (health checks)
     */
    '/((?!_next|static|.*\\.(?:ico|png|jpg|jpeg|svg|webp|gif|css|js|wasm|map|json|txt|xml)|api/health).*)',
  ],
};