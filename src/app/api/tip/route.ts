// src/app/api/tip/route.ts
import { NextRequest } from 'next/server';

const BLINK_API_KEY = process.env.BLINK_API_KEY;
const BLINK_URL = 'https://api.blink.sv/graphql';

export async function POST(req: NextRequest) {
  try {
    const { amount, recipient, memo } = await req.json();

    if (!amount || amount < 1) {
      return Response.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Llamar a Blink para crear invoice
    const response = await fetch(BLINK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': BLINK_API_KEY!,
      },
      body: JSON.stringify({
        query: `
          mutation LnInvoiceCreate($input: LnInvoiceCreateInput!) {
            lnInvoiceCreate(input: $input) {
              invoice {
                paymentRequest
                paymentHash
              }
              errors {
                message
              }
            }
          }
        `,
        variables: {
          input: {
            amount: amount.toString(),
            memo: memo || `Tip to ${recipient}`,
          },
        },
      }),
    });

    const data = await response.json();

    if (data.errors || data.data?.lnInvoiceCreate?.errors?.length > 0) {
      console.error('Blink error:', data.errors || data.data?.lnInvoiceCreate?.errors);
      return Response.json(
        { error: 'Failed to create invoice' },
        { status: 500 }
      );
    }

    const { paymentRequest, paymentHash } = data.data.lnInvoiceCreate.invoice;

    return Response.json({
      paymentRequest,
      paymentHash,
      amount,
      recipient,
    });
  } catch (error) {
    console.error('Tip API error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}