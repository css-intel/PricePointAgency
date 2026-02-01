import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, addDays, startOfWeek, isSameDay, isToday, isBefore, addWeeks, subWeeks, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'
import { ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

// Time slots from 9 AM to 5:30 PM in 30-minute increments
const generateTimeSlots = () => {
  const slots: string[] = []
  for (let hour = 9; hour <= 17; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      if (hour === 17 && minute > 30) break
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      slots.push(timeStr)
    }
  }
  return slots
}

const TIME_SLOTS = generateTimeSlots()

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
}

// Simulate slot availability
const getSlotAvailability = (date: Date, time: string): boolean => {
  const dayOfWeek = date.getDay()
  if (dayOfWeek === 0 || dayOfWeek === 6) return false
  if (isBefore(date, new Date()) && !isToday(date)) return false
  const hash = date.getDate() + parseInt(time.replace(':', ''))
  return hash % 4 !== 0
}

export default function BookConsultation() {
  const navigate = useNavigate()
  const { user, signIn, signUp } = useAuth()
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [duration, setDuration] = useState(15) // Default 15 min free
  const [currentWeekStart, setCurrentWeekStart] = useState(() => 
    startOfWeek(new Date(), { weekStartsOn: 0 })
  )
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week')
  const [showMonthPicker, setShowMonthPicker] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Auth state
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i))
  
  // Calculate price based on duration
  const price = duration === 15 ? 0 : Math.floor(duration / 15) * 25

  const handleSlotSelect = (date: Date, time: string) => {
    if (getSlotAvailability(date, time)) {
      setSelectedDate(date)
      setSelectedTime(time)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    setAuthLoading(true)

    const result = await signIn(email, password)
    if (result.error) {
      setAuthError(result.error)
    }
    setAuthLoading(false)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    setAuthLoading(true)

    if (password.length < 8) {
      setAuthError('Password must be at least 8 characters')
      setAuthLoading(false)
      return
    }

    const result = await signUp(email, password, fullName)
    if (result.error) {
      setAuthError(result.error)
    }
    setAuthLoading(false)
  }

  const handleBookNow = async () => {
    if (!user || !selectedDate || !selectedTime) return
    
    setIsSubmitting(true)
    
    // If free consultation, just book directly
    if (price === 0) {
      // Simulate booking
      await new Promise(resolve => setTimeout(resolve, 1000))
      navigate('/dashboard?booked=true')
    } else {
      // Redirect to Stripe checkout for paid sessions
      try {
        const response = await fetch('/.netlify/functions/create-booking-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            duration,
            date: selectedDate.toISOString(),
            time: selectedTime,
            userId: user.id,
            userEmail: user.email,
          }),
        })
        const data = await response.json()
        if (data.url) {
          window.location.href = data.url
        }
      } catch (error) {
        console.error('Checkout error:', error)
      }
    }
    
    setIsSubmitting(false)
  }

  // Month picker calendar
  const renderMonthPicker = () => {
    const monthStart = startOfMonth(currentWeekStart)
    const monthEnd = endOfMonth(currentWeekStart)
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
    const startPadding = monthStart.getDay()
    
    return (
      <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-50 w-72">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 4))} className="p-1 hover:bg-gray-100 rounded">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-semibold">{format(currentWeekStart, 'MMMM yyyy')}</span>
          <button onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 4))} className="p-1 hover:bg-gray-100 rounded">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <span key={i} className="text-gray-500 font-medium py-1">{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startPadding }).map((_, i) => (
            <div key={`pad-${i}`} />
          ))}
          {days.map((day) => {
            const isPast = isBefore(day, new Date()) && !isToday(day)
            const isWeekend = day.getDay() === 0 || day.getDay() === 6
            return (
              <button
                key={day.toISOString()}
                onClick={() => {
                  setCurrentWeekStart(startOfWeek(day, { weekStartsOn: 0 }))
                  setShowMonthPicker(false)
                }}
                disabled={isPast || isWeekend}
                className={`
                  p-2 text-sm rounded-lg transition-colors
                  ${isPast || isWeekend ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-blue-50 cursor-pointer'}
                  ${isToday(day) ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                `}
              >
                {format(day, 'd')}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Book a Consultation</h1>
          <p className="text-gray-600 mt-2 text-lg">Schedule a session with our business advisory experts</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Free badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center space-x-2 bg-green-50 text-green-700 px-4 py-2 rounded-full border border-green-200">
            <Check className="w-5 h-5" />
            <span className="font-medium">First 15 minutes FREE</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left - Calendar */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowMonthPicker(!showMonthPicker)}
                    className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                  >
                    {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
                  </button>
                  {showMonthPicker && renderMonthPicker()}
                </div>
                <button
                  onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'week' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setViewMode('month')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'month' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Month
                </button>
              </div>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-8 border-b border-gray-200">
              <div className="p-3 text-center text-sm font-medium text-gray-500 border-r border-gray-100"></div>
              {weekDays.map((day) => {
                const isWeekend = day.getDay() === 0 || day.getDay() === 6
                return (
                  <div key={day.toISOString()} className={`p-3 text-center border-r border-gray-100 last:border-r-0 ${isWeekend ? 'bg-gray-50' : ''}`}>
                    <span className={`text-xs font-medium ${isWeekend ? 'text-gray-400' : 'text-gray-500'}`}>
                      {format(day, 'EEE')}
                    </span>
                    <span className={`block text-lg font-semibold ${
                      isToday(day) ? 'text-blue-600' : isWeekend ? 'text-gray-400' : 'text-gray-900'
                    }`}>
                      {format(day, 'd')}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Time Slots Grid */}
            <div className="max-h-[500px] overflow-y-auto">
              {TIME_SLOTS.map((time) => (
                <div key={time} className="grid grid-cols-8 border-b border-gray-100 last:border-b-0">
                  <div className="p-2 text-center text-xs font-medium text-gray-500 border-r border-gray-100 flex items-center justify-center">
                    {formatTime(time)}
                  </div>
                  {weekDays.map((date) => {
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6
                    const available = getSlotAvailability(date, time)
                    const isSelected = selectedDate && selectedTime === time && isSameDay(date, selectedDate)
                    
                    return (
                      <button
                        key={`${date.toISOString()}-${time}`}
                        onClick={() => handleSlotSelect(date, time)}
                        disabled={!available || isWeekend}
                        className={`
                          p-2 border-r border-gray-100 last:border-r-0 transition-all min-h-[44px]
                          ${isWeekend ? 'bg-gray-50 cursor-not-allowed' : ''}
                          ${isSelected 
                            ? 'bg-blue-600 text-white' 
                            : available && !isWeekend
                              ? 'hover:bg-blue-50 cursor-pointer'
                              : 'bg-gray-50'
                          }
                        `}
                      >
                        {available && !isWeekend && !isSelected && (
                          <div className="w-2 h-2 bg-green-400 rounded-full mx-auto" />
                        )}
                        {isSelected && (
                          <Check className="w-4 h-4 mx-auto" />
                        )}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="p-4 border-t border-gray-200 flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full" />
                <span className="text-gray-600">Available</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full" />
                <span className="text-gray-600">Selected</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-200 rounded-full" />
                <span className="text-gray-600">Unavailable</span>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Booking Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              {/* Duration Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Session Duration</label>
                <div className="grid grid-cols-4 gap-2">
                  {[15, 30, 45, 60].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => setDuration(mins)}
                      className={`py-2 px-3 text-sm font-medium rounded-lg border transition-colors ${
                        duration === mins
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Selection Display */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Date</span>
                  <span className="font-medium text-gray-900">
                    {selectedDate ? format(selectedDate, 'EEE, MMM d') : 'Select a date'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Time</span>
                  <span className="font-medium text-gray-900">
                    {selectedTime ? formatTime(selectedTime) : 'Select a time'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium text-gray-900">{duration} minutes</span>
                </div>
              </div>

              {/* Price */}
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-900 font-medium">Total</span>
                  <span className={`text-3xl font-bold ${price === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    {price === 0 ? 'Free' : `$${price}`}
                  </span>
                </div>
                {duration === 15 && (
                  <p className="text-sm text-green-600 mt-1">First consultation is free!</p>
                )}
              </div>

              {/* Book Button */}
              <button
                onClick={handleBookNow}
                disabled={!selectedDate || !selectedTime || !user || isSubmitting}
                className={`
                  w-full py-3 rounded-xl font-semibold text-lg transition-all
                  ${selectedDate && selectedTime && user && !isSubmitting
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Processing...
                  </span>
                ) : (
                  'Book Now'
                )}
              </button>

              {!selectedDate || !selectedTime ? (
                <p className="text-sm text-gray-500 text-center mt-3">Select time & duration</p>
              ) : null}
            </div>

            {/* Sign In / Create Account */}
            {!user && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {authMode === 'signin' ? 'Sign In' : 'Create Account'}
                </h3>

                {authError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {authError}
                  </div>
                )}

                {authMode === 'signin' ? (
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="Email"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Password"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      {authLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Signing in...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        placeholder="Full Name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="Email"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Password (min. 8 characters)"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      {authLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Creating account...
                        </>
                      ) : (
                        'Sign Up'
                      )}
                    </button>
                  </form>
                )}

                <p className="text-sm text-center text-gray-600 mt-4">
                  {authMode === 'signin' ? (
                    <>
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => { setAuthMode('signup'); setAuthError('') }}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Sign up
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => { setAuthMode('signin'); setAuthError('') }}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Sign in
                      </button>
                    </>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close month picker */}
      {showMonthPicker && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowMonthPicker(false)}
        />
      )}
    </div>
  )
}
