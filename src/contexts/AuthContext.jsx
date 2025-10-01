import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState(null)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserSubscription(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          loadUserSubscription(session.user.id)
        } else {
          setSubscription(null)
        }
        setLoading(false)
      }
    )

    return () => subscription?.unsubscribe()
  }, [])

  const loadUserSubscription = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_status, subscription_expires_at')
        .eq('id', userId)
        .single()

      if (error) throw error

      const isActive = data.subscription_status === 'active' && 
                      new Date(data.subscription_expires_at) > new Date()

      setSubscription({
        status: data.subscription_status,
        expiresAt: data.subscription_expires_at,
        isActive
      })
    } catch (error) {
      console.error('Error loading subscription:', error)
      setSubscription(null)
    }
  }

  const signUp = async (email, password, userData = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })

    if (error) throw error
    return data
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const hasActiveSubscription = () => {
    return subscription?.isActive || false
  }

  const canAccessPremiumContent = (deckSubmittedAt) => {
    // Check if deck is within 7 days (premium content)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const deckDate = new Date(deckSubmittedAt)
    
    // If deck is older than 7 days, it's public
    if (deckDate <= sevenDaysAgo) {
      return true
    }
    
    // If deck is within 7 days, user needs active subscription
    return hasActiveSubscription()
  }

  const value = {
    user,
    subscription,
    loading,
    signUp,
    signIn,
    signOut,
    hasActiveSubscription,
    canAccessPremiumContent,
    refreshSubscription: () => user && loadUserSubscription(user.id)
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Mock authentication for development
export const MockAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(false)

  const signUp = async (email, password, userData = {}) => {
    // Mock signup
    const mockUser = {
      id: 'mock-user-' + Date.now(),
      email,
      ...userData
    }
    setUser(mockUser)
    return { user: mockUser }
  }

  const signIn = async (email, password) => {
    // Mock signin
    const mockUser = {
      id: 'mock-user-' + Date.now(),
      email
    }
    setUser(mockUser)
    return { user: mockUser }
  }

  const signOut = async () => {
    setUser(null)
    setSubscription(null)
  }

  const hasActiveSubscription = () => {
    return subscription?.isActive || false
  }

  const canAccessPremiumContent = (deckSubmittedAt) => {
    // For demo purposes, allow access to all content
    return true
  }

  const value = {
    user,
    subscription,
    loading,
    signUp,
    signIn,
    signOut,
    hasActiveSubscription,
    canAccessPremiumContent,
    refreshSubscription: () => {}
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
