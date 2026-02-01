// Netlify Function: Book Retainer Session
// Path: /api/book-retainer-session

import { createClient } from '@supabase/supabase-js';
import { getISOWeek, getISOWeekYear } from 'date-fns';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

interface BookingRequest {
  userId: string;
  scheduledAt: string;
  durationMinutes: number;
  intakeText?: string;
}

export async function handler(event: any) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { userId, scheduledAt, durationMinutes, intakeText }: BookingRequest = JSON.parse(event.body);

    if (!userId || !scheduledAt || !durationMinutes) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    // Validate duration (max 60 minutes for retainer)
    if (durationMinutes > 60) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Maximum session duration is 60 minutes for retainer users' }),
      };
    }

    // Get user's retainer status
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'User not found' }),
      };
    }

    // Check if retainer is active
    if (!user.retainer_active || !user.retainer_period_end) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'No active retainer subscription' }),
      };
    }

    // Check if retainer period is still valid
    const periodEnd = new Date(user.retainer_period_end);
    if (periodEnd < new Date()) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Retainer period has expired' }),
      };
    }

    // Check monthly session limit (8 sessions/month)
    if (user.retainer_sessions_used >= 8) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Monthly session limit reached (8 sessions max)' }),
      };
    }

    // Check weekly session limit (2 sessions/week)
    const now = new Date();
    const currentWeek = `${getISOWeekYear(now)}-W${getISOWeek(now)}`;
    const userLastWeek = user.retainer_last_session_week;
    const userSessionsThisWeek = userLastWeek === currentWeek ? user.retainer_sessions_this_week : 0;

    if (userSessionsThisWeek >= 2) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Weekly session limit reached (2 sessions max per week)' }),
      };
    }

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        user_id: userId,
        duration_minutes: durationMinutes,
        price_paid: 0, // Covered by retainer
        scheduled_at: scheduledAt,
        status: 'confirmed',
        stripe_payment_id: `retainer_${Date.now()}`, // Placeholder for retainer bookings
        intake_text: intakeText || null,
        is_retainer_session: true,
      })
      .select()
      .single();

    if (bookingError) {
      console.error('Error creating booking:', bookingError);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to create booking' }),
      };
    }

    // Update user's retainer usage
    const newSessionsUsed = user.retainer_sessions_used + 1;
    const newSessionsThisWeek = userLastWeek === currentWeek 
      ? user.retainer_sessions_this_week + 1 
      : 1;

    const { error: updateError } = await supabase
      .from('users')
      .update({
        retainer_sessions_used: newSessionsUsed,
        retainer_sessions_this_week: newSessionsThisWeek,
        retainer_last_session_week: currentWeek,
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating user retainer usage:', updateError);
      // Booking was created, so don't fail - but log the issue
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        booking,
        retainerStatus: {
          sessionsUsed: newSessionsUsed,
          sessionsRemaining: 8 - newSessionsUsed,
          sessionsThisWeek: newSessionsThisWeek,
        },
      }),
    };
  } catch (error: any) {
    console.error('Error booking retainer session:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
