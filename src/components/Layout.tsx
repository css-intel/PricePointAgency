import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react'
import { useState } from 'react'

export default function Layout() {
  const { user, signOut, isAdmin } = useAuth()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/pricing' },
    { name: 'Book Consultation', href: '/book' },
    { name: 'About', href: '/pricing' },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Bar */}
      <div className="bg-blue-900 text-white text-sm py-2 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between">
          <div className="flex items-center space-x-6">
            <span>info@pricepoint.agency</span>
            <span>803-479-3667</span>
            <span>Columbia, South Carolina</span>
          </div>
          <div className="flex items-center space-x-4">
            <a href="#" className="hover:text-amber-400">Facebook</a>
            <a href="#" className="hover:text-amber-400">Twitter</a>
            <a href="#" className="hover:text-amber-400">Instagram</a>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <img src="/logo.png" alt="Price Point Agency" className="h-12 w-auto" />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'text-slate-900'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center space-x-1 text-sm font-medium text-slate-600 hover:text-slate-900"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Admin</span>
                    </Link>
                  )}
                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-1 text-sm font-medium text-slate-600 hover:text-slate-900"
                  >
                    <User className="w-4 h-4" />
                    <span>{user.full_name}</span>
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center space-x-1 text-sm font-medium text-slate-600 hover:text-slate-900"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                    Sign In
                  </Link>
                  <Link to="/signup" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-2 px-4 rounded-lg transition-colors">
                    Create Account
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-slate-600 hover:text-slate-900"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-100">
              <div className="flex flex-col space-y-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-sm font-medium ${
                      isActive(item.href)
                        ? 'text-slate-900'
                        : 'text-slate-600'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                {user ? (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-sm font-medium text-slate-600"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        signOut()
                        setMobileMenuOpen(false)
                      }}
                      className="text-sm font-medium text-slate-600 text-left"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-sm font-medium text-slate-600"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="btn-primary text-sm py-2 text-center"
                    >
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-blue-900 text-white">
        {/* Footer Top Info */}
        <div className="bg-blue-800 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center md:items-start">
                <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center mb-3 md:mb-0 md:mr-4 flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <p className="font-semibold">Email Us</p>
                  <p className="text-blue-200 text-sm">info@pricepoint.agency</p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-center md:items-start">
                <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center mb-3 md:mb-0 md:mr-4 flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <p className="font-semibold">Have Questions?</p>
                  <p className="text-blue-200 text-sm">Contact Us</p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-center md:items-start">
                <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center mb-3 md:mb-0 md:mr-4 flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                </div>
                <div>
                  <p className="font-semibold">Call Us</p>
                  <p className="text-blue-200 text-sm">803-479-3667</p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-center md:items-start">
                <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center mb-3 md:mb-0 md:mr-4 flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <p className="font-semibold">Opening Hours</p>
                  <p className="text-blue-200 text-sm">Mon-Sat: 10AM - 6PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Main */}
        <div className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <img src="/logo.png" alt="Price Point Agency" className="h-10 w-auto brightness-0 invert" />
                  <span className="font-display font-bold text-xl">Price Point Agency</span>
                </div>
                <p className="text-blue-200 text-sm leading-relaxed">
                  The RIGHT agency for your growth. We provide expert advice and services to help businesses improve their performance and achieve their goals.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4 text-lg">Quick Links</h4>
                <Link to="/" className="text-blue-200 hover:text-white text-sm block mb-2">Home</Link>
                <Link to="/pricing" className="text-blue-200 hover:text-white text-sm block mb-2">About Us</Link>
                <Link to="/pricing" className="text-blue-200 hover:text-white text-sm block mb-2">Services</Link>
                <Link to="/book" className="text-blue-200 hover:text-white text-sm block">Contact</Link>
              </div>
              <div>
                <h4 className="font-semibold mb-4 text-lg">Services</h4>
                <p className="text-blue-200 text-sm mb-2">Customer Services</p>
                <p className="text-blue-200 text-sm mb-2">Cyber Security</p>
                <p className="text-blue-200 text-sm mb-2">Cloud Computing</p>
                <p className="text-blue-200 text-sm">IT Management</p>
              </div>
              <div>
                <h4 className="font-semibold mb-4 text-lg">Contact Info</h4>
                <p className="text-blue-200 text-sm mb-2">Columbia, South Carolina</p>
                <p className="text-blue-200 text-sm mb-2">info@pricepoint.agency</p>
                <p className="text-blue-200 text-sm mb-4">803-479-3667</p>
                <div className="flex space-x-3">
                  <a href="#" className="w-8 h-8 bg-blue-800 hover:bg-amber-500 rounded-full flex items-center justify-center transition-colors">
                    <span className="sr-only">Facebook</span>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.77,7.46H14.5v-1.9c0-.9.6-1.1,1-1.1h3V.5h-4.33C10.24.5,9.5,3.44,9.5,5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4Z"/></svg>
                  </a>
                  <a href="#" className="w-8 h-8 bg-blue-800 hover:bg-amber-500 rounded-full flex items-center justify-center transition-colors">
                    <span className="sr-only">Twitter</span>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.44,4.83c-.8.37-1.5.38-2.22.02.93-.56.98-.96,1.32-2.02-.88.52-1.86.9-2.9,1.1-.82-.88-2-1.43-3.3-1.43-2.5,0-4.55,2.04-4.55,4.54,0,.36.03.7.1,1.04-3.77-.2-7.12-2-9.36-4.75-.4.67-.6,1.45-.6,2.3,0,1.56.8,2.95,2,3.77-.74-.03-1.44-.23-2.05-.57v.06c0,2.2,1.56,4.03,3.64,4.44-.67.2-1.37.2-2.06.08.58,1.8,2.26,3.12,4.25,3.16C5.78,18.1,3.37,18.74,1,18.46c2,1.3,4.4,2.04,6.97,2.04,8.35,0,12.92-6.92,12.92-12.93,0-.2,0-.4-.02-.6.9-.63,1.96-1.22,2.56-2.14Z"/></svg>
                  </a>
                  <a href="#" className="w-8 h-8 bg-blue-800 hover:bg-amber-500 rounded-full flex items-center justify-center transition-colors">
                    <span className="sr-only">Instagram</span>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12,2.16c3.2,0,3.58.01,4.85.07,1.17.05,1.8.25,2.23.41.56.22.96.48,1.38.9s.68.82.9,1.38c.16.43.36,1.06.41,2.23.06,1.27.07,1.65.07,4.85s-.01,3.58-.07,4.85c-.05,1.17-.25,1.8-.41,2.23-.22.56-.48.96-.9,1.38s-.82.68-1.38.9c-.43.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9s-.68-.82-.9-1.38c-.16-.43-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38s.82-.68,1.38-.9c.43-.16,1.06-.36,2.23-.41,1.27-.06,1.65-.07,4.85-.07M12,0C8.74,0,8.33.01,7.05.07,5.78.13,4.9.33,4.14.63c-.78.3-1.45.71-2.11,1.37S.93,3.36.63,4.14C.33,4.9.13,5.78.07,7.05.01,8.33,0,8.74,0,12s.01,3.67.07,4.95c.06,1.27.26,2.15.56,2.91.3.78.71,1.45,1.37,2.11s1.33,1.07,2.11,1.37c.76.3,1.64.5,2.91.56,1.28.06,1.69.07,4.95.07s3.67-.01,4.95-.07c1.27-.06,2.15-.26,2.91-.56.78-.3,1.45-.71,2.11-1.37s1.07-1.33,1.37-2.11c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91-.3-.78-.71-1.45-1.37-2.11S20.64.93,19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01,15.26,0,12,0Z"/><path d="M12,5.84A6.16,6.16,0,1,0,18.16,12,6.16,6.16,0,0,0,12,5.84ZM12,16a4,4,0,1,1,4-4A4,4,0,0,1,12,16Z"/><circle cx="18.41" cy="5.59" r="1.44"/></svg>
                  </a>
                  <a href="#" className="w-8 h-8 bg-blue-800 hover:bg-amber-500 rounded-full flex items-center justify-center transition-colors">
                    <span className="sr-only">Pinterest</span>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12,0C5.37,0,0,5.37,0,12c0,5.08,3.16,9.42,7.63,11.15-.11-.94-.2-2.38.04-3.41.22-.93,1.41-5.98,1.41-5.98,0,0-.36-.72-.36-1.79,0-1.68.97-2.93,2.19-2.93,1.03,0,1.53.78,1.53,1.71,0,1.04-.66,2.6-1.01,4.04-.29,1.21.61,2.2,1.8,2.2,2.17,0,3.83-2.28,3.83-5.58,0-2.92-2.1-4.96-5.1-4.96-3.47,0-5.51,2.6-5.51,5.29,0,1.05.4,2.17.91,2.78.1.12.11.23.08.35-.09.38-.3,1.21-.34,1.38-.06.22-.18.27-.42.16-1.57-.73-2.55-3.03-2.55-4.87,0-3.97,2.88-7.61,8.32-7.61,4.37,0,7.77,3.11,7.77,7.27,0,4.34-2.74,7.84-6.54,7.84-1.28,0-2.48-.66-2.89-1.45l-.79,3c-.29,1.1-1.06,2.48-1.58,3.33C9.53,23.81,10.73,24,12,24c6.63,0,12-5.37,12-12S18.63,0,12,0Z"/></svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-blue-800 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-blue-200 text-sm">
            <p>© {new Date().getFullYear()} Price Point Agency. All rights reserved. | The RIGHT agency for your growth.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
