// src/app/api/tip/route.ts
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { amount, recipient, memo } = await req.json();

  // Integración con Blink, Strike, o tu nodo LND
  // Generar invoice y devolver paymentRequest
  
  return Response.json({ 
    paymentRequest: 'lnbc...',
    paymentHash: '...'
  });
}