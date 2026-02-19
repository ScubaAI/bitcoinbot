import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

/**
 * Satoshi Bypass History API
 * Returns list of human-declared bypass attempts
 */

export async function GET(request: NextRequest) {
    // 🛡️ Admin Verification
    const apiKey = request.headers.get('X-API-Key');
    const adminKey = process.env.ADMIN_API_KEY || process.env.NEXT_PUBLIC_ADMIN_API_KEY;

    if (!apiKey || apiKey !== adminKey) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const limit = 50;
        const logs = await redis.lrange('btc:bypass:logs', 0, limit - 1) || [];

        const bypassHistory = logs.map((l: any) => {
            try {
                const data = typeof l === 'string' ? JSON.parse(l) : l;
                return {
                    timestamp: data.timestamp || Date.now(),
                    ip: data.ip || 'unknown',
                    reason: data.reason || 'unspecified',
                    trustScore: data.trustScore || 0,
                    approved: data.success || (data.trustScore > 20) // Heuristic
                };
            } catch (e) {
                return null;
            }
        }).filter(Boolean);

        return NextResponse.json(bypassHistory);
    } catch (error) {
        console.error('Bypass API error:', error);
        return NextResponse.json({ error: 'Bypass registry inaccessible' }, { status: 500 });
    }
}
