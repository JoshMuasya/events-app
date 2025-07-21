import { NextResponse } from 'next/server';

// Define request body type
interface PaymentIntentRequest {
  ticketIds: string[];
  amount: number;
}

// Define response type
interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

// Mock function to simulate payment intent creation
async function createMockPaymentIntent(ticketIds: string[], amount: number) {
  // Simulate some processing delay
  await new Promise(resolve => setTimeout(resolve, 500));

  return {
    id: `pi_${Math.random().toString(36).substr(2, 9)}`,
    clientSecret: `cs_${Math.random().toString(36).substr(2, 9)}`,
    amount,
    currency: 'usd',
    status: 'requires_payment_method',
    metadata: {
      ticketIds: ticketIds.join(',')
    }
  };
}

export async function POST(request: Request) {
  try {
    const body: PaymentIntentRequest = await request.json();

    // Basic validation
    if (!body.ticketIds || !Array.isArray(body.ticketIds) || body.ticketIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or missing ticket IDs' },
        { status: 400 }
      );
    }
    if (!body.amount || body.amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    const paymentIntent = await createMockPaymentIntent(body.ticketIds, body.amount);

    return NextResponse.json<PaymentIntentResponse>({
      clientSecret: paymentIntent.clientSecret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create payment intent';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}