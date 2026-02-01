import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Calendar, MessageSquare, Clock, CreditCard, Settings } from 'lucide-react'
import { formatPrice, PRICING_CONFIG } from '../config/pricing'

export default function Dashboard() {
  const { user, loading, isSubscribed } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login?redirect=/dashboard')
    }
  }, [user, loading, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.full_name}
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your advisory sessions and subscription
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link
            to="/book"
            className="card hover:shadow-lg transition-shadow group"
          >
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-200 transition-colors">
              <Calendar className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Book a Call</h3>
            <p className="text-sm text-gray-500">Schedule advisory session</p>
          </Link>

          <Link
            to="/chat"
            className="card hover:shadow-lg transition-shadow group"
          >
            <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-accent-200 transition-colors">
              <MessageSquare className="w-6 h-6 text-accent-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Advisory Chat</h3>
            <p className="text-sm text-gray-500">
              {isSubscribed ? 'Start chatting' : 'Subscribe for access'}
            </p>
          </Link>

          <div className="card">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Upcoming Calls</h3>
            <p className="text-sm text-gray-500">0 sessions scheduled</p>
          </div>

          <div className="card">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Subscription</h3>
            <p className="text-sm text-gray-500">
              {isSubscribed ? 'Active' : 'Not subscribed'}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Subscription Status */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Subscription Status
              </h2>

              {isSubscribed ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-green-800">
                        Advisory Chat - Active
                      </h3>
                      <p className="text-green-700">
                        {formatPrice(PRICING_CONFIG.subscriptionPrice)}/month
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-medium">
                      Active
                    </span>
                  </div>
                  <p className="text-sm text-green-700 mb-4">
                    Next billing date: {user.subscription_expires_at 
                      ? new Date(user.subscription_expires_at).toLocaleDateString()
                      : 'N/A'}
                  </p>
                  <button className="text-sm text-green-700 font-medium hover:text-green-800">
                    Manage Subscription →
                  </button>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    No Active Subscription
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Subscribe to Advisory Chat for unlimited AI-powered business guidance.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">
                      {formatPrice(PRICING_CONFIG.subscriptionPrice)}
                      <span className="text-base font-normal text-gray-500">/month</span>
                    </span>
                    <Link to="/pricing" className="btn-accent">
                      Subscribe Now
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="card mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Recent Activity
              </h2>
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No recent activity</p>
                <p className="text-sm mt-1">Book a call or start chatting to see your activity here</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Profile</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{user.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Member since</p>
                  <p className="font-medium">
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button className="flex items-center text-primary-600 font-medium mt-4 hover:text-primary-700">
                <Settings className="w-4 h-4 mr-2" />
                Edit Profile
              </button>
            </div>

            {/* Quick Stats */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Statistics</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Calls</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Chat Messages</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hours of Advisory</span>
                  <span className="font-semibold">0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
