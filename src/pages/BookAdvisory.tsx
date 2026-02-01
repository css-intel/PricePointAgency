import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { format, addDays, startOfWeek, isSameDay, isToday, isBefore, addWeeks, subWeeks, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, CheckCircle, AlertCircle, Mic, Square, Play, Pause, Trash2, Shield, Crown, Phone, Video } from 'lucide-react'
import { useBookingStore } from '../store'
import { useAuth } from '../context/AuthContext'
import { calculatePrice, formatPrice } from '../config/pricing'
import InlineAuth from '../components/InlineAuth'

// Duration options for paid sessions
const MIN_DURATION = 15
const MAX_DURATION = 60

// Consultation type options
const CONSULTATION_TYPES = [
  { value: 'phone', label: 'Phone Call', icon: Phone },
  { value: 'video', label: 'Video Chat', icon: Video },
]

// Time slots from 9 AM to 5 PM in 15-minute increments
const generateTimeSlots = () => {
  const slots: string[] = []
  for (let hour = 9; hour <= 17; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      if (hour === 17 && minute > 0) break // Stop at 5:00 PM
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

// Simulate slot availability (in production, fetch from backend)
const getSlotAvailability = (date: Date, time: string): boolean => {
  // Weekends unavailable
  const dayOfWeek = date.getDay()
  if (dayOfWeek === 0 || dayOfWeek === 6) return false
  
  // Past dates unavailable
  if (isBefore(date, new Date()) && !isToday(date)) return false
  
  // Simulate some random unavailability for demo
  const hash = date.getDate() + parseInt(time.replace(':', ''))
  return hash % 5 !== 0
}

export default function BookAdvisory() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, retainerStatus } = useAuth()
  const { 
    selectedDate, selectedTime, 
    intakeText, intakeAudioUrl, intakeAudioBlob,
    setDate, setTime, setIntakeText, setIntakeAudio 
  } = useBookingStore()
  
  // Get initial duration from URL params or default to 30
  const initialDuration = parseInt(searchParams.get('duration') || '30')
  const [sessionDuration, setSessionDuration] = useState(
    Math.min(Math.max(initialDuration, MIN_DURATION), MAX_DURATION)
  )
  
  const [currentWeekStart, setCurrentWeekStart] = useState(() => 
    startOfWeek(new Date(), { weekStartsOn: 1 })
  )
  const [showMonthPicker, setShowMonthPicker] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [slotWarning, setSlotWarning] = useState<string | null>(null)
  const [consultationType, setConsultationType] = useState<'phone' | 'video'>('video')
  
  // Voice recording state
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Check if user has active retainer
  const isRetainerUser = retainerStatus.active
  
  // Calculate price based on duration
  const sessionPrice = calculatePrice(sessionDuration)

  // Generate week days
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i))

  // Check if selected slot is still valid
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
    setDate(date)
    setTime(time)
    setSlotWarning(null)
  }

  const handleCheckout = async () => {
    if (!user) {
      navigate('/signup?redirect=/book')
      return
    }

    if (!selectedDate || !selectedTime || slotWarning) return

    // For retainer users, book directly without payment
    if (isRetainerUser) {
      if (!retainerStatus.canBookSession) {
        alert(retainerStatus.sessionsRemaining === 0 
          ? "You've used all 8 sessions this month."
          : "You've reached the 2 sessions/week limit.")
        return
      }

      try {
        const scheduledAt = new Date(selectedDate)
        const [hours, minutes] = selectedTime.split(':').map(Number)
        scheduledAt.setHours(hours, minutes, 0, 0)

        const response = await fetch('/.netlify/functions/book-retainer-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            scheduledAt: scheduledAt.toISOString(),
            durationMinutes: 60, // Retainer sessions up to 60 min
            intakeText: intakeText.trim() || undefined,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to book session')
        }

        setIsConfirmed(true)
      } catch (error: any) {
        console.error('Error booking retainer session:', error)
        alert(error.message || 'Failed to book session. Please try again.')
      }
      return
    }

    // Paid session - redirect to Stripe checkout
    try {
      const scheduledAt = new Date(selectedDate)
      const [hours, minutes] = selectedTime.split(':').map(Number)
      scheduledAt.setHours(hours, minutes, 0, 0)

      const response = await fetch('/.netlify/functions/create-booking-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: user.email,
          durationMinutes: sessionDuration,
          scheduledAt: scheduledAt.toISOString(),
          consultationType,
          intakeText: intakeText.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout')
      }

      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error: any) {
      console.error('Error creating checkout:', error)
      alert(error.message || 'Failed to start checkout. Please try again.')
    }
  }

  const canCheckout = selectedDate && selectedTime && !slotWarning && (intakeText.trim().length > 0 || intakeAudioBlob)

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const audioUrl = URL.createObjectURL(audioBlob)
        setIntakeAudio(audioUrl, audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      
      timerRef.current = setInterval(() => {
        setRecordingTime(t => t + 1)
      }, 1000)
    } catch (err) {
      console.error('Error accessing microphone:', err)
      alert('Unable to access microphone. Please check your permissions.')
    }
  }
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }
  
  const deleteRecording = () => {
    if (intakeAudioUrl) {
      URL.revokeObjectURL(intakeAudioUrl)
    }
    setIntakeAudio(null, null)
    setRecordingTime(0)
    setIsPlaying(false)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
  }
  
  const togglePlayback = () => {
    if (!intakeAudioUrl) return
    
    if (isPlaying && audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      if (!audioRef.current) {
        audioRef.current = new Audio(intakeAudioUrl)
        audioRef.current.onended = () => setIsPlaying(false)
      }
      audioRef.current.play()
      setIsPlaying(true)
    }
  }
  
  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Mini month picker
  const MonthPicker = () => {
    const today = new Date()
    const monthStart = startOfMonth(currentWeekStart)
    const monthEnd = endOfMonth(currentWeekStart)
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
    const startDayOfWeek = getDay(monthStart)
    
    return (
      <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-50 w-72">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 4))}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold">{format(currentWeekStart, 'MMMM yyyy')}</span>
          <button 
            onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 4))}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <span key={d} className="text-gray-500 font-medium py-1">{d}</span>
          ))}
          {Array(startDayOfWeek).fill(null).map((_, i) => (
            <span key={`empty-${i}`} />
          ))}
          {days.map(day => {
            const isPast = isBefore(day, today) && !isToday(day)
            const isWeekend = getDay(day) === 0 || getDay(day) === 6
            const isSelected = selectedDate && isSameDay(day, selectedDate)
            const isInCurrentWeek = weekDays.some(wd => isSameDay(wd, day))
            
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
                  py-1 rounded text-sm
                  ${isSelected ? 'bg-blue-600 text-white' : ''}
                  ${isInCurrentWeek && !isSelected ? 'bg-blue-100' : ''}
                  ${isPast || isWeekend ? 'text-gray-300' : 'hover:bg-gray-100'}
                  ${isToday(day) && !isSelected ? 'font-bold text-blue-600' : ''}
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
              Booking Confirmed!
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Your consultation has been scheduled. You will receive a confirmation 
              email with the details shortly.
            </p>
            <div className="bg-gray-50 rounded-xl p-6 max-w-sm mx-auto mb-8">
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
                  <span className="text-gray-600">Type</span>
                  <span className="font-medium capitalize">{consultationType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">{isRetainerUser ? '60' : sessionDuration} minutes</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total</span>
                    {isRetainerUser ? (
                      <span className="font-bold text-green-600">Covered by Retainer</span>
                    ) : (
                      <span className="font-bold text-gray-900">{formatPrice(sessionPrice)}</span>
                    )}
                  </div>
                  {isRetainerUser && (
                    <p className="text-sm text-gray-500 mt-2">
                      {retainerStatus.sessionsRemaining - 1} sessions remaining this month
                    </p>
                  )}
                </div>
              </div>
            </div>
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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Book Advisory Session</h1>
          <p className="text-gray-600 mt-1">Select your session duration, choose a time slot, and tell us what you'd like to discuss</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          
          {/* Left Column - Calendar Week View */}
          <div className="lg:col-span-2">
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
                      const isSelected = selectedDate && isSameDay(date, selectedDate)
                      
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
                            ${isSelected ? 'text-blue-600' : isWeekend ? 'text-gray-400' : 'text-gray-900'}
                            ${today ? 'underline decoration-blue-600 decoration-2' : ''}
                          `}>
                            {format(date, 'd')}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  {/* Time Slots Grid */}
                  <div className="max-h-[500px] overflow-y-auto">
                    {TIME_SLOTS.map((time) => (
                      <div key={time} className="grid grid-cols-8 border-b border-gray-100 last:border-b-0">
                        {/* Time Label */}
                        <div className="p-2 text-center text-xs font-medium text-gray-500 border-r border-gray-100 flex items-center justify-center">
                          {formatTime(time)}
                        </div>
                        
                        {/* Day Slots */}
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
                                    : 'bg-gray-100 cursor-not-allowed'
                                }
                              `}
                            >
                              {isSelected && (
                                <CheckCircle className="w-4 h-4 mx-auto" />
                              )}
                              {!available && !isWeekend && (
                                <span className="text-xs text-gray-400">-</span>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-white border border-gray-300 rounded"></div>
                    <span className="text-gray-600">Available</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-600 rounded"></div>
                    <span className="text-gray-600">Selected</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gray-100 rounded"></div>
                    <span className="text-gray-600">Unavailable</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sticky Sidebar */}
          <div className="mt-8 lg:mt-0 hidden lg:block">
            <div className="lg:sticky lg:top-24">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Your Session</h2>

                {/* Selected Appointment */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selected Date & Time
                  </label>
                  <div className={`
                    p-4 rounded-xl border-2 transition-colors
                    ${selectedDate && selectedTime 
                      ? 'border-blue-200 bg-blue-50' 
                      : 'border-gray-200 bg-gray-50'
                    }
                  `}>
                    {selectedDate && selectedTime ? (
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                          <CalendarIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {format(selectedDate, 'EEE, MMM d')} - {formatTime(selectedTime)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {format(selectedDate, 'yyyy')}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-2">
                        Click a time slot on the calendar
                      </p>
                    )}
                  </div>
                  
                  {/* Slot Warning */}
                  {slotWarning && (
                    <div className="mt-3 flex items-start space-x-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <p className="text-sm">{slotWarning}</p>
                    </div>
                  )}
                </div>

                {/* Consultation Type Selector */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How would you like to connect?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {CONSULTATION_TYPES.map((type) => {
                      const IconComponent = type.icon
                      return (
                        <button
                          key={type.value}
                          onClick={() => setConsultationType(type.value as 'phone' | 'video')}
                          className={`
                            p-3 rounded-xl border-2 transition-all text-center flex flex-col items-center
                            ${consultationType === type.value
                              ? 'border-blue-600 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300 text-gray-700'
                            }
                          `}
                        >
                          <IconComponent className="w-5 h-5 mb-1" />
                          <span className="font-semibold block text-sm">{type.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Session Intake */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What would you like to discuss?
                  </label>
                  
                  {/* Text Input */}
                  <textarea
                    value={intakeText}
                    onChange={(e) => setIntakeText(e.target.value)}
                    placeholder="Tell us about your business and what you'd like help with..."
                    className="w-full p-3 border border-gray-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    rows={4}
                    maxLength={1500}
                  />
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-400">
                      {intakeText.length}/1500 characters
                    </span>
                  </div>
                  
                  {/* Voice Recording */}
                  <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-600">Or record a voice note</span>
                      
                      {!intakeAudioUrl ? (
                        <button
                          onClick={isRecording ? stopRecording : startRecording}
                          className={`
                            flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                            ${isRecording 
                              ? 'bg-red-500 text-white hover:bg-red-600' 
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                            }
                          `}
                        >
                          {isRecording ? (
                            <>
                              <Square className="w-4 h-4 fill-current" />
                              <span>{formatRecordingTime(recordingTime)}</span>
                            </>
                          ) : (
                            <>
                              <Mic className="w-4 h-4" />
                              <span>Record</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={togglePlayback}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                          >
                            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </button>
                          <span className="text-xs text-gray-500">{formatRecordingTime(recordingTime)}</span>
                          <button
                            onClick={deleteRecording}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {isRecording && (
                      <div className="mt-2 flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-xs text-red-600">Recording...</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Privacy Note */}
                  <div className="mt-3 flex items-start space-x-2 text-xs text-gray-500">
                    <Shield className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400" />
                    <span>Your message is only used to prepare for your session.</span>
                  </div>
                  
                  {/* Validation hint */}
                  {!intakeText.trim() && !intakeAudioBlob && (
                    <p className="mt-2 text-xs text-amber-600">
                      Please provide a text note or voice recording.
                    </p>
                  )}
                </div>

                {/* Retainer Status Banner */}
                {isRetainerUser && (
                  <div className="mb-6 p-4 bg-primary-50 rounded-xl border border-primary-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Crown className="w-5 h-5 text-primary-600" />
                      <span className="font-semibold text-primary-800">Monthly Retainer Active</span>
                    </div>
                    <div className="text-sm text-primary-700 space-y-1">
                      <p>{retainerStatus.sessionsRemaining} sessions remaining this month</p>
                      <p>{2 - retainerStatus.sessionsThisWeek} sessions available this week</p>
                    </div>
                    {!retainerStatus.canBookSession && (
                      <div className="mt-2 text-sm text-amber-700 bg-amber-50 p-2 rounded">
                        {retainerStatus.sessionsRemaining === 0 
                          ? "You've used all 8 sessions this month."
                          : "You've reached the 2 sessions/week limit. Book for next week!"}
                      </div>
                    )}
                  </div>
                )}

                {/* Duration Slider - Only for non-retainer users */}
                {!isRetainerUser && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Session Duration
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-2xl font-bold text-gray-900">{sessionDuration} min</span>
                        <span className="text-xl font-bold text-primary-600">{formatPrice(sessionPrice)}</span>
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
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>15 min • {formatPrice(calculatePrice(15))}</span>
                        <span>60 min • {formatPrice(calculatePrice(60))}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Price Display */}
                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total</span>
                    {isRetainerUser ? (
                      <div className="text-right">
                        <span className="text-xl font-bold text-green-600">Covered by retainer</span>
                      </div>
                    ) : (
                      <span className="text-3xl font-bold text-gray-900">
                        {formatPrice(sessionPrice)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Policy */}
                <div className="mb-6 text-sm text-gray-500 bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-blue-700">
                    {isRetainerUser 
                      ? "This session is included in your Monthly Retainer."
                      : `${sessionDuration}-minute advisory session. Payment required at checkout.`
                    }
                  </p>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={!canCheckout || !user || (isRetainerUser && !retainerStatus.canBookSession)}
                  className={`
                    w-full py-4 rounded-xl font-semibold text-lg transition-all
                    ${(canCheckout && user && (!isRetainerUser || retainerStatus.canBookSession))
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }
                  `}
                >
                  {isRetainerUser
                    ? 'Confirm Booking'
                    : `Continue to Payment • ${formatPrice(sessionPrice)}`
                  }
                </button>

                <p className="text-xs text-gray-500 text-center mt-3">
                  {isRetainerUser 
                    ? "Session will be deducted from your retainer"
                    : "Secure payment via Stripe"
                  }
                </p>

                {/* Sign In / Create Account form below checkout */}
                {!user && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 text-center mb-3">Sign in or create an account to continue</p>
                    <InlineAuth />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Sheet */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl p-4 z-40">
        <div className="flex items-center justify-between mb-3">
          <div>
            {selectedDate && selectedTime ? (
              <p className="font-medium text-gray-900 text-sm">
                {format(selectedDate, 'EEE, MMM d')} - {formatTime(selectedTime)}
              </p>
            ) : (
              <p className="text-gray-500 text-sm">Select a time slot</p>
            )}
            <div className="flex items-center space-x-2 mt-1">
              {CONSULTATION_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setConsultationType(type.value as 'phone' | 'video')}
                  className={`
                    px-2 py-1 rounded text-xs font-medium transition-colors
                    ${consultationType === type.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                    }
                  `}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
          <div className="text-right">
            {isRetainerUser ? (
              <p className="text-lg font-bold text-green-600">Covered</p>
            ) : (
              <>
                <p className="text-xl font-bold text-gray-900">{formatPrice(sessionPrice)}</p>
                <p className="text-xs text-gray-500">{sessionDuration} min</p>
              </>
            )}
          </div>
        </div>
        
        {/* Mobile Intake */}
        <div className="mb-3">
          <input
            type="text"
            value={intakeText}
            onChange={(e) => setIntakeText(e.target.value)}
            placeholder="What would you like to discuss?"
            className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="flex items-center justify-between mt-2">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`
                flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium transition-all
                ${isRecording 
                  ? 'bg-red-500 text-white' 
                  : intakeAudioUrl 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-600'
                }
              `}
            >
              {isRecording ? (
                <>
                  <Square className="w-3 h-3 fill-current" />
                  <span>{formatRecordingTime(recordingTime)}</span>
                </>
              ) : intakeAudioUrl ? (
                <>
                  <CheckCircle className="w-3 h-3" />
                  <span>Voice recorded</span>
                </>
              ) : (
                <>
                  <Mic className="w-3 h-3" />
                  <span>Voice note</span>
                </>
              )}
            </button>
            {intakeAudioUrl && (
              <div className="flex items-center space-x-1">
                <button onClick={togglePlayback} className="p-1 text-blue-600">
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button onClick={deleteRecording} className="p-1 text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
        
        <button
          onClick={handleCheckout}
          disabled={!canCheckout || !user || (isRetainerUser && !retainerStatus.canBookSession)}
          className={`
            w-full py-3 rounded-xl font-semibold transition-all
            ${(canCheckout && user && (!isRetainerUser || retainerStatus.canBookSession))
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {isRetainerUser 
            ? 'Confirm Booking' 
            : `Pay ${formatPrice(sessionPrice)}`
          }
        </button>

        {/* Sign In / Create Account form below checkout */}
        {!user && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 text-center mb-3">Sign in or create an account to continue</p>
            <InlineAuth />
          </div>
        )}
      </div>

      {/* Spacer for mobile bottom sheet */}
      <div className="lg:hidden h-36"></div>

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
