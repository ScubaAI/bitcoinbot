/**
 * BITCOIN AGENT - Digital Immune System (Audited & Hardened)
 * Middleware de protección multicapa
 * 
 * Parches aplicados:
 * - Anti-leakage: Sanitización de logs para no exponer API keys.
 * - Anti-DoS: Rate limiting atómico (fix race condition).
 * - Anti-Spoofing: IP extraction hardening.
 * - UX Fix: Ajuste de severidad para "Address Poisoning" (permite chat normal).
 */

import { NextRequest, NextResponse } from 'next/server';
import { redis } from './lib/redis';

// ============================================================================
// SAFE REDIS WRAPPER (Build-resilient)
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
// CONFIGURACIÓN
// ============================================================================

const CONFIG = {
  tiers: {
    public: { requests: 20, window: 60000 },   // 20 req/min
    node: { requests: 60, window: 60000 },     // 60 req/min
    miner: { requests: 120, window: 60000 },   // 120 req/min
    satoshi: { requests: 300, window: 60000 }, // 300 req/min (PROTEGIDO)
  },
  threatDetection: {
    enabled: true,
    challengeThreshold: 0.6,
    blockThreshold: 0.85,
  },
};

// Patrones de amenaza (Nota: Reducida severidad de Address Poisoning)
const THREAT_SIGNATURES = [
  { pattern: /(ignore (all |previous )?(instructions?|prompts?)|system prompt|override (safety|rules)|jailbreak)/i, severity: 0.35, name: 'Prompt Injection' },
  { pattern: /(bc1q[a-z0-9]{38,42}|1[a-zA-Z0-9]{33}|3[a-zA-Z0-9]{33})/, severity: 0.05, name: 'Address Pattern' },
  { pattern: /(\.\.\/|\.\.\\|%2e%2e%2f)/i, severity: 0.25, name: 'Path Traversal' },
  { pattern: /(\b(SELECT|INSERT|UPDATE|DELETE|DROP)\b.*\b(FROM|INTO|TABLE)\b)/i, severity: 0.3, name: 'SQL Injection' },
  { pattern: /(<script|javascript:|onerror=|onload=)/i, severity: 0.3, name: 'XSS Attempt' },
];

// ============================================================================
// HELPERS
// ============================================================================

/**
 * FIX #2: IP Spoofing Protection
 * - Prioriza request.ip (proporcionado por Vercel Edge, confiable)
 * - Si no existe, usa el ÚLTIMO valor de x-forwarded-for (más cercano al servidor)
 * - Nunca usa el primer valor de x-forwarded-for (puede ser spoofeado por cliente)
 */
function getCleanIp(request: NextRequest): string {
  // Vercel Edge Network ya sanitiza request.ip - es la fuente más confiable
  if (request.ip) {
    return request.ip.trim();
  }

  // Fallback solo para desarrollo local o entornos sin proxy confiable
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const ips = forwarded.split(',').map(s => s.trim()).filter(Boolean);
    // Tomar el último (más cercano al servidor), no el primero (puede ser falso)
    const trustedIp = ips[ips.length - 1];
    if (trustedIp) return trustedIp;
  }

  return 'unknown';
}

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

function isStaticAsset(path: string): boolean {
  if (path.startsWith('/_next/') || path.startsWith('/static/')) return true;
  if (path === '/favicon.ico') return true;
  return /\.(ico|png|jpg|jpeg|svg|webp|gif|css|js|wasm|map|json|txt|xml|webmanifest)$/i.test(path);
}

function isApiRoute(path: string): boolean {
  return path.startsWith('/api/');
}

