import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

/**
 * Satoshi Threats API
 * Returns list of recent security alerts and threat signatures
 */

export async function GET(request: NextRequest) {
    // 🛡️ Admin Verification
    const apiKey = request.headers.get('X-API-Key');
    const adminKey = process.env.ADMIN_API_KEY || process.env.NEXT_PUBLIC_ADMIN_API_KEY;

    if (!apiKey || apiKey !== adminKey) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);

        const alerts = await redis.lrange('btc:security:alerts', 0, limit - 1) || [];

        const threats = alerts.map((a: any, index: number) => {
            try {
                const data = typeof a === 'string' ? JSON.parse(a) : a;
                return {
                    id: `threat-${index}-${data.timestamp}`,
                    timestamp: data.timestamp,
                    ip: data.metadata?.ip || 'unknown',
                    score: data.metadata?.threatScore || 0.5,
                    signatures: [data.title || 'Unknown Signature'],
                    category: data.severity || 'medium',
                    action: data.severity === 'BYZANTINE' ? 'ban' : 'challenge', // Heuristic mapping
                    resolved: false
                };
            } catch (e) {
                return null;
            }
        }).filter(Boolean);

        return NextResponse.json(threats);
    } catch (error) {
        console.error('Threats API error:', error);
        return NextResponse.json({ error: 'System memory corruption' }, { status: 500 });
    }
}
