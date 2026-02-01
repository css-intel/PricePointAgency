import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, AlertCircle } from 'lucide-react'
import { useChatStore } from '../store'
import { streamChatMessage } from '../lib/openai'
import { useAuth } from '../context/AuthContext'

export default function ChatInterface() {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { messages, isLoading, addMessage, setLoading } = useChatStore()
  const { isSubscribed } = useAuth()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    addMessage({ role: 'user', content: userMessage })
    setLoading(true)

    let assistantMessage = ''
    
    // Filter out accountability messages before sending to API
    const apiMessages = messages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))
    
    const result = await streamChatMessage(
      apiMessages,
      userMessage,
      (chunk) => {
        assistantMessage += chunk
        // Update the last message in real-time
        useChatStore.setState((state) => {
          const newMessages = [...state.messages]
          const lastMessage = newMessages[newMessages.length - 1]
          if (lastMessage?.role === 'assistant') {
            lastMessage.content = assistantMessage
          } else {
            newMessages.push({ role: 'assistant', content: assistantMessage })
          }
          return { messages: newMessages }
        })
      }
    )

    if ('error' in result) {
      addMessage({ 
        role: 'assistant', 
        content: 'I apologize, but I encountered an error. Please try again.' 
      })
    }

    setLoading(false)
  }

  if (!isSubscribed) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] text-center px-4">
        <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-accent-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Subscription Required
        </h3>
        <p className="text-gray-600 max-w-md mb-6">
          Access to Advisory Chat requires an active subscription. 
          Get unlimited business consulting advice for just $14/month.
        </p>
        <a href="/pricing" className="btn-accent">
          View Subscription Plans
        </a>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="font-semibold text-gray-900">Advisory Chat</h3>
        <p className="text-sm text-gray-500">
          Ask any business or consulting question
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">
              Start a Conversation
            </h4>
            <p className="text-gray-500 max-w-sm mx-auto">
              Ask about business strategy, pricing, growth tactics, 
              operational efficiency, or any other business topic.
            </p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`chat-message flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-primary-600 text-white'
                  : message.role === 'accountability'
                    ? 'bg-amber-50 border border-amber-200 text-amber-900'
                    : 'bg-gray-100 text-gray-900'
              }`}
            >
              {message.role === 'accountability' && (
                <p className="text-xs font-semibold text-amber-600 mb-1">Accountability Partner</p>
              )}
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-4 py-3">
              <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
        <div className="flex space-x-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a business question..."
            className="input flex-1"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="btn-primary px-4"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          Advisory guidance only. Not legal, financial, or tax advice.
        </p>
      </form>
    </div>
  )
}
