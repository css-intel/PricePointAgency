// Netlify Function: Process Refund for Unused Time
// Path: /api/process-refund

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const PRICE_PER_BLOCK = 3500; // $35 per 15-minute block

export async function handler(event: any) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { bookingId, unusedMinutes } = JSON.parse(event.body);

    // Get booking from database
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Booking not found' }),
      };
    }

    // Calculate refund amount
    const unusedBlocks = Math.floor(unusedMinutes / 15);
    const refundAmount = unusedBlocks * PRICE_PER_BLOCK;

    if (refundAmount <= 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No refund applicable' }),
      };
    }

    // Process refund through Stripe
    const refund = await stripe.refunds.create({
      payment_intent: booking.stripe_payment_id,
      amount: refundAmount,
      reason: 'requested_by_customer',
    });

    // Update booking in database
    await supabase
      .from('bookings')
      .update({
        refund_amount: refundAmount,
        actual_duration_minutes: booking.duration_minutes - unusedMinutes,
        status: 'completed',
      })
      .eq('id', bookingId);

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        refundAmount,
        refundId: refund.id,
      }),
    };
  } catch (error: any) {
    console.error('Error processing refund:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
