import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase, User } from '../lib/supabase'

interface RetainerStatus {
  active: boolean
  sessionsUsed: number
  sessionsRemaining: number
  sessionsThisWeek: number
  canBookSession: boolean
  periodEnd: Date | null
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  isSubscribed: boolean
  isAdmin: boolean
  retainerStatus: RetainerStatus
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      setUser(null)
    } else {
      setUser(data)
    }
    setLoading(false)
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      return { error: error.message }
    }
    return {}
  }

  async function signUp(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    })

    if (error) {
      return { error: error.message }
    }

    // Create user profile
    if (data.user) {
      await supabase.from('users').insert({
        id: data.user.id,
        email,
        full_name: fullName,
        is_subscribed: false,
        is_admin: false,
      })
    }

    return {}
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
  }

  const isSubscribed = user?.is_subscribed && 
    (!user.subscription_expires_at || new Date(user.subscription_expires_at) > new Date())

  // Calculate retainer status
  const getRetainerStatus = (): RetainerStatus => {
    if (!user?.retainer_active || !user.retainer_period_end) {
      return {
        active: false,
        sessionsUsed: 0,
        sessionsRemaining: 0,
        sessionsThisWeek: 0,
        canBookSession: false,
        periodEnd: null,
      }
    }

    const now = new Date()
    const periodEnd = new Date(user.retainer_period_end)
    
    // Check if retainer period is still active
    if (periodEnd < now) {
      return {
        active: false,
        sessionsUsed: user.retainer_sessions_used,
        sessionsRemaining: 0,
        sessionsThisWeek: 0,
        canBookSession: false,
        periodEnd,
      }
    }

    const sessionsUsed = user.retainer_sessions_used || 0
    const sessionsRemaining = Math.max(0, 8 - sessionsUsed)
    const sessionsThisWeek = user.retainer_sessions_this_week || 0
    
    // Can book if: sessions remaining > 0 AND sessions this week < 2
    const canBookSession = sessionsRemaining > 0 && sessionsThisWeek < 2

    return {
      active: true,
      sessionsUsed,
      sessionsRemaining,
      sessionsThisWeek,
      canBookSession,
      periodEnd,
    }
  }

  const retainerStatus = getRetainerStatus()

  async function refreshUser() {
    if (user?.id) {
      await fetchUserProfile(user.id)
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isSubscribed: !!isSubscribed,
    isAdmin: user?.is_admin || false,
    retainerStatus,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
