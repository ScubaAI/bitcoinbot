// src/app/api/tip/route.ts
import { NextRequest } from 'next/server';

const BLINK_API_KEY = process.env.BLINK_API_KEY;
const BLINK_WALLET_ID = process.env.BLINK_WALLET_ID; // ← Agregado
const BLINK_URL = 'https://api.blink.sv/graphql';

export async function POST(req: NextRequest) {
  try {
    const { amount, recipient, memo } = await req.json();

    if (!amount || amount < 1) {
      return Response.json({ error: 'Monto inválido' }, { status: 400 });
    }

    if (!BLINK_API_KEY || !BLINK_WALLET_ID) {
      console.error('Faltan credenciales de Blink');
      return Response.json(
        { error: 'Servicio no configurado' }, 
        { status: 500 }
      );
    }

    const response = await fetch(BLINK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': BLINK_API_KEY,
      },
      body: JSON.stringify({
        query: `
          mutation LnInvoiceCreateOnBehalfOfRecipient($input: LnInvoiceCreateOnBehalfOfRecipientInput!) {
            lnInvoiceCreateOnBehalfOfRecipient(input: $input) {
              invoice {
                paymentRequest
                paymentHash
                paymentSecret
                satoshis
              }
              errors {
                message
              }
            }
          }
        `,
        variables: {
          input: {
            recipientWalletId: BLINK_WALLET_ID, // ← Usa tu wallet
            amount: amount.toString(),
            memo: memo || `Tip to ${recipient}`,
          },
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Blink HTTP error:', response.status, errorText);
      return Response.json(
        { error: `Error de Blink: ${response.status}` },
        { status: 502 }
      );
    }

    const data = await response.json();

    if (data.errors?.length > 0) {
      console.error('Blink GraphQL error:', data.errors);
      return Response.json(
        { error: data.errors[0].message || 'Error de Blink' },
        { status: 500 }
      );
    }

    const invoiceData = data.data?.lnInvoiceCreateOnBehalfOfRecipient;
    
    if (invoiceData?.errors?.length > 0) {
      console.error('Blink invoice error:', invoiceData.errors);
      return Response.json(
        { error: invoiceData.errors[0].message },
        { status: 500 }
      );
    }

    if (!invoiceData?.invoice?.paymentRequest) {
      return Response.json(
        { error: 'No se recibió paymentRequest' },
        { status: 500 }
      );
    }

    return Response.json({
      paymentRequest: invoiceData.invoice.paymentRequest,
      paymentHash: invoiceData.invoice.paymentHash,
      amount,
      recipient,
    });

  } catch (error) {
    console.error('Tip API error:', error);
    return Response.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}