import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

/**
 * Satoshi Restorer API (Unban)
 * Permits an administrator to manually restore a node to consensus
 */

export async function POST(request: NextRequest) {
    // 🛡️ Admin Verification
    const apiKey = request.headers.get('X-API-Key');
    const adminKey = process.env.ADMIN_API_KEY || process.env.NEXT_PUBLIC_ADMIN_API_KEY;

    if (!apiKey || apiKey !== adminKey) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { ip } = await request.json();

        if (!ip) {
            return NextResponse.json({ error: 'Candidate IP required' }, { status: 400 });
        }

        // 1. Remove from active banlist
        const deleted = await redis.del(`btc:banlist:${ip}`);

        if (deleted === 0) {
            return NextResponse.json({
                success: false,
                message: 'Node was not in active banlist or already restored.'
            }, { status: 404 });
        }

        // 2. Clear failure counters to prevent immediate re-ban
        await redis.del(`btc:pow:failures:${ip}`);

        // 3. Log the restoration event in the audit trail
        const logEntry = {
            timestamp: Date.now(),
            ip,
            action: 'RESTORE_CONSENSUS',
            reason: 'Administrative manual overrides',
            administrator: 'Satoshi Core'
        };
        await redis.lpush('btc:pow:audit', JSON.stringify(logEntry));
        await redis.ltrim('btc:pow:audit', 0, 999);

        return NextResponse.json({
            success: true,
            message: `Node ${ip} has been successfully restored to the network.`
        });
    } catch (error) {
        console.error('Unban API error:', error);
        return NextResponse.json({ error: 'Consensus restoration failed' }, { status: 500 });
    }
}
