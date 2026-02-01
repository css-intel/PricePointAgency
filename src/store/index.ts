import { create } from 'zustand'

interface BookingState {
  selectedDuration: number
  selectedDate: Date | null
  selectedTime: string | null
  intakeText: string
  intakeAudioUrl: string | null
  intakeAudioBlob: Blob | null
  setDuration: (minutes: number) => void
  setDate: (date: Date | null) => void
  setTime: (time: string | null) => void
  setIntakeText: (text: string) => void
  setIntakeAudio: (url: string | null, blob: Blob | null) => void
  reset: () => void
}

export const useBookingStore = create<BookingState>((set) => ({
  selectedDuration: 30,
  selectedDate: null,
  selectedTime: null,
  intakeText: '',
  intakeAudioUrl: null,
  intakeAudioBlob: null,
  setDuration: (minutes) => set({ selectedDuration: minutes }),
  setDate: (date) => set({ selectedDate: date }),
  setTime: (time) => set({ selectedTime: time }),
  setIntakeText: (text) => set({ intakeText: text }),
  setIntakeAudio: (url, blob) => set({ intakeAudioUrl: url, intakeAudioBlob: blob }),
  reset: () => set({ 
    selectedDuration: 30, 
    selectedDate: null, 
    selectedTime: null,
    intakeText: '',
    intakeAudioUrl: null,
    intakeAudioBlob: null
  }),
}))

interface ChatMessage {
  role: 'user' | 'assistant' | 'accountability'
  content: string
  timestamp?: Date
}

interface AccountabilityGoal {
  id: string
  goal: string
  status: 'pending' | 'in_progress' | 'completed' | 'blocked'
  createdAt: Date
  lastCheckedAt?: Date
}

interface ChatState {
  messages: ChatMessage[]
  isLoading: boolean
  sessionId: string | null
  goals: AccountabilityGoal[]
  lastNudgeAt: Date | null
  addMessage: (message: ChatMessage) => void
  setLoading: (loading: boolean) => void
  setSessionId: (id: string | null) => void
  addGoal: (goal: string) => void
  updateGoalStatus: (id: string, status: AccountabilityGoal['status']) => void
  setLastNudge: (date: Date) => void
  clearMessages: () => void
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isLoading: false,
  sessionId: null,
  goals: [],
  lastNudgeAt: null,
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, { ...message, timestamp: message.timestamp || new Date() }] 
  })),
  setLoading: (loading) => set({ isLoading: loading }),
  setSessionId: (id) => set({ sessionId: id }),
  addGoal: (goal) => set((state) => ({
    goals: [...state.goals, {
      id: crypto.randomUUID(),
      goal,
      status: 'pending',
      createdAt: new Date()
    }]
  })),
  updateGoalStatus: (id, status) => set((state) => ({
    goals: state.goals.map(g => g.id === id ? { ...g, status, lastCheckedAt: new Date() } : g)
  })),
  setLastNudge: (date) => set({ lastNudgeAt: date }),
  clearMessages: () => set({ messages: [], sessionId: null, goals: [], lastNudgeAt: null }),
}))
