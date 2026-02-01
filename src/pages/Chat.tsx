import ChatInterface from '../components/ChatInterface'
import AccountabilityPartner from '../components/AccountabilityPartner'
import { useAuth } from '../context/AuthContext'
import { useBookingStore } from '../store'
import { Link } from 'react-router-dom'
import { MessageSquare, Sparkles, Shield, Clock } from 'lucide-react'

export default function Chat() {
  const { user, isSubscribed } = useAuth()
  const { intakeText } = useBookingStore()

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="section-heading mb-4">Advisory Chat</h1>
          <p className="text-xl text-gray-600">
            AI-powered business consulting at your fingertips
          </p>
        </div>

        {!user ? (
          /* Not logged in */
          <div className="card text-center py-12">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-8 h-8 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Sign In to Access Advisory Chat
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Get unlimited access to AI-powered business advisory for just $14/month.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login?redirect=/chat" className="btn-primary">
                Sign In
              </Link>
              <Link to="/signup?redirect=/chat" className="btn-secondary">
                Create Account
              </Link>
            </div>
          </div>
        ) : !isSubscribed ? (
          /* Logged in but not subscribed */
          <div className="space-y-8">
            <div className="card text-center py-12">
              <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-accent-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Subscribe to Access Advisory Chat
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Unlock unlimited access to our AI-powered business advisor 
                for strategic guidance anytime you need it.
              </p>

              {/* Features */}
              <div className="grid sm:grid-cols-3 gap-6 max-w-2xl mx-auto mb-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <MessageSquare className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Unlimited Chats</h3>
                  <p className="text-sm text-gray-500">Ask as many questions as you need</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">24/7 Access</h3>
                  <p className="text-sm text-gray-500">Get guidance whenever you need it</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Business Focus</h3>
                  <p className="text-sm text-gray-500">Trained for strategic advice</p>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  $14<span className="text-lg font-normal text-gray-500">/month</span>
                </p>
                <Link to="/pricing" className="btn-accent text-lg px-8 py-3">
                  Subscribe Now
                </Link>
                <p className="text-sm text-gray-500 mt-3">Cancel anytime</p>
              </div>
            </div>
          </div>
        ) : (
          /* Subscribed - show chat with accountability partner */
          <div className="space-y-6">
            <AccountabilityPartner intakeText={intakeText} />
            <ChatInterface />
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            Advisory guidance only. This is not legal, financial, or tax advice.
            Consult appropriate professionals for those matters.
          </p>
        </div>
      </div>
    </div>
  )
}
