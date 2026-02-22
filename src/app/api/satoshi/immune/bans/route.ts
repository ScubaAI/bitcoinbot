import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

/**
 * Sistema Inmune: Listado de Nódulos Linfáticos Activos (Bans)
 * 
 * Analogía: Este endpoint es el "Monitor de Cuarentena".
 * Muestra qué patógenos (IPs) están aislados del cuerpo.
 */

export async function GET(request: NextRequest) {
    // 🛡️ 1. VERIFICACIÓN DE IDENTIDAD (Glóbulos Blancos de Seguridad)
    const apiKey = request.headers.get('X-API-Key');
    const adminKey = process.env.ADMIN_API_KEY; // CORREGIDO: Eliminada la variable pública

    if (!apiKey || apiKey !== adminKey) {
        return NextResponse.json({ error: 'Inmunodeficiency: Unauthorized' }, { status: 401 });
    }

    try {
        // 2. OBTENER HISTORIAL DE INFECCIONES
        const banHistory = await redis.lrange('btc:immune:byzantine:nodes', 0, 99) || [];
        if (!banHistory.length) return NextResponse.json([]);

        // 3. PREPARAR DATOS (Diagnóstico preventivo)
        const parsedHistory = banHistory.map((b: any) => {
            try {
                return typeof b === 'string' ? JSON.parse(b) : b;
            } catch {
                return null;
            }
        }).filter(Boolean); // Limpiar datos corruptos

        // 4. VERIFICACIÓN EN MASA (Respuesta Inmune Eficiente)
        // En lugar de ir cama por cama, usamos el intercomunicador (Pipeline)
        const pipeline = redis.pipeline();
        parsedHistory.forEach(node => {
            pipeline.exists(`btc:banlist:${node.ip}`);
        });
        
        const existenceResults = await pipeline.exec();

        // 5. FILTRAR SOLO ACTIVOS (Pacientes aún en cuarentena)
        const activeBans = parsedHistory.filter((node, index) => {
            // existenceResults[index] devuelve 1 si existe, 0 si no
            return existenceResults[index] === 1;
        });

        // 6. FORMATEAR REPORTE MÉDICO
        const report = activeBans.map(data => ({
            ip: data.ip,
            reason: data.reason || 'Byzantine behavior',
            timestamp: data.timestamp || Date.now(),
            expires: data.expires || (Date.now() + 3600000),
            nodeType: data.nodeType || 'byzantine',
            previousBans: data.previousBans || 0
        }));

        return NextResponse.json(report);

    } catch (error) {
        console.error('Immune System Failure:', error);
        return NextResponse.json({ error: 'Autoimmune error: System overload' }, { status: 500 });
    }
}