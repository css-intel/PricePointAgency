import { useState, useEffect } from 'react'
import { useChatStore } from '../store'
import { Target, CheckCircle, Circle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'

const NUDGE_PROMPTS = [
  "Did you complete the action you outlined?",
  "What blocked progress on your stated goal?",
  "What's the next concrete step?",
  "Have you made progress since our last check-in?",
  "What's preventing you from moving forward?",
]

const STATUS_LABELS = {
  pending: { label: 'Not Started', color: 'text-gray-500', bg: 'bg-gray-100' },
  in_progress: { label: 'In Progress', color: 'text-blue-600', bg: 'bg-blue-100' },
  completed: { label: 'Completed', color: 'text-green-600', bg: 'bg-green-100' },
  blocked: { label: 'Blocked', color: 'text-red-600', bg: 'bg-red-100' },
}

interface AccountabilityPartnerProps {
  intakeText?: string
  onSendMessage?: (message: string) => void
}

export default function AccountabilityPartner({ intakeText, onSendMessage }: AccountabilityPartnerProps) {
  const { goals, addGoal, updateGoalStatus, addMessage, lastNudgeAt, setLastNudge } = useChatStore()
  const [isExpanded, setIsExpanded] = useState(true)
  const [newGoal, setNewGoal] = useState('')
  const [showNudge, setShowNudge] = useState(false)

  // Auto-extract goals from intake text on mount
  useEffect(() => {
    if (intakeText && goals.length === 0) {
      // Simple extraction - in production, use AI to parse
      const lines = intakeText.split(/[.\n]/).filter(line => line.trim().length > 10)
      if (lines.length > 0) {
        addGoal(lines[0].trim())
      }
    }
  }, [intakeText, goals.length, addGoal])

  // Check if nudge should appear (e.g., after 24 hours or on session start)
  useEffect(() => {
    const now = new Date()
    const pendingGoals = goals.filter(g => g.status === 'pending' || g.status === 'in_progress')
    
    if (pendingGoals.length > 0) {
      // Show nudge if no recent check-in
      if (!lastNudgeAt || (now.getTime() - lastNudgeAt.getTime()) > 24 * 60 * 60 * 1000) {
        setShowNudge(true)
      }
    }
  }, [goals, lastNudgeAt])

  const handleAddGoal = () => {
    if (newGoal.trim()) {
      addGoal(newGoal.trim())
      setNewGoal('')
    }
  }

  const handleStatusChange = (goalId: string, newStatus: 'pending' | 'in_progress' | 'completed' | 'blocked') => {
    updateGoalStatus(goalId, newStatus)
  }

  const handleNudgeResponse = (response: 'yes' | 'no' | 'blocked') => {
    setShowNudge(false)
    setLastNudge(new Date())
    
    const randomPrompt = NUDGE_PROMPTS[Math.floor(Math.random() * NUDGE_PROMPTS.length)]
    
    // Add accountability message to chat
    addMessage({
      role: 'accountability',
      content: response === 'yes' 
        ? "Great progress! What's your next concrete step?" 
        : response === 'blocked'
          ? "What's blocking you? Let's identify the obstacle."
          : randomPrompt
    })

    // If there's an onSendMessage callback, trigger a follow-up
    if (onSendMessage && response !== 'yes') {
      setTimeout(() => {
        onSendMessage(`Accountability check: ${randomPrompt}`)
      }, 500)
    }
  }

  if (goals.length === 0 && !intakeText) {
    return null
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <Target className="w-5 h-5 text-blue-600" />
          <span className="font-semibold text-gray-900">Accountability Partner</span>
          {goals.length > 0 && (
            <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
              {goals.filter(g => g.status !== 'completed').length} active
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {isExpanded && (
        <div className="p-4">
          {/* Nudge Card */}
          {showNudge && goals.some(g => g.status === 'pending' || g.status === 'in_progress') && (
            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm font-medium text-amber-800 mb-3">
                Have you made progress on your stated goal?
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleNudgeResponse('yes')}
                  className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  Yes
                </button>
                <button
                  onClick={() => handleNudgeResponse('no')}
                  className="px-3 py-1.5 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Not yet
                </button>
                <button
                  onClick={() => handleNudgeResponse('blocked')}
                  className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  Blocked
                </button>
              </div>
            </div>
          )}

          {/* Goals List */}
          <div className="space-y-3">
            {goals.map((goal) => (
              <div key={goal.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <button
                  onClick={() => handleStatusChange(
                    goal.id, 
                    goal.status === 'completed' ? 'pending' : 'completed'
                  )}
                  className="mt-0.5 flex-shrink-0"
                >
                  {goal.status === 'completed' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : goal.status === 'blocked' ? (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400 hover:text-blue-600 transition-colors" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${goal.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {goal.goal}
                  </p>
                  <div className="mt-1 flex items-center space-x-2">
                    <select
                      value={goal.status}
                      onChange={(e) => handleStatusChange(goal.id, e.target.value as any)}
                      className={`text-xs px-2 py-0.5 rounded border-0 ${STATUS_LABELS[goal.status].bg} ${STATUS_LABELS[goal.status].color}`}
                    >
                      <option value="pending">Not Started</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="blocked">Blocked</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Goal */}
          <div className="mt-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddGoal()}
                placeholder="Add a goal or action item..."
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleAddGoal}
                disabled={!newGoal.trim()}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Description */}
          <p className="mt-4 text-xs text-gray-500">
            Checks progress, asks follow-ups, and nudges execution on stated goals.
          </p>
        </div>
      )}
    </div>
  )
}
