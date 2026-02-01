import { useState } from 'react'
import { format, addDays, startOfWeek, isSameDay, isToday, isBefore } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CalendarProps {
  selectedDate: Date | null
  onDateSelect: (date: Date) => void
  availableDates?: Date[]
}

export default function Calendar({ selectedDate, onDateSelect, availableDates }: CalendarProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => 
    startOfWeek(new Date(), { weekStartsOn: 1 })
  )

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i))

  const goToPreviousWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, -7))
  }

  const goToNextWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, 7))
  }

  const isDateAvailable = (date: Date) => {
    if (isBefore(date, new Date()) && !isToday(date)) return false
    if (availableDates) {
      return availableDates.some(d => isSameDay(d, date))
    }
    // Default: weekdays only
    const dayOfWeek = date.getDay()
    return dayOfWeek !== 0 && dayOfWeek !== 6
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousWeek}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          disabled={isBefore(currentWeekStart, new Date())}
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <span className="font-semibold text-gray-900">
          {format(currentWeekStart, 'MMMM yyyy')}
        </span>
        <button
          onClick={goToNextWeek}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Week Days */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((date) => {
          const available = isDateAvailable(date)
          const selected = selectedDate && isSameDay(date, selectedDate)
          const today = isToday(date)

          return (
            <button
              key={date.toISOString()}
              onClick={() => available && onDateSelect(date)}
              disabled={!available}
              className={`
                flex flex-col items-center p-3 rounded-xl transition-all
                ${selected 
                  ? 'bg-primary-600 text-white' 
                  : available 
                    ? 'hover:bg-primary-50 text-gray-900' 
                    : 'text-gray-300 cursor-not-allowed'
                }
                ${today && !selected ? 'ring-2 ring-primary-200' : ''}
              `}
            >
              <span className="text-xs font-medium mb-1">
                {format(date, 'EEE')}
              </span>
              <span className={`text-lg font-semibold ${selected ? 'text-white' : ''}`}>
                {format(date, 'd')}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
