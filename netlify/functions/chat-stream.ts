// Netlify Function: Streaming Chat with OpenAI
// Path: /api/chat-stream

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function handler(event: any) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { messages } = JSON.parse(event.body);

    const stream = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: messages,
      max_tokens: 2000,
      temperature: 0.7,
      stream: true,
    });

    let fullResponse = '';
    const chunks: string[] = [];

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullResponse += content;
        chunks.push(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    chunks.push(`data: ${JSON.stringify({ tokensUsed: fullResponse.length / 4 })}\n\n`);
    chunks.push('data: [DONE]\n\n');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
      body: chunks.join(''),
    };
  } catch (error: any) {
    console.error('Error in chat stream function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
