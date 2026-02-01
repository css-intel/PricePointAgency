// Netlify Function: Create Booking Checkout Session
// Path: /api/create-booking-checkout

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Price per 15-minute block in cents
const PRICE_PER_BLOCK = 2500; // $25 per 15 minutes

export async function handler(event: any) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { durationMinutes, scheduledAt, userEmail, consultationType, intakeText } = JSON.parse(event.body);

    // Calculate price based on duration
    const blocks = Math.ceil(durationMinutes / 15);
    const priceInCents = blocks * PRICE_PER_BLOCK;

    // Create Stripe checkout session for paid advisory session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Advisory Session - ${durationMinutes} minutes`,
              description: `${consultationType === 'phone' ? 'Phone' : 'Video'} consultation on ${new Date(scheduledAt).toLocaleDateString()}`,
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.SITE_URL || 'http://localhost:8888'}/dashboard?booking=success`,
      cancel_url: `${process.env.SITE_URL || 'http://localhost:8888'}/book?cancelled=true`,
      customer_email: userEmail,
      metadata: {
        type: 'advisory_session',
        durationMinutes: durationMinutes.toString(),
        scheduledAt,
        consultationType: consultationType || 'video',
        intakeText: intakeText?.substring(0, 500) || '', // Stripe metadata limit
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        sessionId: session.id,
        url: session.url
      }),
    };
  } catch (error: any) {
    console.error('Error creating booking checkout:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
