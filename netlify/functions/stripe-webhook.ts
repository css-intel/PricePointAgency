// Netlify Function: Stripe Webhook Handler
// Path: /api/stripe-webhook

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function handler(event: any) {
  const sig = event.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let stripeEvent: Stripe.Event;

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      webhookSecret
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `Webhook Error: ${err.message}` }),
    };
  }

  try {
    switch (stripeEvent.type) {
      case 'checkout.session.completed': {
        const session = stripeEvent.data.object as Stripe.Checkout.Session;
        
        if (session.metadata?.type === 'booking') {
          // Handle booking payment completion
          await supabase.from('bookings').insert({
            user_id: session.client_reference_id,
            duration_minutes: parseInt(session.metadata.durationMinutes),
            price_paid: session.amount_total,
            scheduled_at: session.metadata.scheduledAt,
            status: 'confirmed',
            stripe_payment_id: session.payment_intent as string,
          });
        } else if (session.metadata?.type === 'subscription') {
          // Handle chat subscription activation
          const subscriptionId = session.subscription as string;
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          
          await supabase
            .from('users')
            .update({
              is_subscribed: true,
              subscription_expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
              stripe_customer_id: session.customer as string,
            })
            .eq('email', session.customer_email);
        } else if (session.metadata?.type === 'retainer') {
          // Handle Monthly Advisory Retainer activation
          const subscriptionId = session.subscription as string;
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const periodEnd = new Date(subscription.current_period_end * 1000);
          const periodStart = new Date(subscription.current_period_start * 1000);

          await supabase
            .from('users')
            .update({
              retainer_active: true,
              retainer_period_start: periodStart.toISOString(),
              retainer_period_end: periodEnd.toISOString(),
              retainer_sessions_used: 0,
              retainer_sessions_this_week: 0,
              retainer_last_session_week: null,
              stripe_customer_id: session.customer as string,
            })
            .eq('id', session.client_reference_id);
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = stripeEvent.data.object as Stripe.Subscription;
        const isActive = subscription.status === 'active';
        
        // Check if this is a retainer subscription by looking at the product
        const lineItems = subscription.items.data;
        const isRetainer = lineItems.some(item => 
          item.price?.product && 
          typeof item.price.product === 'object' &&
          (item.price.product as any).name?.includes('Retainer')
        );

        if (isRetainer) {
          // Update retainer status
          if (isActive) {
            // Renewing subscription - reset session counts for new period
            await supabase
              .from('users')
              .update({
                retainer_active: true,
                retainer_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                retainer_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                retainer_sessions_used: 0,
                retainer_sessions_this_week: 0,
                retainer_last_session_week: null,
              })
              .eq('stripe_customer_id', subscription.customer as string);
          } else {
            // Subscription cancelled
            await supabase
              .from('users')
              .update({
                retainer_active: false,
              })
              .eq('stripe_customer_id', subscription.customer as string);
          }
        } else {
          // Regular chat subscription
          await supabase
            .from('users')
            .update({
              is_subscribed: isActive,
              subscription_expires_at: isActive 
                ? new Date(subscription.current_period_end * 1000).toISOString()
                : null,
            })
            .eq('stripe_customer_id', subscription.customer as string);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = stripeEvent.data.object as Stripe.Invoice;
        
        // Check if this is a retainer renewal
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          const lineItems = subscription.items.data;
          const isRetainer = lineItems.some(item => 
            item.price?.product && 
            typeof item.price.product === 'object' &&
            (item.price.product as any).name?.includes('Retainer')
          );

          if (isRetainer && invoice.billing_reason === 'subscription_cycle') {
            // Reset session counts for new billing period
            await supabase
              .from('users')
              .update({
                retainer_sessions_used: 0,
                retainer_sessions_this_week: 0,
                retainer_last_session_week: null,
                retainer_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                retainer_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              })
              .eq('stripe_customer_id', subscription.customer as string);
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = stripeEvent.data.object as Stripe.Invoice;
        console.log('Payment failed for customer:', invoice.customer);
        // Could send notification email here
        break;
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    };
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
