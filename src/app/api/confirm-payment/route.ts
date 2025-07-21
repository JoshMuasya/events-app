import { NextResponse } from 'next/server';

interface ConfirmPaymentRequest {
    clientSecret: string;
    paymentMethod: {
        card: {
            number: string;
            exp_month: number;
            exp_year: number;
            cvc: string;
        };
    };
}

export async function POST(request: Request) {
    try {
        const body: ConfirmPaymentRequest = await request.json();
        const { clientSecret } = body;

        // Simulate payment confirmation logic
        const isSuccess = process.env.MOCK_PAYMENT_SUCCESS === 'true' || body.paymentMethod.card.number === '4242424242424242';

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 500));

        if (!isSuccess) {
            return NextResponse.json(
                {
                    error: { message: 'Payment failed: Invalid card details' },
                },
                { status: 400 }
            );
        }

        return NextResponse.json({
            paymentIntent: {
                id: `pi_${Math.random().toString(36).substr(2, 9)}`,
                status: 'succeeded',
                client_secret: clientSecret,
            },
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to confirm payment';
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}