async function analyzeThreat(request: NextRequest): Promise<{ score: number; factors: string[] }> {
  let score = 0;
  const factors: string[] = [];

  const url = request.nextUrl.toString().toLowerCase();
  const userAgent = (request.headers.get('user-agent') || '').toLowerCase();

  let body = '';
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    try {
      if (!request.bodyUsed) {
        body = (await request.clone().text()).toLowerCase();
      }
    } catch (e) {
      // Silenciar error de lectura de body
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
// RATE LIMITING ATÓMICO (FIX #1: Race Condition Protection)
// ============================================================================

interface RateLimitResult {
  allowed: boolean;
  currentCount: number;
  limit: number;
  window: number;
  resetTime: number;
}

/**
 * FIX #1: Atomic Rate Limiting
 * Usa SET con NX (solo si no existe) para atomicidad total.
 * Elimina la race condition entre INCR y EXPIRE.
 */
async function checkRateLimit(ip: string, tier: keyof typeof CONFIG.tiers): Promise<RateLimitResult> {
  const config = CONFIG.tiers[tier];
  const now = Date.now();
  const windowStart = Math.floor(now / config.window);
  const key = `btc:ratelimit:${ip}:${tier}:${windowStart}`;
  const windowSeconds = Math.floor(config.window / 1000);
  
  // Intentar crear la key con valor 1 y TTL (atómico)
  const initialSet = await safeRedis(
    () => redis.set(key, '1', { nx: true, ex: windowSeconds }),
    null
  );
  
  if (initialSet === 'OK') {
    // Key era nueva, este es el primer request en esta ventana
    return {
      allowed: true,
      currentCount: 1,
      limit: config.requests,
      window: config.window,
      resetTime: (windowStart + 1) * config.window
    };
  }
  
  // Key ya existe, incrementar contador
  const newCount = await safeRedis(
    () => redis.incr(key),
    1
  );
  
  const allowed = newCount <= config.requests;
  
  return {
    allowed,
    currentCount: newCount,
    limit: config.requests,
    window: config.window,
    resetTime: (windowStart + 1) * config.window
  };
}

// ============================================================================
// AUDIT LOGGING CON LIMITE (Bonus Fix)
// ============================================================================

async function logAudit(entry: object): Promise<void> {
  const key = 'btc:immune:audit';
  const maxEntries = 10000;
  
  await safeRedis(async () => {
    // Usar pipeline si está disponible, si no, operaciones secuenciales
    if ('pipeline' in redis && typeof redis.pipeline === 'function') {
      const pipeline = redis.pipeline();
      pipeline.lpush(key, JSON.stringify(entry));
      pipeline.ltrim(key, 0, maxEntries - 1);
      await pipeline.exec();
    } else {
      await redis.lpush(key, JSON.stringify(entry));
      await redis.ltrim(key, 0, maxEntries - 1);
    }
  }, null);
}

// ============================================================================
// MAIN MIDDLEWARE
// ============================================================================

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const path = request.nextUrl.pathname;
  const ip = getCleanIp(request);

  // 1. BYPASS: Assets estáticos
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

  // 4. CHECK: Global Paranoia Mode
  const isParanoid = await safeRedis(() => redis.get('btc:config:paranoia'), null);
  const paranoiaMultiplier = isParanoid === 'true' ? 0.5 : 1.0;
  // En modo Paranoia, el umbral baja a 0.3 (más sensible). Normal es 0.6.
  const dynamicChallengeThreshold = CONFIG.threatDetection.challengeThreshold * paranoiaMultiplier;

  // 5. CHECK: Ban list (Redis)
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

  // 6. ANALYZ: Threat detection
  const { score: threatScore, factors } = await analyzeThreat(request);

  // 7. RESPONSE: Threat score alto → Ban o Challenge
  if (threatScore >= CONFIG.threatDetection.blockThreshold) {
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

  if (threatScore >= dynamicChallengeThreshold) {
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

  // 8. DETERMINAR TIER Y VALIDAR AUTH
  
  let tier: keyof typeof CONFIG.tiers = 'public';

  // CASO A: Admin APIs (/api/satoshi/*)
  if (path.startsWith('/api/satoshi/')) {
    const apiKey = request.headers.get('x-api-key') || request.nextUrl.searchParams.get('apiKey');

    if (apiKey !== process.env.ADMIN_API_KEY) {
      tier = 'public';
      
      // Rate limit antes de rechazar (usando función atómica)
      const rateCheck = await checkRateLimit(ip, tier);
      
      if (!rateCheck.allowed) {
        return new NextResponse(
          JSON.stringify({ 
            error: 'Too Many Attempts',
            retryAfter: Math.ceil((rateCheck.resetTime - Date.now()) / 1000)
          }), 
          { 
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': Math.ceil((rateCheck.resetTime - Date.now()) / 1000).toString()
            }
          }
        );
      }

      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized', message: 'Valid API key required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    tier = 'satoshi';
  }
  // CASO B: Admin Pages (/satoshi/* - NO API)
  else if (path.startsWith('/satoshi/')) {
    tier = 'miner';
  }
  // CASO C: APIs públicas
  else if (isApiRoute(path)) {
    tier = 'node';
  }
  // CASO D: Resto
  else {
    tier = 'public';
  }

  // 9. APLICAR RATE LIMITING ATÓMICO (FIX #1)
  const rateCheck = await checkRateLimit(ip, tier);

  if (!rateCheck.allowed) {
    const retryAfter = Math.ceil((rateCheck.resetTime - Date.now()) / 1000);
    
    return new NextResponse(
      JSON.stringify({
        error: 'Rate Limit Exceeded',
        tier,
        limit: rateCheck.limit,
        window: `${rateCheck.window / 1000}s`,
        resetAt: new Date(rateCheck.resetTime).toISOString()
      }),
      { 
        status: 429, 
        headers: { 
          'Content-Type': 'application/json',
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': rateCheck.limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.ceil(rateCheck.resetTime / 1000).toString()
        } 
      }
    );
  }

  // 10. AUDIT: Log amenazas (Seguro - Sin API Keys)
  if (threatScore > 0 || tier === 'satoshi') {
    const safePath = request.nextUrl.pathname;
    
    // Non-blocking audit log
    logAudit({
      ip: ip.slice(0, 20),
      path: safePath.slice(0, 100),
      tier,
      threatScore,
      factors,
      timestamp: Date.now(),
    }).catch(() => {});
  }

  // SUCCESS: Añadir headers informativos
  const response = NextResponse.next();
  response.headers.set('X-Immune-Status', 'active');
  response.headers.set('X-Immune-Tier', tier);
  response.headers.set('X-Threat-Score', threatScore.toFixed(2));
  response.headers.set('X-RateLimit-Limit', rateCheck.limit.toString());
  response.headers.set('X-RateLimit-Remaining', (rateCheck.limit - rateCheck.currentCount).toString());
  response.headers.set('X-RateLimit-Reset', Math.ceil(rateCheck.resetTime / 1000).toString());

  return response;
}

export const config = {
  matcher: [
    '/((?!_next|static|.*\\.(?:ico|png|jpg|jpeg|svg|webp|gif|css|js|wasm|map|json|txt|xml)).*)',
  ],
};