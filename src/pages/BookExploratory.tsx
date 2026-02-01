import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { format, addDays, startOfWeek, isSameDay, isToday, isBefore, addWeeks, subWeeks, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, CheckCircle, AlertCircle, Shield, HelpCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import InlineAuth from '../components/InlineAuth'

// Preset questions for exploratory call - focused only on what PricePoint does
const EXPLORATORY_QUESTIONS = [
  {
    id: 'pricing-strategy',
    title: 'Pricing Strategy',
    description: 'How can I optimize my pricing to maximize revenue?',
  },
  {
    id: 'business-growth',
    title: 'Business Growth',
    description: 'What strategies can help scale my business effectively?',
  },
  {
    id: 'market-positioning',
    title: 'Market Positioning',
    description: 'How do I differentiate and position my business in the market?',
  },
  {
    id: 'operational-efficiency',
    title: 'Operational Efficiency',
    description: 'How can I streamline operations and reduce costs?',
  },
  {
    id: 'revenue-model',
    title: 'Revenue Model',
    description: 'What revenue models work best for my type of business?',
  },
  {
    id: 'customer-acquisition',
    title: 'Customer Acquisition',
    description: 'What are effective strategies for acquiring new customers?',
  },
]

// Time slots from 9 AM to 5 PM in 15-minute increments
const generateTimeSlots = () => {
  const slots: string[] = []
  for (let hour = 9; hour <= 17; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      if (hour === 17 && minute > 0) break
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
  return hash % 5 !== 0
}

export default function BookExploratory() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])
  const [currentWeekStart, setCurrentWeekStart] = useState(() => 
    startOfWeek(new Date(), { weekStartsOn: 1 })
  )
  const [showMonthPicker, setShowMonthPicker] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [slotWarning, setSlotWarning] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i))

  useEffect(() => {
    if (selectedDate && selectedTime) {
      const isAvailable = getSlotAvailability(selectedDate, selectedTime)
      if (!isAvailable) {
        setSlotWarning('This slot is no longer available. Please select another time.')
      } else {
        setSlotWarning(null)
      }
    }
  }, [selectedDate, selectedTime])

  const goToPreviousWeek = () => {
    const newStart = subWeeks(currentWeekStart, 1)
    if (!isBefore(newStart, startOfWeek(new Date(), { weekStartsOn: 1 }))) {
      setCurrentWeekStart(newStart)
    }
  }

  const goToNextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1))
  }

  const handleSlotSelect = (date: Date, time: string) => {
    if (!getSlotAvailability(date, time)) return
    setSelectedDate(date)
    setSelectedTime(time)
    setSlotWarning(null)
  }

  const toggleQuestion = (questionId: string) => {
    setSelectedQuestions(prev => {
      if (prev.includes(questionId)) {
        return prev.filter(q => q !== questionId)
      }
      if (prev.length >= 3) {
        return prev // Max 3 questions
      }
      return [...prev, questionId]
    })
  }

  const handleBookCall = async () => {
    if (!user) {
      navigate('/signup?redirect=/book-exploratory')
      return
    }

    if (!selectedDate || !selectedTime || slotWarning || selectedQuestions.length === 0) return

    setIsSubmitting(true)
    try {
      // In production, this would save to database
      const scheduledAt = new Date(selectedDate)
      const [hours, minutes] = selectedTime.split(':').map(Number)
      scheduledAt.setHours(hours, minutes, 0, 0)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setIsConfirmed(true)
    } catch (error) {
      console.error('Error booking exploratory call:', error)
      alert('Failed to book call. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const canBook = selectedDate && selectedTime && !slotWarning && selectedQuestions.length > 0 && selectedQuestions.length <= 3

  // Mini month picker component
  const MonthPicker = () => {
    const today = new Date()
    const currentMonth = startOfMonth(currentWeekStart)
    const daysInMonth = eachDayOfInterval({
      start: startOfMonth(currentMonth),
      end: endOfMonth(currentMonth)
    })
    const startDay = getDay(startOfMonth(currentMonth))

    return (
      <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-50 w-64">
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {daysInMonth.map(day => {
            const isPast = isBefore(day, today) && !isToday(day)
            const isWeekend = day.getDay() === 0 || day.getDay() === 6
            const isCurrentWeek = day >= currentWeekStart && day < addDays(currentWeekStart, 7)
            
            return (
              <button
                key={day.toISOString()}
                onClick={() => {
                  if (!isPast && !isWeekend) {
                    setCurrentWeekStart(startOfWeek(day, { weekStartsOn: 1 }))
                    setShowMonthPicker(false)
                  }
                }}
                disabled={isPast || isWeekend}
                className={`
                  p-1.5 text-sm rounded-lg transition-colors
                  ${isPast || isWeekend ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-blue-100'}
                  ${isCurrentWeek ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                  ${isToday(day) && !isCurrentWeek ? 'ring-2 ring-blue-500' : ''}
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

  if (isConfirmed) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Exploratory Call Booked!
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Your free 15-minute exploratory call has been scheduled. 
              You'll receive a confirmation email with call details.
            </p>
            <div className="bg-gray-50 rounded-xl p-6 max-w-sm mx-auto mb-6">
              <div className="space-y-3 text-left">
                <div className="flex justify-between">
                  <span className="text-gray-600">Date</span>
                  <span className="font-medium">
                    {selectedDate ? format(selectedDate, 'EEEE, MMMM d') : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time</span>
                  <span className="font-medium">{selectedTime ? formatTime(selectedTime) : '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">15 minutes</span>
                </div>
                <div className="border-t pt-3">
                  <span className="text-gray-600 block mb-2">Topics to discuss:</span>
                  <ul className="text-sm space-y-1">
                    {selectedQuestions.map(qId => {
                      const question = EXPLORATORY_QUESTIONS.find(q => q.id === qId)
                      return question ? (
                        <li key={qId} className="text-gray-800">• {question.title}</li>
                      ) : null
                    })}
                  </ul>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              After this call, you can book a paid advisory session for in-depth consulting.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Book Free Exploratory Call</h1>
          <p className="text-gray-600 mt-1">15 minutes to explore how we can help your business</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Account Required Notice */}
        {!user && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-800 font-medium">Account Required</p>
              <p className="text-amber-700 text-sm">
                Create an account to book your exploratory call. This helps us store your call history and preferences.
              </p>
              <Link to="/signup?redirect=/book-exploratory" className="text-amber-800 underline text-sm font-medium mt-1 inline-block">
                Create Account →
              </Link>
            </div>
          </div>
        )}

        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          
          {/* Left Column - Questions Selection */}
          <div className="lg:col-span-2 mb-8 lg:mb-0">
            {/* Question Selection */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <HelpCircle className="w-6 h-6 text-blue-600" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Select Up to 3 Topics</h2>
                  <p className="text-sm text-gray-500">What would you like to discuss in our 15-minute call?</p>
                </div>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-3">
                {EXPLORATORY_QUESTIONS.map((question) => {
                  const isSelected = selectedQuestions.includes(question.id)
                  const isDisabled = !isSelected && selectedQuestions.length >= 3
                  
                  return (
                    <button
                      key={question.id}
                      onClick={() => toggleQuestion(question.id)}
                      disabled={isDisabled}
                      className={`
                        p-4 rounded-xl border-2 text-left transition-all
                        ${isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : isDisabled 
                            ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }
                      `}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className={`font-medium ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}>
                            {question.title}
                          </h3>
                          <p className={`text-sm mt-1 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}>
                            {question.description}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
              
              <p className="text-sm text-gray-500 mt-4">
                {selectedQuestions.length}/3 topics selected
              </p>
            </div>

            {/* Calendar */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Calendar Navigation */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={goToPreviousWeek}
                    disabled={isBefore(subWeeks(currentWeekStart, 1), startOfWeek(new Date(), { weekStartsOn: 1 }))}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  
                  <div className="relative">
                    <button
                      onClick={() => setShowMonthPicker(!showMonthPicker)}
                      className="flex items-center space-x-2 font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      <CalendarIcon className="w-5 h-5" />
                      <span>{format(currentWeekStart, 'MMMM yyyy')}</span>
                    </button>
                    {showMonthPicker && <MonthPicker />}
                  </div>
                  
                  <button
                    onClick={goToNextWeek}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                
                <span className="text-sm text-gray-500 hidden sm:block">
                  Week of {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d')}
                </span>
              </div>

              {/* Week View Grid */}
              <div className="overflow-x-auto">
                <div className="min-w-[700px]">
                  {/* Day Headers */}
                  <div className="grid grid-cols-8 border-b border-gray-200">
                    <div className="p-3 text-center text-sm font-medium text-gray-500 border-r border-gray-100">
                      <Clock className="w-4 h-4 mx-auto" />
                    </div>
                    {weekDays.map((date) => {
                      const isWeekend = date.getDay() === 0 || date.getDay() === 6
                      const today = isToday(date)
                      
                      return (
                        <div 
                          key={date.toISOString()} 
                          className={`p-3 text-center border-r border-gray-100 last:border-r-0 ${
                            isWeekend ? 'bg-gray-50' : ''
                          } ${today ? 'bg-blue-50' : ''}`}
                        >
                          <span className={`text-xs font-medium ${isWeekend ? 'text-gray-400' : 'text-gray-500'}`}>
                            {format(date, 'EEE')}
                          </span>
                          <span className={`
                            block text-lg font-semibold mt-1
                            ${isWeekend ? 'text-gray-400' : 'text-gray-900'}
                            ${today ? 'text-blue-600' : ''}
                          `}>
                            {format(date, 'd')}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  {/* Time Slots Grid */}
                  <div className="max-h-[400px] overflow-y-auto">
                    {TIME_SLOTS.map((time) => (
                      <div key={time} className="grid grid-cols-8 border-b border-gray-100 last:border-b-0">
                        <div className="p-2 text-xs text-gray-500 text-center border-r border-gray-100 flex items-center justify-center">
                          {formatTime(time)}
                        </div>
                        {weekDays.map((date) => {
                          const isWeekend = date.getDay() === 0 || date.getDay() === 6
                          const isPast = isBefore(date, new Date()) && !isToday(date)
                          const isAvailable = getSlotAvailability(date, time)
                          const isSelected = selectedDate && isSameDay(date, selectedDate) && selectedTime === time
                          
                          return (
                            <button
                              key={`${date.toISOString()}-${time}`}
                              onClick={() => handleSlotSelect(date, time)}
                              disabled={isWeekend || isPast || !isAvailable}
                              className={`
                                p-2 border-r border-gray-100 last:border-r-0 transition-all min-h-[40px]
                                ${isWeekend ? 'bg-gray-50 cursor-not-allowed' : ''}
                                ${isPast ? 'bg-gray-100 cursor-not-allowed' : ''}
                                ${!isAvailable && !isWeekend && !isPast ? 'bg-red-50 cursor-not-allowed' : ''}
                                ${isAvailable && !isWeekend && !isPast ? 'hover:bg-blue-50 cursor-pointer' : ''}
                                ${isSelected ? 'bg-blue-500 hover:bg-blue-600' : ''}
                              `}
                            >
                              {isSelected && (
                                <div className="w-2 h-2 bg-white rounded-full mx-auto" />
                              )}
                            </button>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Summary */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Booking Summary</h2>
              
              {slotWarning && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{slotWarning}</p>
                </div>
              )}
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <CalendarIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <span className="text-xs text-gray-500 block">Date</span>
                    <span className="font-medium text-gray-900">
                      {selectedDate ? format(selectedDate, 'EEEE, MMM d') : 'Select a date'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <span className="text-xs text-gray-500 block">Time</span>
                    <span className="font-medium text-gray-900">
                      {selectedTime ? formatTime(selectedTime) : 'Select a time'}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-xs text-gray-500 block mb-2">Topics ({selectedQuestions.length}/3)</span>
                  {selectedQuestions.length > 0 ? (
                    <ul className="space-y-1">
                      {selectedQuestions.map(qId => {
                        const question = EXPLORATORY_QUESTIONS.find(q => q.id === qId)
                        return question ? (
                          <li key={qId} className="text-sm text-gray-900">• {question.title}</li>
                        ) : null
                      })}
                    </ul>
                  ) : (
                    <span className="text-sm text-gray-500">Select topics above</span>
                  )}
                </div>
              </div>

              {/* Price Display */}
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">15 minutes</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-600">Price</span>
                  <span className="text-2xl font-bold text-green-600">Free</span>
                </div>
              </div>

              <button
                onClick={handleBookCall}
                disabled={!canBook || !user || isSubmitting}
                className={`
                  w-full py-3 rounded-xl font-semibold transition-all
                  ${canBook && user && !isSubmitting
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                {isSubmitting ? 'Booking...' : 'Book Free Call'}
              </button>

              {/* Sign In / Create Account form below checkout */}
              {!user && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <InlineAuth />
                </div>
              )}

              <div className="mt-4 flex items-start space-x-2 text-xs text-gray-500">
                <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>Free 15-minute exploratory call. No payment required. After this call, you can book a paid advisory session.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Sheet */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-40 max-h-[70vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-gray-500">
              {selectedDate ? format(selectedDate, 'MMM d') : 'Select date'} 
              {selectedTime ? ` at ${formatTime(selectedTime)}` : ''}
            </p>
            <p className="text-xs text-gray-400">{selectedQuestions.length}/3 topics selected</p>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold text-green-600">Free</span>
            <p className="text-xs text-gray-500">15 min</p>
          </div>
        </div>
        
        <button
          onClick={handleBookCall}
          disabled={!canBook || !user || isSubmitting}
          className={`
            w-full py-3 rounded-xl font-semibold transition-all
            ${canBook && user && !isSubmitting
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {isSubmitting ? 'Booking...' : 'Book Free Call'}
        </button>

        {/* Sign In / Create Account form below checkout */}
        {!user && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <InlineAuth />
          </div>
        )}
      </div>

      {/* Spacer for mobile */}
      <div className="lg:hidden h-32"></div>

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
