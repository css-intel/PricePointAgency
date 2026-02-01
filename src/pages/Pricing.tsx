import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, Clock, MessageSquare, Crown, Loader2, Phone } from 'lucide-react'
import { calculatePrice, formatPrice, PRICING_CONFIG } from '../config/pricing'
import { useAuth } from '../context/AuthContext'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '')

// Duration options for paid sessions (15-60 minutes)
const MIN_DURATION = 15
const MAX_DURATION = 60

export default function Pricing() {
  const { user, retainerStatus } = useAuth()
  const navigate = useNavigate()
  const [loadingRetainer, setLoadingRetainer] = useState(false)
  const [loadingChat, setLoadingChat] = useState(false)
  const [sessionDuration, setSessionDuration] = useState(30) // Default 30 min

  const sessionPrice = calculatePrice(sessionDuration)

  const handleRetainerCheckout = async () => {
    if (!user) {
      navigate('/login?redirect=/pricing')
      return
    }

    setLoadingRetainer(true)
    try {
      const response = await fetch('/.netlify/functions/create-retainer-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: user.email,
          userId: user.id,
        }),
      })

      const { sessionId, error } = await response.json()
      if (error) throw new Error(error)

      const stripe = await stripePromise
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId })
      }
    } catch (error) {
      console.error('Error creating retainer checkout:', error)
      alert('Failed to start checkout. Please try again.')
    } finally {
      setLoadingRetainer(false)
    }
  }

  const handleChatCheckout = async () => {
    if (!user) {
      navigate('/signup')
      return
    }

    setLoadingChat(true)
    try {
      const response = await fetch('/.netlify/functions/create-subscription-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: user.email }),
      })

      const { sessionId, error } = await response.json()
      if (error) throw new Error(error)

      const stripe = await stripePromise
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId })
      }
    } catch (error) {
      console.error('Error creating chat checkout:', error)
      alert('Failed to start checkout. Please try again.')
    } finally {
      setLoadingChat(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="section-heading mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start with a free exploratory call, then book paid sessions as needed.
          </p>
        </div>

        {/* Pricing Cards - 4 columns */}
        <div className="grid lg:grid-cols-4 gap-6 mb-16">
          
          {/* Free Exploratory Call */}
          <div className="card border-2 border-green-200 bg-green-50/30">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Phone className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Exploratory Call</h2>
                <p className="text-gray-500 text-sm">Get to know us</p>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline mb-2">
                <span className="text-4xl font-bold text-green-600">Free</span>
                <span className="text-gray-500 ml-2">15 min</span>
              </div>
              <p className="text-gray-600 text-sm">
                A quick call to understand your needs and see if we're a good fit.
              </p>
            </div>

            {/* Features */}
            <ul className="space-y-2 mb-6">
              {[
                'Pick 3 topics to discuss',
                'Learn about our services',
                'No obligation',
                'Account created for you',
              ].map((feature) => (
                <li key={feature} className="flex items-center text-gray-700 text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <Link to="/book-exploratory" className="block w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white text-center font-semibold rounded-xl transition-colors">
              Book Free Call
            </Link>
          </div>

          {/* Paid Advisory Sessions */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Advisory Sessions</h2>
                <p className="text-gray-500 text-sm">Pay per session</p>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline mb-2">
                <span className="text-4xl font-bold text-gray-900">{formatPrice(sessionPrice)}</span>
              </div>
              <p className="text-sm text-gray-500 mb-4">{sessionDuration} minutes</p>
              
              {/* Duration Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>15 min</span>
                  <span>60 min</span>
                </div>
                <input
                  type="range"
                  min={MIN_DURATION}
                  max={MAX_DURATION}
                  step={15}
                  value={sessionDuration}
                  onChange={(e) => setSessionDuration(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{formatPrice(calculatePrice(15))}</span>
                  <span>{formatPrice(calculatePrice(60))}</span>
                </div>
              </div>
            </div>

            {/* Features */}
            <ul className="space-y-2 mb-6">
              {[
                '1-on-1 advisory session',
                'Phone or video call',
                'Tailored business advice',
                'Session notes provided',
              ].map((feature) => (
                <li key={feature} className="flex items-center text-gray-700 text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <Link 
              to={`/book?duration=${sessionDuration}`} 
              className="btn-primary w-full text-center"
            >
              Book Session
            </Link>
          </div>

          {/* Monthly Advisory Retainer - Featured */}
          <div className="card border-2 border-primary-500 relative lg:scale-105 shadow-xl">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="bg-primary-600 text-white text-sm font-semibold px-4 py-1 rounded-full flex items-center gap-1">
                <Crown className="w-4 h-4" />
                Best Value
              </span>
            </div>

            <div className="flex items-center space-x-3 mb-6 mt-2">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <Crown className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Monthly Retainer</h2>
                <p className="text-gray-500 text-sm">Priority advisory</p>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline mb-2">
                <span className="text-4xl font-bold text-gray-900">$1,000</span>
                <span className="text-gray-500 ml-2">/month</span>
              </div>
              <p className="text-sm text-primary-600 font-medium mb-2">
                Save up to $600/month vs pay-per-session
              </p>
              <p className="text-gray-600 text-sm">
                8 sessions per month, up to 60 min each.
              </p>
            </div>

            {/* Features */}
            <ul className="space-y-2 mb-6">
              {[
                '8 sessions/month (60 min max)',
                'Up to 2 sessions/week',
                'Priority booking',
                'Dedicated advisor',
                'Email support between calls',
              ].map((feature) => (
                <li key={feature} className="flex items-center text-gray-700 text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            {retainerStatus.active ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                <p className="text-green-800 font-medium text-sm">✓ Active Retainer</p>
                <p className="text-green-600 text-xs">
                  {retainerStatus.sessionsRemaining} sessions remaining
                </p>
              </div>
            ) : (
              <button
                onClick={handleRetainerCheckout}
                disabled={loadingRetainer}
                className="btn-primary w-full text-center flex items-center justify-center"
              >
                {loadingRetainer ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  'Start Retainer'
                )}
              </button>
            )}
          </div>

          {/* Advisory Chat Subscription */}
          <div className="card border-2 border-accent-200 relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="bg-accent-600 text-white text-sm font-semibold px-4 py-1 rounded-full">
                Most Popular
              </span>
            </div>

            <div className="flex items-center space-x-3 mb-6 mt-2">
              <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-accent-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Advisory Chat</h2>
                <p className="text-gray-500 text-sm">AI-powered</p>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline mb-2">
                <span className="text-4xl font-bold text-gray-900">
                  {formatPrice(PRICING_CONFIG.subscriptionPrice)}
                </span>
                <span className="text-gray-500 ml-2">/month</span>
              </div>
              <p className="text-gray-600 text-sm">
                Unlimited AI-powered business advisory, 24/7.
              </p>
            </div>

            {/* Features */}
            <ul className="space-y-2 mb-6">
              {[
                'Unlimited chat conversations',
                '24/7 availability',
                'Accountability Partner',
                'Conversation history saved',
              ].map((feature) => (
                <li key={feature} className="flex items-center text-gray-700 text-sm">
                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={handleChatCheckout}
              disabled={loadingChat}
              className="btn-accent w-full text-center flex items-center justify-center"
            >
              {loadingChat ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                'Start Subscription'
              )}
            </button>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Compare Plans
          </h2>
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-900">Feature</th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-green-600">Exploratory</th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-gray-900">Per Session</th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-primary-600 bg-primary-50">Retainer</th>
                  <th className="px-4 py-4 text-center text-sm font-semibold text-gray-900">Chat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  { feature: 'Price', exploratory: 'Free', perSession: '$25-$100', retainer: '$1,000/mo', chat: '$14/mo' },
                  { feature: 'Call Duration', exploratory: '15 min', perSession: '15-60 min', retainer: '60 min max', chat: '—' },
                  { feature: 'Sessions', exploratory: '1 only', perSession: 'Pay each', retainer: '8/month', chat: 'Unlimited chat' },
                  { feature: 'Phone/Video Calls', exploratory: '✓', perSession: '✓', retainer: '✓', chat: '—' },
                  { feature: 'AI Chat Support', exploratory: '—', perSession: '—', retainer: '—', chat: '✓' },
                  { feature: 'Priority Booking', exploratory: '—', perSession: '—', retainer: '✓', chat: '—' },
                  { feature: '24/7 Availability', exploratory: '—', perSession: '—', retainer: '—', chat: '✓' },
                  { feature: 'Account Required', exploratory: '✓', perSession: '✓', retainer: '✓', chat: '✓' },
                ].map((row) => (
                  <tr key={row.feature}>
                    <td className="px-4 py-3 text-sm text-gray-900">{row.feature}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-center">{row.exploratory}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-center">{row.perSession}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-center bg-primary-50 font-medium">{row.retainer}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-center">{row.chat}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            {[
              {
                q: 'What is the Free Exploratory Call?',
                a: 'The exploratory call is a free 15-minute call where you select up to 3 topics to discuss. It\'s designed to help you understand what we do and see if we\'re a good fit for your business needs. You\'ll need to create an account to book.',
              },
              {
                q: 'How do paid Advisory Sessions work?',
                a: 'After your exploratory call, you can book paid advisory sessions. Use the slider to choose your session length (15-60 minutes) and the price updates automatically. Sessions are $25 per 15-minute block.',
              },
              {
                q: 'How does the Monthly Retainer work?',
                a: 'With the Monthly Retainer ($1,000/month), you get up to 8 advisory sessions per month, each up to 60 minutes. You can book up to 2 sessions per week. Sessions don\'t roll over to the next month.',
              },
              {
                q: 'Why do I need an account?',
                a: 'Creating an account allows us to store your call history, notes, and preferences. This helps us provide better, more personalized advice in future sessions.',
              },
              {
                q: 'Can I cancel my subscription?',
                a: 'Yes, you can cancel the Monthly Retainer or Chat subscription anytime from your dashboard. Your access continues until the end of your current billing period.',
              },
              {
                q: 'What topics can I get advice on?',
                a: 'Business strategy, pricing, growth tactics, operational efficiency, market analysis, and general business consulting. We don\'t provide legal, financial, or tax advice.',
              },
            ].map((faq) => (
              <div key={faq.q} className="card">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
