import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  MessageSquare, 
  DollarSign,
  Settings,
  BarChart3
} from 'lucide-react'

// Admin sub-pages
function AdminOverview() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Users', value: '0', icon: Users, color: 'bg-blue-100 text-blue-600' },
          { label: 'Active Subscriptions', value: '0', icon: MessageSquare, color: 'bg-green-100 text-green-600' },
          { label: 'Bookings This Month', value: '0', icon: Calendar, color: 'bg-purple-100 text-purple-600' },
          { label: 'Revenue (MTD)', value: '$0', icon: DollarSign, color: 'bg-yellow-100 text-yellow-600' },
        ].map((stat) => (
          <div key={stat.label} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="text-center py-8 text-gray-500">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No recent activity to display</p>
        </div>
      </div>
    </div>
  )
}

function AdminUsers() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <button className="btn-primary">Export Users</button>
      </div>
      
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Subscribed</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Joined</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">
                  No users found
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function AdminBookings() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
      
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-600">User</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Date/Time</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Duration</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Amount</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  No bookings found
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function AdminPricing() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Pricing Configuration</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Advisory Call Pricing</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price per 15-minute block (cents)
              </label>
              <input
                type="number"
                defaultValue={3500}
                className="input"
              />
            </div>
            <button className="btn-primary">Save Changes</button>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Chat Subscription Pricing</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly subscription price (cents)
              </label>
              <input
                type="number"
                defaultValue={1400}
                className="input"
              />
            </div>
            <button className="btn-primary">Save Changes</button>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Chat Rate Limits</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Messages per day
            </label>
            <input
              type="number"
              defaultValue={25}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tokens per message
            </label>
            <input
              type="number"
              defaultValue={2000}
              className="input"
            />
          </div>
        </div>
        <button className="btn-primary mt-4">Save Changes</button>
      </div>
    </div>
  )
}

function AdminSettings() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name
            </label>
            <input
              type="text"
              defaultValue="PricePoint Agency"
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Support Email
            </label>
            <input
              type="email"
              defaultValue="support@pricepoint.agency"
              className="input"
            />
          </div>
          <button className="btn-primary">Save Changes</button>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">API Keys</h2>
        <p className="text-gray-600 mb-4">
          Configure API keys for Stripe and OpenAI. These should be set as environment variables in production.
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Security Notice:</strong> API keys should be configured via environment variables, not through this interface in production.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const { user, loading, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/')
    }
  }, [user, loading, isAdmin, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user || !isAdmin) return null

  const navItems = [
    { path: '/admin', label: 'Overview', icon: LayoutDashboard },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/bookings', label: 'Bookings', icon: Calendar },
    { path: '/admin/pricing', label: 'Pricing', icon: DollarSign },
    { path: '/admin/settings', label: 'Settings', icon: Settings },
  ]

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen sticky top-0">
          <div className="p-6">
            <h2 className="font-display font-bold text-lg text-gray-900">Admin Panel</h2>
          </div>
          <nav className="px-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <Routes>
            <Route index element={<AdminOverview />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="pricing" element={<AdminPricing />} />
            <Route path="settings" element={<AdminSettings />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
