import { loadStripe } from '@stripe/stripe-js'

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''

export const stripePromise = loadStripe(stripePublishableKey)

// Create checkout session for advisory booking
export async function createBookingCheckout(
  durationMinutes: number,
  scheduledAt: Date,
  userEmail: string
): Promise<{ sessionId: string } | { error: string }> {
  try {
    const response = await fetch('/api/create-booking-checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        durationMinutes,
        scheduledAt: scheduledAt.toISOString(),
        userEmail,
      }),
    })
    
    if (!response.ok) {
      throw new Error('Failed to create checkout session')
    }
    
    return await response.json()
  } catch (error) {
    return { error: 'Failed to create checkout session' }
  }
}

// Create subscription checkout
export async function createSubscriptionCheckout(
  userEmail: string
): Promise<{ sessionId: string } | { error: string }> {
  try {
    const response = await fetch('/api/create-subscription-checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userEmail,
      }),
    })
    
    if (!response.ok) {
      throw new Error('Failed to create checkout session')
    }
    
    return await response.json()
  } catch (error) {
    return { error: 'Failed to create subscription checkout' }
  }
}

// Process refund for unused time
export async function processRefund(
  bookingId: string,
  unusedMinutes: number
): Promise<{ success: boolean } | { error: string }> {
  try {
    const response = await fetch('/api/process-refund', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bookingId,
        unusedMinutes,
      }),
    })
    
    if (!response.ok) {
      throw new Error('Failed to process refund')
    }
    
    return await response.json()
  } catch (error) {
    return { error: 'Failed to process refund' }
  }
}
