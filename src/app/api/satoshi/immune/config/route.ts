import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

/**
 * Sistema Inmune: Hipotálamo de Configuración
 * 
 * Analogía: Controla la agresividad del sistema.
 * Paranoia Mode = Estado de Estrés Agudo (inmunidad máxima).
 */

export async function POST(request: NextRequest) {
    // 🛡️ 1. VERIFICACIÓN (Solo Glóbulos Blancos Especiales)
    const apiKey = request.headers.get('X-API-Key');
    const adminKey = process.env.ADMIN_API_KEY; // CORREGIDO

    if (!apiKey || apiKey !== adminKey) {
        return NextResponse.json({ error: 'Homeostasis violation' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { paranoiaMode } = body;

        if (typeof paranoiaMode !== 'boolean') {
            return NextResponse.json({ error: 'Invalid signal' }, { status: 400 });
        }

        // 2. APLICAR CAMBIO (Ajuste hormonal global)
        await redis.set('btc:config:paranoia', paranoiaMode ? 'true' : 'false');

        // 3. REGISTRO CLÍNICO (Auditoría separada)
        const logEntry = {
            timestamp: Date.now(),
            event: 'SYSTEM_CONFIG_CHANGE',
            parameter: 'paranoiaMode',
            value: paranoiaMode,
            actor: 'Admin Dashboard'
        };
        // CORREGIDO: Usar una lista de auditoría de sistema dedicada
        await redis.lpush('btc:immune:system:audit', JSON.stringify(logEntry));

        return NextResponse.json({
            success: true,
            message: `Nervous system updated: Paranoia ${paranoiaMode ? 'HIGH' : 'NORMAL'}`
        });
    } catch (error) {
        console.error('Hypothalamus error:', error);
        return NextResponse.json({ error: 'Neural disconnect' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    const apiKey = request.headers.get('X-API-Key');
    const adminKey = process.env.ADMIN_API_KEY; // CORREGIDO

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