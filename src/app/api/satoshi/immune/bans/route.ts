import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

/**
 * Satoshi Active Bans API
 * Returns list of currently restricted nodes
 */

export async function GET(request: NextRequest) {
    // 🛡️ Admin Verification
    const apiKey = request.headers.get('X-API-Key');
    const adminKey = process.env.ADMIN_API_KEY || process.env.NEXT_PUBLIC_ADMIN_API_KEY;

    if (!apiKey || apiKey !== adminKey) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Fetch ban history and verify residency
        const banHistory = await redis.lrange('btc:immune:byzantine:nodes', 0, 99) || [];

        const activeBans = await Promise.all(banHistory.map(async (b: any) => {
            try {
                const data = typeof b === 'string' ? JSON.parse(b) : b;

                // Check if the ban is still active in the main bitmask
                const exists = await redis.exists(`btc:banlist:${data.ip}`);
                if (!exists) return null;

                return {
                    ip: data.ip,
                    reason: data.reason || 'Byzantine action',
                    timestamp: data.timestamp || Date.now(),
                    expires: data.expires || (Date.now() + 3600000),
                    nodeType: data.nodeType || 'byzantine',
                    previousBans: data.previousBans || 0
                };
            } catch (e) {
                return null;
            }
        }));

        // Filter out expired or invalid bans
        return NextResponse.json(activeBans.filter(Boolean));
    } catch (error) {
        console.error('Bans API error:', error);
        return NextResponse.json({ error: 'Failed to access banlist' }, { status: 500 });
    }
}
