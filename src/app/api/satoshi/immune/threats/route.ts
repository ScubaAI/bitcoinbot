import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

/**
 * Sistema Inmune: Monitor de Eventos Adversos (Threats)
 * 
 * Analogía: Cardioscopio en tiempo real.
 * Muestra cada arritmia detectada por el sistema inmunológico.
 */

export async function GET(request: NextRequest) {
    // 🛡️ 1. VERIFICACIÓN (Solo personal autorizado)
    const apiKey = request.headers.get('X-API-Key');
    const adminKey = process.env.ADMIN_API_KEY; // CORREGIDO: Llave privada únicamente

    if (!apiKey || apiKey !== adminKey) {
        return NextResponse.json({ error: 'Sterile area: Access denied' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        // Buenas prácticas: Limitar el rango para no saturar el monitor
        const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);

        // 2. LEER ALERTAS RECIENTES
        const alerts = await redis.lrange('btc:security:alerts', 0, limit - 1) || [];

        const threats = alerts.map((a: any, index: number) => {
            try {
                const data = typeof a === 'string' ? JSON.parse(a) : a;
                
                // CORREGIDO: Mapeo más preciso de los datos guardados en middleware
                // Asumiendo que middleware guarda: { ip, path, tier, threatScore, factors }
                return {
                    id: `alert-${data.timestamp}-${index}`,
                    timestamp: data.timestamp || Date.now(),
                    ip: data.ip || 'unknown',
                    score: data.threatScore || 0.5,
                    // 'factors' contiene los nombres reales de las firmas (ej. "SQL Injection")
                    signatures: data.factors || ['Unknown Pattern'],
                    category: data.severity || 'medium',
                    // Recuperar la acción real si existe, o deducirla lógicamente
                    action: data.action || (data.threatScore >= 0.85 ? 'ban' : 'challenge'),
                    resolved: false // Podrías implementar lógica para marcar alertas leídas
                };
            } catch (e) {
                return null; // Descartar registros corruptos
            }
        }).filter(Boolean);

        return NextResponse.json(threats);
        
    } catch (error) {
        console.error('Vital signs monitor failure:', error);
        return NextResponse.json({ error: 'Screen disconnect' }, { status: 500 });
    }
}