// Netlify Function: Create Subscription Checkout Session
// Path: /api/create-subscription-checkout

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const SUBSCRIPTION_PRICE = 1400; // $14/month

export async function handler(event: any) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { userEmail } = JSON.parse(event.body);

    // Create or retrieve Stripe price
    // In production, you'd create this once and store the price ID
    const price = await stripe.prices.create({
      unit_amount: SUBSCRIPTION_PRICE,
      currency: 'usd',
      recurring: { interval: 'month' },
      product_data: {
        name: 'Advisory Chat Subscription',
      },
    });

    // Create Stripe checkout session for subscription
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.URL}/dashboard?subscription=success`,
      cancel_url: `${process.env.URL}/pricing?cancelled=true`,
      customer_email: userEmail,
      metadata: {
        type: 'subscription',
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ sessionId: session.id }),
    };
  } catch (error: any) {
    console.error('Error creating subscription checkout:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
