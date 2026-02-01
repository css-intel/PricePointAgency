// Netlify Function: Chat with OpenAI
// Path: /api/chat

import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const MAX_TOKENS = 2000;
const MESSAGES_PER_DAY = 25;

export async function handler(event: any) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { messages, userId } = JSON.parse(event.body);

    // Check rate limits if userId provided
    if (userId) {
      const today = new Date().toISOString().split('T')[0];
      const { count } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', `${today}T00:00:00`);

      if (count && count >= MESSAGES_PER_DAY) {
        return {
          statusCode: 429,
          body: JSON.stringify({ 
            error: 'Daily message limit reached. Please try again tomorrow.' 
          }),
        };
      }
    }

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: messages,
      max_tokens: MAX_TOKENS,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || '';
    const tokensUsed = completion.usage?.total_tokens || 0;

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        response,
        tokensUsed,
      }),
    };
  } catch (error: any) {
    console.error('Error in chat function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
