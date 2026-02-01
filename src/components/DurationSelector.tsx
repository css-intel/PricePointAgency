import { calculatePrice, formatPrice, getTimeSlotLabel, PRICING_CONFIG } from '../config/pricing'

interface DurationSelectorProps {
  duration: number
  onDurationChange: (minutes: number) => void
}

export default function DurationSelector({ duration, onDurationChange }: DurationSelectorProps) {
  const price = calculatePrice(duration)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Duration</h3>
      
      {/* Time Slot Buttons */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {PRICING_CONFIG.timeSlots.map((slot) => (
          <button
            key={slot}
            onClick={() => onDurationChange(slot)}
            className={`
              py-3 px-4 rounded-xl font-medium transition-all text-center
              ${duration === slot
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            {getTimeSlotLabel(slot)}
          </button>
        ))}
      </div>

      {/* Slider */}
      <div className="mb-6">
        <input
          type="range"
          min={15}
          max={60}
          step={15}
          value={duration}
          onChange={(e) => onDurationChange(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-gray-500 mt-2">
          <span>15 min</span>
          <span>30 min</span>
          <span>45 min</span>
          <span>60 min</span>
        </div>
      </div>

      {/* Price Display */}
      <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl p-6 text-center">
        <p className="text-sm text-gray-600 mb-1">Total Price</p>
        <p className="text-4xl font-bold gradient-text">{formatPrice(price)}</p>
        <p className="text-sm text-gray-500 mt-2">
          for {getTimeSlotLabel(duration)} of advisory time
        </p>
      </div>

      {/* Refund Policy Notice */}
      <div className="mt-4 p-4 bg-green-50 rounded-xl">
        <p className="text-sm text-green-800">
          <strong>Fair Pricing Guarantee:</strong> If your session uses less time than booked, 
          unused 15-minute blocks are automatically refunded.
        </p>
      </div>
    </div>
  )
}
