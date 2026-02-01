// Pricing configuration for advisory calls
export const PRICING_CONFIG = {
  // Price per 15-minute block (in cents)
  pricePerBlock: 2500, // $25 per 15 minutes
  
  // Available time slots in minutes
  timeSlots: [15, 30, 45, 60] as const,
  
  // Subscription pricing (in cents)
  subscriptionPrice: 1400, // $14/month
  
  // Chat rate limits
  chatLimits: {
    messagesPerDay: 25,
    tokensPerMessage: 2000,
  },
  
  // Stripe product IDs (set in environment or update here)
  stripeProducts: {
    subscription: 'prod_subscription_chat',
    advisory15: 'prod_advisory_15',
    advisory30: 'prod_advisory_30',
    advisory45: 'prod_advisory_45',
    advisory60: 'prod_advisory_60',
  },
}

// Calculate price based on duration
export function calculatePrice(minutes: number): number {
  const blocks = Math.ceil(minutes / 15)
  return blocks * PRICING_CONFIG.pricePerBlock
}

// Format price for display
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

// Calculate refund for unused time
export function calculateRefund(bookedMinutes: number, usedMinutes: number): number {
  const bookedBlocks = Math.ceil(bookedMinutes / 15)
  const usedBlocks = Math.ceil(usedMinutes / 15)
  const unusedBlocks = bookedBlocks - usedBlocks
  
  if (unusedBlocks <= 0) return 0
  return unusedBlocks * PRICING_CONFIG.pricePerBlock
}

// Time slot labels
export function getTimeSlotLabel(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minutes`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (remainingMinutes === 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`
  }
  return `${hours}h ${remainingMinutes}m`
}
