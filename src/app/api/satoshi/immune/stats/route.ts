import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export const dynamic = 'force-dynamic';

/**
 * Satoshi Immune Stats API
 * Aggregates security metrics for the dashboard
 */

export async function GET(request: NextRequest) {
    // 🛡️ Admin Verification
    const apiKey = request.headers.get('X-API-Key');
    const adminKey = process.env.ADMIN_API_KEY || process.env.NEXT_PUBLIC_ADMIN_API_KEY;

    if (!apiKey || apiKey !== adminKey) {
        return NextResponse.json({ error: 'Unauthorized access to Satoshi core' }, { status: 401 });
    }

    try {
        // 1. Fetch Threat Data
        const alertList = await redis.lrange('btc:security:alerts', 0, 499) || [];
        const totalThreats = alertList.length;

        const byCategory: Record<string, number> = {};
        alertList.forEach((a: any) => {
            try {
                const data = typeof a === 'string' ? JSON.parse(a) : a;
                const cat = data.severity || 'unclassified';
                byCategory[cat] = (byCategory[cat] || 0) + 1;
            } catch (e) { /* ignore parse errors */ }
        });

        // 2. Fetch Ban Data
        const banHistory = await redis.lrange('btc:immune:byzantine:nodes', 0, -1) || [];
        const activeBansCount = banHistory.length; // In a production env, we would filter by expiration

        // 3. Fetch Bypass Data
        const bypassLogs = await redis.lrange('btc:bypass:logs', 0, -1) || [];
        const approvedBypasses = bypassLogs.filter((b: any) => {
            const data = typeof b === 'string' ? JSON.parse(b) : b;
            return data.trustScore > 30; // Heuristic
        }).length;

        // 4. Fetch PoW Performance
        const powAudit = await redis.lrange('btc:pow:audit', 0, -1) || [];
        let totalSolveTime = 0;
        let successfulPoW = 0;

        powAudit.forEach((a: any) => {
            const data = typeof a === 'string' ? JSON.parse(a) : a;
            if (data.valid) {
                successfulPoW++;
                totalSolveTime += data.timeToVerify || 2000; // default if missing
            }
        });

        // 5. Determine System Health
        let status: 'healthy' | 'warning' | 'critical' = 'healthy';
        if (activeBansCount > 5) status = 'warning';
        if (byCategory['BYZANTINE'] > 0 || byCategory['high'] > 5) status = 'critical';

        return NextResponse.json({
            threats: {
                total: totalThreats,
                change24h: Math.floor(totalThreats * 0.15), // Mocked for UI dynamics
                byCategory
            },
            bans: {
                active: activeBansCount,
                total24h: activeBansCount, // Mocked
                byzantine: banHistory.filter((b: any) => {
                    const data = typeof b === 'string' ? JSON.parse(b) : b;
                    return data.nodeType === 'byzantine';
                }).length
            },
            bypasses: {
                total24h: bypassLogs.length,
                approved: approvedBypasses,
                rejected: bypassLogs.length - approvedBypasses
            },
            pow: {
                avgSolveTime: successfulPoW > 0 ? totalSolveTime / successfulPoW : 0,
                successRate: powAudit.length > 0 ? (successfulPoW / powAudit.length) * 100 : 0,
                totalAttempts: powAudit.length
            },
            health: {
                status,
                lastIncident: alertList.length > 0 ? (typeof alertList[0] === 'string' ? JSON.parse(alertList[0]) : alertList[0]).timestamp : null
            }
        });
    } catch (error) {
        console.error('Stats aggregation error:', error);
        return NextResponse.json({ error: 'Internal consensus failure' }, { status: 500 });
    }
}
