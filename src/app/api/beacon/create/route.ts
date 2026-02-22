import { NextRequest, NextResponse } from 'next/server';
// IMPORT CORREGIDO: Usamos la nueva librería unificada
import { getServerWallet, buildAndSignBeacon, fetchUtxos } from '@/lib/beacon';

/**
 * API para generar transacciones Beacon (Server-Side)
 * Endpoint: POST /api/beacon/create
 * 
 * Usa la wallet custodia del servidor (BEACON_WIF_KEY en .env).
 */
export async function POST(request: NextRequest) {
    try {
        // 1. Autenticación (Opcional, pero recomendada)
        const apiKey = request.headers.get('X-API-Key');
        // TODO: Validar apiKey si es necesario

        // 2. Leer el mensaje del usuario
        const body = await request.json();
        const { message } = body;

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // 3. OBTENER WALLET DEL SERVIDOR (Desde .env)
        // Esto usa la función getServerWallet() de la nueva librería
        const wallet = getServerWallet();

        // 4. BUSCAR FONDOS (UTXOs)
        const utxos = await fetchUtxos(wallet.address);
        
        if (utxos.length === 0) {
            return NextResponse.json({ 
                error: 'Server wallet has no funds', 
                hint: `Send sats to ${wallet.address}` 
            }, { status: 402 }); // 402 Payment Required ;)
        }

        // 5. CONSTRUIR Y FIRMAR TRANSACCIÓN
        // Usamos la función unificada buildAndSignBeacon
        const beaconData = buildAndSignBeacon(wallet.wif, utxos, message);

        // 6. Devolver resultado al Dashboard
        // Nota: Devolvemos el hex crudo. El Dashboard decide si broadcastea o lo guarda.
        return NextResponse.json({
            success: true,
            rawTx: beaconData.rawTx,
            txid: beaconData.txid,
            fee: beaconData.fee,
            message: beaconData.opReturn
        });

    } catch (error: any) {
        console.error('Beacon API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}