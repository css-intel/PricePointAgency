interface TimeSlotsProps {
  selectedTime: string | null
  onTimeSelect: (time: string) => void
  selectedDate: Date | null
}

// Available time slots (9 AM to 5 PM, hourly)
const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00'
]

export default function TimeSlots({ selectedTime, onTimeSelect, selectedDate }: TimeSlotsProps) {
  if (!selectedDate) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Time</h3>
        <p className="text-gray-500 text-center py-8">
          Please select a date first
        </p>
      </div>
    )
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    const period = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
  }

  // In a real app, you'd check availability from the backend
  const getSlotAvailability = (_time: string) => {
    // Simulate some slots being unavailable
    return Math.random() > 0.2
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Time</h3>
      
      <div className="grid grid-cols-3 gap-3">
        {TIME_SLOTS.map((time) => {
          const available = getSlotAvailability(time)
          const selected = selectedTime === time

          return (
            <button
              key={time}
              onClick={() => available && onTimeSelect(time)}
              disabled={!available}
              className={`
                py-3 px-4 rounded-xl font-medium transition-all text-center
                ${selected
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-200'
                  : available
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                }
              `}
            >
              {formatTime(time)}
            </button>
          )
        })}
      </div>

      <p className="text-sm text-gray-500 mt-4 text-center">
        All times shown in your local timezone
      </p>
    </div>
  )
}
