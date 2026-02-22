import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

/**
 * Sistema Inmune: Historial de Tolerancia (Bypasses)
 * 
 * Analogía: Este endpoint revisa el "Laboratorio de Excepciones".
 * Muestra quién pidió clemencia y si el sistema se la concedió.
 */

export async function GET(request: NextRequest) {
    // 🛡️ 1. VERIFICACIÓN DE IDENTIDAD (Glóbulos Blancos)
    const apiKey = request.headers.get('X-API-Key');
    const adminKey = process.env.ADMIN_API_KEY; // CORREGIDO: Eliminada la variable pública

    if (!apiKey || apiKey !== adminKey) {
        return NextResponse.json({ error: 'Immune Privilege Denied' }, { status: 401 });
    }

    try {
        const limit = 50;
        
        // CORREGIDO: Usar la key correcta donde guardamos los datos en bypass/route.ts
        const logs = await redis.lrange('btc:bypass:audit', 0, limit - 1) || [];

        const bypassHistory = logs.map((l: any) => {
            try {
                const data = typeof l === 'string' ? JSON.parse(l) : l;
                
                return {
                    timestamp: data.timestamp || Date.now(),
                    ip: data.ip || 'unknown',
                    reason: data.reason || 'unspecified',
                    trustScore: data.trustScore || 0,
                    // CORREGIDO: Lógica estricta. Solo es aprobado si el registro lo dice.
                    // Eliminamos la heurística confusa del > 20.
                    approved: data.success === true, 
                };
            } catch (e) {
                return null;
            }
        }).filter(Boolean);

        return NextResponse.json(bypassHistory);
        
    } catch (error) {
        console.error('Bypass History API error:', error);
        return NextResponse.json({ error: 'Lab results unavailable' }, { status: 500 });
    }
}