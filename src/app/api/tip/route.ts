import { NextRequest, NextResponse } from 'next/server';

const BLINK_API_URL = 'https://api.blink.sv/graphql';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { amount, memo } = body;

        // 1. Validación básica
        if (!amount || amount < 1000) { // Mínimo 1000 sats
            return NextResponse.json({ error: 'Minimum amount is 1000 sats' }, { status: 400 });
        }

        // 2. Crear Invoice en Blink via GraphQL
        // Usamos la API pública de Blink para crear invoices sin necesidad de SDK complejos
        // Documentación: https://dev.blink.sv/
        const mutation = `
            mutation LnInvoiceCreate($input: LnInvoiceCreateInput!) {
                lnInvoiceCreate(input: $input) {
                    invoice {
                        paymentRequest
                        paymentHash
                        paymentSecret
                    }
                    errors {
                        message
                    }
                }
            }
        `;

        // Nota: Para crear invoices EN NOMBRE DE UN USUARIO (scubapav@blink.sv),
        // necesitas un token de autenticación del usuario (API Key personal) o usar la API Admin.
        // Si solo quieres recibir en TU cuenta, usaremos la API Key que configuramos antes.
        
        // Ajuste: Usaremos el endpoint de "Receive Payment" simplificado si tienes tu API Key de Blink
        // o un wrapper si lo tienes configurado en .env como BLINK_API_KEY
        
        const variables = {
            input: {
                amount: Math.floor(amount), // Sats
                memo: memo || "Bitcoin Agent Tip",
                walletId: process.env.BLINK_WALLET_ID // Tu wallet ID de .env
            }
        };

        const response = await fetch(BLINK_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': process.env.BLINK_API_KEY || '' // Tu clave de .env
            },
            body: JSON.stringify({
                query: mutation,
                variables: variables
            })
        });

        const data = await response.json();
        
        if (data.errors || !data.data?.lnInvoiceCreate?.invoice) {
            console.error('Blink Error:', data.errors);
            throw new Error(data.errors?.[0]?.message || 'Failed to create invoice');
        }

        const paymentRequest = data.data.lnInvoiceCreate.invoice.paymentRequest;

        return NextResponse.json({
            success: true,
            paymentRequest: paymentRequest
        });

    } catch (error: any) {
        console.error('Tip API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}