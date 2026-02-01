// Netlify Function: Create Monthly Retainer Checkout Session
// Path: /api/create-retainer-checkout

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const RETAINER_PRICE = 100000; // $1,000/month

export async function handler(event: any) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { userEmail, userId } = JSON.parse(event.body);

    if (!userEmail || !userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    // Create Stripe price for retainer subscription
    const price = await stripe.prices.create({
      unit_amount: RETAINER_PRICE,
      currency: 'usd',
      recurring: { interval: 'month' },
      product_data: {
        name: 'Monthly Advisory Retainer',
        description: 'Up to 8 advisory sessions per month (60 min max each)',
      },
    });

    // Create Stripe checkout session for retainer subscription
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.URL}/dashboard?retainer=success`,
      cancel_url: `${process.env.URL}/pricing?cancelled=true`,
      customer_email: userEmail,
      client_reference_id: userId,
      metadata: {
        type: 'retainer',
        userId: userId,
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ sessionId: session.id }),
    };
  } catch (error: any) {
    console.error('Error creating retainer checkout:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
