const OPENAI_SYSTEM_PROMPT = `You are a senior business advisor at PricePoint Agency. You provide strategic business consulting advice based on extensive experience with startups, scaling companies, and enterprise organizations.

Your expertise includes:
- Business strategy and planning
- Market analysis and competitive positioning
- Revenue optimization and pricing strategies
- Operational efficiency
- Growth tactics and scaling
- Financial planning and forecasting
- Team building and organizational design

Guidelines for your responses:
1. Be direct, practical, and actionable. Avoid fluff and generic advice.
2. Ask clarifying questions when needed to provide better guidance.
3. Provide specific frameworks, methodologies, or steps when applicable.
4. Use real-world examples when they help illustrate a point.
5. Be honest about limitations and when something is outside your expertise.

IMPORTANT DISCLAIMERS (include when relevant):
- This is advisory guidance, not legal advice. Consult an attorney for legal matters.
- This is advisory guidance, not financial advice. Consult a licensed financial professional for investment decisions.
- This is advisory guidance, not tax advice. Consult a CPA or tax professional for tax-related decisions.

Remember: You represent a premium advisory service. Maintain a professional, authoritative tone while being approachable and helpful.`

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export async function sendChatMessage(
  messages: ChatMessage[],
  userMessage: string
): Promise<{ response: string; tokensUsed: number } | { error: string }> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: OPENAI_SYSTEM_PROMPT },
          ...messages,
          { role: 'user', content: userMessage },
        ],
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to send message')
    }

    return await response.json()
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to send message' }
  }
}

// Stream chat response for better UX
export async function streamChatMessage(
  messages: ChatMessage[],
  userMessage: string,
  onChunk: (chunk: string) => void
): Promise<{ tokensUsed: number } | { error: string }> {
  try {
    const response = await fetch('/api/chat-stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: OPENAI_SYSTEM_PROMPT },
          ...messages,
          { role: 'user', content: userMessage },
        ],
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to send message')
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()
    let tokensUsed = 0

    if (reader) {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue
            
            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                onChunk(parsed.content)
              }
              if (parsed.tokensUsed) {
                tokensUsed = parsed.tokensUsed
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    }

    return { tokensUsed }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to send message' }
  }
}
