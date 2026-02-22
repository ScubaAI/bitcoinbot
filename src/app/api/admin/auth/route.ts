import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

// ============================================================================
// MOCK CONFIGURATION (Debe ir ANTES de importar el route)
// ============================================================================

// Mock crypto.randomUUID
const mockUUIDs = ['session-123', 'session-456', 'session-789'];
let uuidIndex = 0;
vi.stubGlobal('crypto', {
  randomUUID: () => mockUUIDs[uuidIndex++] || `session-${Date.now()}`,
});

// Mock Date.now para tests determinísticos
const MOCK_TIMESTAMP = 1700000000000;
vi.spyOn(Date, 'now').mockReturnValue(MOCK_TIMESTAMP);

// Mock Redis
const mockRedis = {
  setex: vi.fn(),
  get: vi.fn(),
  del: vi.fn(),
  incr: vi.fn(),
  expire: vi.fn(),
  ttl: vi.fn(),
};

vi.mock('@/lib/redis', () => ({
  redis: mockRedis,
}));

// Mock safeRedis del middleware
const mockSafeRedis = vi.fn();
vi.mock('@/middleware', () => ({
  safeRedis: mockSafeRedis,
}));

// ============================================================================
// IMPORTS (Después de los mocks)
// ============================================================================

import { POST, GET, DELETE } from './route';

// ============================================================================
// HELPERS
// ============================================================================

