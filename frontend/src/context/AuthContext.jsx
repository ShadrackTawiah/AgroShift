
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

import { supabase } from '../services/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function loadProfile(userId) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.error('Profile loading error:', error.message)
      }

      if (mounted) {
        setProfile(data ?? null)
      }
    }

    async function loadUser() {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error('Session error:', error.message)
      }

      if (mounted) {
        const currentUser = data?.session?.user ?? null

        setUser(currentUser)

        if (currentUser) {
          await loadProfile(currentUser.id)
        }

        setLoading(false)
      }
    }

    loadUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return

      const currentUser = session?.user ?? null

      setUser(currentUser)

      if (event === 'SIGNED_OUT') {
        setProfile(null)
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setProfile(null)

        if (currentUser) {
          setTimeout(() => {
            loadProfile(currentUser.id)
          }, 0)
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Register a new user and send the email confirmation link.
  async function signUp({ email, password, fullName }) {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
       emailRedirectTo: `${
  import.meta.env.VITE_SITE_URL || window.location.origin
}/`,
      },
    })
  }

  // Sign in an existing user.
  async function signIn({ email, password }) {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    })
  }

  // Sign out the current user.
  async function signOut() {
    return await supabase.auth.signOut()
  }

  // Refresh the user's profile.
  async function refreshProfile() {
    if (!user) return

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (error) {
      console.error('Profile refresh error:', error.message)
      return
    }

    setProfile(data ?? null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
