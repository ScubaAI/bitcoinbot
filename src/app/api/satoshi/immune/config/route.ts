import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

/**
 * Satoshi Config API
 * Adjusts global security parameters of the Digital Immune System
 */

export async function POST(request: NextRequest) {
    // 🛡️ Admin Verification
    const apiKey = request.headers.get('X-API-Key');
    const adminKey = process.env.ADMIN_API_KEY || process.env.NEXT_PUBLIC_ADMIN_API_KEY;

    if (!apiKey || apiKey !== adminKey) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { paranoiaMode } = body;

        if (typeof paranoiaMode !== 'boolean') {
            return NextResponse.json({ error: 'Invalid configuration payload' }, { status: 400 });
        }

        // Apply configuration change to Redis
        await redis.set('btc:config:paranoia', paranoiaMode ? 'true' : 'false');

        // Log configuration change
        const logEntry = {
            timestamp: Date.now(),
            action: 'CONFIG_CHANGE',
            parameter: 'paranoiaMode',
            value: paranoiaMode,
            administrator: 'Satoshi Core'
        };
        await redis.lpush('btc:pow:audit', JSON.stringify(logEntry));

        return NextResponse.json({
            success: true,
            message: `Global security state updated: Paranoia Mode ${paranoiaMode ? 'ACTIVATED' : 'DEACTIVATED'}`
        });
    } catch (error) {
        console.error('Config API error:', error);
        return NextResponse.json({ error: 'Failed to synchronize configuration' }, { status: 500 });
    }
}

/**
 * GET Handler for reading current config
 */
export async function GET(request: NextRequest) {
    const apiKey = request.headers.get('X-API-Key');
    const adminKey = process.env.ADMIN_API_KEY || process.env.NEXT_PUBLIC_ADMIN_API_KEY;

    if (!apiKey || apiKey !== adminKey) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const paranoia = await redis.get('btc:config:paranoia');
        return NextResponse.json({
            paranoiaMode: paranoia === 'true'
        });
    } catch (error) {
        return NextResponse.json({ error: 'Config inaccessible' }, { status: 500 });
    }
}
