import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: string
  email: string
  full_name: string
  is_subscribed: boolean
  subscription_expires_at: string | null
  stripe_customer_id: string | null
  created_at: string
  is_admin: boolean
  // Monthly Retainer fields
  retainer_active: boolean
  retainer_period_start: string | null
  retainer_period_end: string | null
  retainer_sessions_used: number
  retainer_last_session_week: string | null // ISO week format for tracking 2/week limit
  retainer_sessions_this_week: number
}

export interface Booking {
  id: string
  user_id: string
  duration_minutes: number
  price_paid: number
  scheduled_at: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'refunded'
  actual_duration_minutes: number | null
  refund_amount: number | null
  stripe_payment_id: string
  created_at: string
}

export interface ChatMessage {
  id: string
  user_id: string
  role: 'user' | 'assistant'
  content: string
  tokens_used: number
  created_at: string
}

export interface ChatSession {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
}
