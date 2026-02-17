import { NextRequest, NextResponse } from 'next/server';
import { TipRequest, TipResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, recipient, message } = body as TipRequest;

    if (!amount || !recipient) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // This is a placeholder for Blink/Cashu Lightning payment integration
    // In production, you would integrate with Blink's API
    // See: https://blink.sv/developers
    
    // Example: Create a payment request
    // const blinkResponse = await fetch('https://api.blink.sv/v1/payments', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.BLINK_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     amount: amount, // in satoshis
    //     recipient: recipient,
    //     message: message,
    //   }),
    // });

    // For now, return a mock response
    const response: TipResponse = {
      success: true,
      paymentRequest: 'lnbc100n1p0...', // Mock payment request
      message: 'Payment request created successfully',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Tip API error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment request' },
      { status: 500 }
    );
  }
}