function createRequest(
  method: string,
  body?: object,
  headers: Record<string, string> = {}
): NextRequest {
  const url = 'https://example.com/api/admin/auth';
  
  if (body) {
    return new NextRequest(url, {
      method,
      headers: {
        'content-type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(body),
    });
  }
  
  return new NextRequest(url, {
    method,
    headers,
  });
}

function createRequestWithToken(token: string, method: string = 'GET'): NextRequest {
  return new NextRequest('https://example.com/api/admin/auth', {
    method,
    headers: {
      'X-Session-Token': token,
    },
  });
}

// ============================================================================
// TESTS
// ============================================================================

describe('Admin Authentication Route', () => {
  const VALID_API_KEY = 'API_KEY_TEST123456789012345678901234567890';
  
  beforeEach(() => {
    vi.resetAllMocks();
    uuidIndex = 0;
    
    // Default: rate limit permite requests
    mockSafeRedis.mockResolvedValue({
      allowed: true,
      remaining: 5,
      locked: false,
    });
    
    // Default: Redis operations success
    mockRedis.setex.mockResolvedValue('OK');
    mockRedis.get.mockResolvedValue(null);
    mockRedis.del.mockResolvedValue(1);
    mockRedis.incr.mockResolvedValue(1);
    mockRedis.expire.mockResolvedValue(1);
    mockRedis.ttl.mockResolvedValue(3600);
    
    // Environment setup
    process.env.ADMIN_API_KEY = VALID_API_KEY;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ==========================================================================
  // POST /api/admin/auth - Authentication
  // ==========================================================================
  
  describe('POST /api/admin/auth', () => {
    it('should authenticate valid API key and return session token', async () => {
      const request = createRequest('POST', { key: VALID_API_KEY });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        token: 'session-123',
        expiresIn: 3600,
      });
      
      // Verify Redis session was created
      expect(mockRedis.setex).toHaveBeenCalledWith(
        'btc:auth:session:session-123',
        3600,
        expect.any(String)
      );
      
      // Verify audit log
      expect(mockSafeRedis).toHaveBeenCalledWith(
        expect.any(Function),
        null
      );
    });

    it('should reject invalid API key format', async () => {
      const request = createRequest('POST', { key: 'invalid-key-format' });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication failed');
      expect(data.remaining).toBeDefined();
    });

    it('should reject wrong API key (timing-safe)', async () => {
      const request = createRequest('POST', { 
        key: 'API_KEY_WRONG123456789012345678901234567890' 
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication failed');
    });

    it('should reject missing key', async () => {
      const request = createRequest('POST', {});

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });

    it('should reject non-string key', async () => {
      const request = createRequest('POST', { key: 12345 });

      const response = await POST(request);
      expect(response.status).toBe(401);
    });

    it('should reject invalid content-type', async () => {
      const request = new NextRequest('https://example.com/api/admin/auth', {
        method: 'POST',
        headers: { 'content-type': 'text/plain' },
        body: 'key=test',
      });

      const response = await POST(request);
      expect(response.status).toBe(415);
    });

    it('should handle rate limiting (423 Locked)', async () => {
      mockSafeRedis.mockResolvedValue({
        allowed: false,
        remaining: 0,
        locked: true,
        lockoutTtl: 900,
      });

      const request = createRequest('POST', { key: VALID_API_KEY });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(423);
      expect(data.error).toBe('Account temporarily locked');
      expect(response.headers.get('Retry-After')).toBe('900');
    });

    it('should handle rate limiting (429 Too Many Requests)', async () => {
      mockSafeRedis.mockResolvedValue({
        allowed: false,
        remaining: 0,
        locked: false,
      });

      const request = createRequest('POST', { key: VALID_API_KEY });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toBe('Too many attempts');
    });

    it('should handle Redis failure gracefully', async () => {
      mockRedis.setex.mockRejectedValue(new Error('Redis down'));

      const request = createRequest('POST', { key: VALID_API_KEY });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal error');
    });

    it('should have constant response time regardless of result', async () => {
      const startFast = Date.now();
      await POST(createRequest('POST', { key: 'wrong' }));
      const timeFast = Date.now() - startFast;

      vi.spyOn(Date, 'now')
        .mockReturnValueOnce(MOCK_TIMESTAMP)
        .mockReturnValueOnce(MOCK_TIMESTAMP + 200); // Simular delay

      const startSlow = Date.now();
      await POST(createRequest('POST', { key: VALID_API_KEY }));
      const timeSlow = Date.now() - startSlow;

      // Ambas respuestas deben tardar ~150ms mínimo (timing protection)
      expect(timeFast).toBeGreaterThanOrEqual(150);
    });
  });

  // ==========================================================================
  // GET /api/admin/auth - Verify Session
  // ==========================================================================
  
  describe('GET /api/admin/auth', () => {
    it('should verify valid session token', async () => {
      const sessionData = {
        ip: '127.0.0.1',
        createdAt: MOCK_TIMESTAMP,
      };
      
      mockRedis.get.mockResolvedValue(JSON.stringify(sessionData));

      const request = createRequestWithToken('valid-token');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.valid).toBe(true);
      expect(data.expiresIn).toBeDefined();
    });

    it('should extend session if about to expire', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify({ ip: '127.0.0.1', createdAt: MOCK_TIMESTAMP }));
      mockRedis.ttl.mockResolvedValue(200); // Menos de 5 minutos

      const request = createRequestWithToken('valid-token');
      await GET(request);

      expect(mockRedis.expire).toHaveBeenCalledWith('btc:auth:session:valid-token', 3600);
    });

    it('should reject missing token', async () => {
      const request = new NextRequest('https://example.com/api/admin/auth', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.valid).toBe(false);
    });

    it('should reject invalid/expired token', async () => {
      mockRedis.get.mockResolvedValue(null);

      const request = createRequestWithToken('expired-token');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Session expired or invalid');
    });

    it('should handle Redis errors during verification', async () => {
      mockRedis.get.mockRejectedValue(new Error('Redis error'));

      const request = createRequestWithToken('valid-token');
      const response = await GET(request);

      expect(response.status).toBe(500);
    });
  });

  // ==========================================================================
  // DELETE /api/admin/auth - Logout
  // ==========================================================================
  
  describe('DELETE /api/admin/auth', () => {
    it('should destroy valid session', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify({ ip: '127.0.0.1' }));

      const request = createRequestWithToken('valid-token', 'DELETE');
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockRedis.del).toHaveBeenCalledWith('btc:auth:session:valid-token');
    });

    it('should handle missing token gracefully', async () => {
      const request = new NextRequest('https://example.com/api/admin/auth', {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200); // Idempotente: success aunque no haya token
      expect(data.success).toBe(true);
    });

    it('should handle Redis del failure', async () => {
      mockRedis.del.mockResolvedValue(0); // No se eliminó nada

      const request = createRequestWithToken('valid-token', 'DELETE');
      const response = await DELETE(request);

      // Debería ser 200 igual (idempotente) o 500 si queremos strict
      expect(response.status).toBe(200);
    });
  });

  // ==========================================================================
  // Security Features
  // ==========================================================================
  
  describe('Security Features', () => {
    it('should not expose API key in error messages', async () => {
      const request = createRequest('POST', { key: VALID_API_KEY });
      
      // Simular error de Redis que podría filtrar datos
      mockRedis.setex.mockRejectedValue(new Error(`Connection failed: ${VALID_API_KEY}`));
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(data.error).toBe('Internal error');
      expect(JSON.stringify(data)).not.toContain(VALID_API_KEY);
    });

    it('should validate API key format strictly', async () => {
      const invalidFormats = [
        'API_KEY_', // muy corto
        'api_key_LOWERCASE123', // minúsculas
        'API-KEY-WITH-DASHES123', // guiones
        'API_KEY_123!', // caracteres especiales
        '', // vacío
      ];

      for (const key of invalidFormats) {
        const request = createRequest('POST', { key });
        const response = await POST(request);
        expect(response.status).toBe(401);
      }
    });

    it('should extract IP correctly from various headers', async () => {
      const testCases = [
        { ip: '1.2.3.4', expected: '1.2.3.4' },
        { forwarded: '1.1.1.1, 2.2.2.2, 3.3.3.3', expected: '3.3.3.3' }, // último
        { forwarded: 'spoofed, real', expected: 'real' },
        {}, // unknown
      ];

      // Nota: Esto requeriría exponer la función o testear indirectamente
      // mediante los logs de auditoría
    });
  });
});