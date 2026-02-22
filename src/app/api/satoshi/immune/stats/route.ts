import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export const dynamic = 'force-dynamic';

/**
 * Sistema Inmune: Monitor de Signos Vitales
 * 
 * Analogía: Revisa los marcadores inflamatorios y cuenta los patógenos activos.
 */

export async function GET(request: NextRequest) {
    // 🛡️ 1. VERIFICACIÓN (Seguridad Estricta)
    const apiKey = request.headers.get('X-API-Key');
    const adminKey = process.env.ADMIN_API_KEY; // CORREGIDO: Sin llave pública

    if (!apiKey || apiKey !== adminKey) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 2. FETCH EFICIENTE (No traer todo el historial, solo contar)
        // Usamos LLEN para contar rápido, y solo traemos muestras pequeñas si necesitamos detalles
        
        // Amenazas (Traemos últimas 100 para categorizar, no 500)
        const alertList = await redis.lrange('btc:security:alerts', 0, 99) || [];
        const totalThreats = await redis.llen('btc:security:alerts'); // Conteo rápido

        const byCategory: Record<string, number> = {};
        alertList.forEach((a: any) => {
            try {
                const data = typeof a === 'string' ? JSON.parse(a) : a;
                const cat = data.severity || 'unclassified';
                byCategory[cat] = (byCategory[cat] || 0) + 1;
            } catch (e) { /* ignore */ }
        });

        // Bans (Contar historial vs verificar activos es costoso, simplificamos para el dashboard)
        // En producción real, mantendríamos un contador incremental en Redis (INCR)
        const activeBansCount = await redis.llen('btc:immune:byzantine:nodes');

        // Bypasses (CORREGIDO: Usar la key correcta 'btc:bypass:audit')
        const bypassCount = await redis.llen('btc:bypass:audit');
        const bypassLogsSample = await redis.lrange('btc:bypass:audit', 0, 49); // Muestra pequeña
        const approvedBypasses = bypassLogsSample.filter((b: any) => {
            const data = typeof b === 'string' ? JSON.parse(b) : b;
            return data.success; // CORREGIDO: Usar data.success en lugar de heurística
        }).length;

        // PoW Performance
        const powCount = await redis.llen('btc:pow:audit');
        const powSample = await redis.lrange('btc:pow:audit', 0, 49); // Muestra pequeña
        let totalSolveTime = 0;
        let successfulPoW = 0;

        powSample.forEach((a: any) => {
            const data = typeof a === 'string' ? JSON.parse(a) : a;
            if (data.valid) {
                successfulPoW++;
                totalSolveTime += data.timeToVerify || 0;
            }
        });

        // 3. DIAGNÓSTICO DE SALUD (Lógica Realista)
        // Crítico solo si hay muchos eventos graves recientes o bans masivos
        let status: 'healthy' | 'warning' | 'critical' = 'healthy';
        if (activeBansCount > 20 || (byCategory['critical'] || 0) > 5) status = 'warning';
        if (activeBansCount > 100 || (byCategory['critical'] || 0) > 20) status = 'critical';

        return NextResponse.json({
            threats: {
                total: totalThreats,
                change24h: Math.floor(totalThreats * 0.15), // Mocked trend
                byCategory
            },
            bans: {
                active: activeBansCount, // Nota: Esto es historial total, no solo activos
                total24h: activeBansCount, 
                byzantine: (byCategory['BYZANTINE'] || 0) // Reutilizando categoría
            },
            bypasses: {
                total24h: bypassCount,
                approved: approvedBypasses,
                rejected: bypassCount - approvedBypasses
            },
            pow: {
                avgSolveTime: successfulPoW > 0 ? totalSolveTime / successfulPoW : 0,
                successRate: powCount > 0 ? (successfulPoW / powSample.length) * 100 : 0,
                totalAttempts: powCount
            },
            health: {
                status,
                lastIncident: alertList.length > 0 ? (typeof alertList[0] === 'string' ? JSON.parse(alertList[0]) : alertList[0]).timestamp : null
            }
        });
    } catch (error) {
        console.error('Vital Signs Monitor Failure:', error);
        return NextResponse.json({ error: 'Flatline' }, { status: 500 });
    }
}