/**
 * BITCOIN AGENT - Digital Immune System
 * Middleware de protección multicapa
 * 
 * Capas (en orden):
 * 1. Static assets bypass (favicon, imágenes, etc.)
 * 2. Root redirect (/ → /en)
 * 3. Challenge zone bypass (evita loops)
 * 4. Ban list check (Redis)
 * 5. Threat detection (regex patterns)
 * 6. PoW challenge redirect (si es sospechoso)
 * 7. Rate limiting por tier (Redis)
 * 8. Audit logging (background)
 */

import { NextRequest, NextResponse } from 'next/server';
import { redis } from './lib/redis';

// ============================================================================
// SAFE REDIS WRAPPER (Build-resilient)
// ============================================================================

async function safeRedis<T>(operation: () => Promise<T>, fallback: T): Promise<T> {
  const isNoOp = !process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN;

  if (isNoOp) {
    console.warn('🛡️ Immune System: Redis not configured, using fallback');
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
// CONFIGURACIÓN
// ============================================================================

const CONFIG = {
  tiers: {
    public: { requests: 20, window: 60000 },   // 20 req/min
    node: { requests: 60, window: 60000 },   // 60 req/min
    miner: { requests: 120, window: 60000 },  // 120 req/min
    satoshi: { requests: 300, window: 60000 }, // 300 req/min (solo APIs)
  },
  threatDetection: {
    enabled: true,
    challengeThreshold: 0.6,  // Score para requerir PoW
    blockThreshold: 0.85,     // Score para ban directo
  },
};

// Patrones de amenaza con severidad
const THREAT_SIGNATURES = [
  { pattern: /(ignore (all |previous )?(instructions?|prompts?)|system prompt|override (safety|rules)|jailbreak)/i, severity: 0.35, name: 'Prompt Injection' },
  { pattern: /(bc1q[a-z0-9]{38,42}|1[a-zA-Z0-9]{33}|3[a-zA-Z0-9]{33})/, severity: 0.1, name: 'Address Poisoning' },
  { pattern: /(\.\.\/|\.\.\\|%2e%2e%2f)/i, severity: 0.25, name: 'Path Traversal' },
  { pattern: /(\b(SELECT|INSERT|UPDATE|DELETE|DROP)\b.*\b(FROM|INTO|TABLE)\b)/i, severity: 0.3, name: 'SQL Injection' },
  { pattern: /(<script|javascript:|onerror=|onload=)/i, severity: 0.3, name: 'XSS Attempt' },
];

// ============================================================================
// HELPERS
// ============================================================================

/** Rutas que NUNCA deben pasar por el middleware (evita loops) */
function isChallengeZone(path: string): boolean {
  const zones = [
    '/challenge/pow',
    '/challenge/verify',
    '/challenge/bypass',
    '/api/challenge/verify',
    '/api/challenge/bypass',
  ];
  return zones.some(zone => path === zone || path.startsWith(`${zone}/`));
}

/** Assets estáticos que no necesitan protección */
function isStaticAsset(path: string): boolean {
  if (path.startsWith('/_next/') || path.startsWith('/static/')) return true;
  if (path === '/favicon.ico') return true;
  return /\.(ico|png|jpg|jpeg|svg|webp|gif|css|js|wasm|map|json|txt|xml|webmanifest)$/i.test(path);
}

/** Detecta si es una API route */
function isApiRoute(path: string): boolean {
  return path.startsWith('/api/');
}

/** Calcula threat score basado en URL, User-Agent y body */
async function analyzeThreat(request: NextRequest): Promise<{ score: number; factors: string[] }> {
  let score = 0;
  const factors: string[] = [];

  const url = request.nextUrl.toString().toLowerCase();
  const userAgent = (request.headers.get('user-agent') || '').toLowerCase();

  // Analizar body solo para métodos que típicamente llevan payload
  let body = '';
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    try {
      body = (await request.clone().text()).toLowerCase();
    } catch (e) {
      // No crítico, continuar sin body
    }
  }

  for (const sig of THREAT_SIGNATURES) {
    if (sig.pattern.test(url) || sig.pattern.test(userAgent) || sig.pattern.test(body)) {
      score += sig.severity;
      factors.push(sig.name);
    }
  }

  return { score: Math.min(score, 1.0), factors };
}

// ============================================================================
// MAIN MIDDLEWARE
// ============================================================================

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const path = request.nextUrl.pathname;
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';

  // 1. BYPASS: Assets estáticos (favicon, CSS, JS, imágenes)
  if (isStaticAsset(path)) {
    return NextResponse.next();
  }

  // 2. REDIRECT: Root a /en
  if (path === '/') {
    return NextResponse.redirect(new URL('/en', request.url));
  }

  // 3. BYPASS: Challenge zone (evita loops infinitos)
  if (isChallengeZone(path)) {
    return NextResponse.next();
  }

  // 4. CHECK: Ban list (Redis)
  const isBanned = await safeRedis(
    () => redis.get(`btc:banlist:${ip}`),
    null
  );

  if (isBanned) {
    return new NextResponse(
      JSON.stringify({
        error: 'Access Denied',
        message: 'Byzantine behavior detected. Node banned.',
        appeal: 'Contact: security@bitcoin-agent.ai'
      }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  // 5. ANALYZ: Threat detection
  const { score: threatScore, factors } = await analyzeThreat(request);

  // 6. RESPONSE: Threat score alto → Ban o Challenge
  if (threatScore >= CONFIG.threatDetection.blockThreshold) {
    // Ban por 1 hora
    await safeRedis(
      () => redis.setex(`btc:banlist:${ip}`, 3600, JSON.stringify({
        reason: 'High threat score',
        factors,
        timestamp: Date.now(),
      })),
      null
    );

    return new NextResponse(
      JSON.stringify({ error: 'Banned', factors }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (threatScore >= CONFIG.threatDetection.challengeThreshold) {
    // Verificar si ya pasó challenge
    const isVerified = await safeRedis(
      () => redis.get(`btc:immune:verified:${ip}`),
      null
    );

    const hasCookie = request.cookies.has('btc-pow-verified');

    if (!isVerified && !hasCookie) {
      const challengeUrl = new URL('/challenge/pow', request.url);
      challengeUrl.searchParams.set('returnTo', request.url);
      challengeUrl.searchParams.set('difficulty', '3');
      return NextResponse.redirect(challengeUrl);
    }
  }

  // 7. RATE LIMITING: Determinar tier y aplicar límites

  let tier: keyof typeof CONFIG.tiers = 'public';

  // API routes de admin requieren API key
  if (path.startsWith('/api/satoshi/')) {
    tier = 'satoshi';
    const apiKey = request.headers.get('x-api-key') || request.nextUrl.searchParams.get('apiKey');

    if (apiKey !== process.env.ADMIN_API_KEY) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized', message: 'Valid API key required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }
  // Páginas de admin (NO APIs) - alto rate limit pero sin API key
  else if (path.startsWith('/satoshi/')) {
    tier = 'miner'; // 120 req/min, protección por password en layout.tsx
  }
  // APIs públicas
  else if (isApiRoute(path)) {
    tier = 'node'; // 60 req/min
  }
  // Resto (páginas públicas)
  else {
    tier = 'public'; // 20 req/min
  }

  // Aplicar rate limiting
  const windowKey = Math.floor(Date.now() / CONFIG.tiers[tier].window);
  const rateKey = `btc:ratelimit:${ip}:${tier}:${windowKey}`;

  const currentCount = await safeRedis(
    () => redis.incr(rateKey),
    1
  );

  // Set expiry en primer request
  if (currentCount === 1) {
    await safeRedis(
      () => redis.expire(rateKey, Math.floor(CONFIG.tiers[tier].window / 1000)),
      null
    );
  }

  if (currentCount > CONFIG.tiers[tier].requests) {
    return new NextResponse(
      JSON.stringify({
        error: 'Rate Limit Exceeded',
        tier,
        limit: CONFIG.tiers[tier].requests,
        window: `${CONFIG.tiers[tier].window / 1000}s`
      }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 8. AUDIT: Log amenazas (background, no bloqueante)
  if (threatScore > 0 || tier === 'satoshi') {
    safeRedis(
      () => redis.lpush('btc:immune:audit', JSON.stringify({
        ip: ip.toString().slice(0, 20), // Truncar por privacidad
        path: path.slice(0, 100),
        tier,
        threatScore,
        factors,
        timestamp: Date.now(),
      })),
      null
    ).catch(() => { }); // Silenciar errores de audit
  }

  // SUCCESS: Añadir headers informativos
  const response = NextResponse.next();
  response.headers.set('X-Immune-Status', 'active');
  response.headers.set('X-Immune-Tier', tier);
  response.headers.set('X-Threat-Score', threatScore.toFixed(2));
  response.headers.set('X-RateLimit-Remaining', (CONFIG.tiers[tier].requests - currentCount).toString());

  return response;
}

// ============================================================================
// MATCHER CONFIG
// ============================================================================

export const config = {
  matcher: [
    /*
     * Match todo EXCEPTO:
     * - _next/* (internals de Next.js)
     * - static/* (archivos estáticos)
     * - *.ico, *.png, etc (assets con extensión)
     */
    '/((?!_next|static|.*\\.(?:ico|png|jpg|jpeg|svg|webp|gif|css|js|wasm|map|json|txt|xml)).*)',
  ],
};