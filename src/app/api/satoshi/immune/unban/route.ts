import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

/**
 * Sistema Inmune: Protocolo de Alta Médica (Unban)
 * 
 * Analogía: El médico principal firma el alta y da un pase temporal
 * para que el paciente no sea detenido en la puerta por seguridad.
 */

export async function POST(request: NextRequest) {
    // 🛡️ 1. VERIFICACIÓN (Solo el Jefe de Médicos)
    const apiKey = request.headers.get('X-API-Key');
    const adminKey = process.env.ADMIN_API_KEY; // CORREGIDO: Sin llave pública

    if (!apiKey || apiKey !== adminKey) {
        return NextResponse.json({ error: 'Only Chief of Medicine can discharge' }, { status: 401 });
    }

    try {
        const { ip } = await request.json();

        if (!ip) {
            return NextResponse.json({ error: 'Patient ID required' }, { status: 400 });
        }

        // 2. QUIMIOTERAPIA INVERSA (Eliminar aislamiento)
        const deleted = await redis.del(`btc:banlist:${ip}`);

        if (deleted === 0) {
            return NextResponse.json({
                success: false,
                message: 'Patient not found in quarantine.'
            }, { status: 404 });
        }

        // 3. LIMPIEZA DE ANTICUERPOS (Prevención de re-ban inmediato)
        // Limpiamos contadores de fallos pasados
        await redis.del(`btc:pow:failures:${ip}`);
        
        // CORREGIDO: Administrar "Vacuna Temporal"
        // Esto le da 1 hora de inmunidad para navegar sin que el middleware lo re-banee por viejos patrones
        await redis.setex(`btc:immune:verified:${ip}`, 3600, 'admin-unban');

        // 4. REGISTRO CLÍNICO
        const logEntry = {
            timestamp: Date.now(),
            ip,
            event: 'MANUAL_DISCHARGE',
            reason: 'Administrative override',
            actor: 'Admin Dashboard'
        };
        await redis.lpush('btc:immune:audit', JSON.stringify(logEntry)); // Usamos audit general
        await redis.ltrim('btc:immune:audit', 0, 999);

        return NextResponse.json({
            success: true,
            message: `Node ${ip} discharged successfully. Temporary immunity applied.`
        });
        
    } catch (error) {
        console.error('Discharge protocol failure:', error);
        return NextResponse.json({ error: 'Hospital system error' }, { status: 500 });
    }
}