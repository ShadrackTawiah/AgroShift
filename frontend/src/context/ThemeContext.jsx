
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

import { supabase } from '../services/supabase'
import { useAuth } from './AuthContext'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const { user } = useAuth()

  const [theme, setTheme] = useState('light')
  const [themeLoading, setThemeLoading] = useState(true)
  const [themeSaving, setThemeSaving] = useState(false)

  // Load the current user's saved theme.
  useEffect(() => {
    let active = true

    async function loadTheme() {
      setThemeLoading(true)

      if (!user) {
        setTheme('light')
        setThemeLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('user_settings')
        .select('theme')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!active) return

      if (error) {
        console.error('Theme loading error:', error.message)
        setTheme('light')
      } else {
        setTheme(data?.theme || 'light')
      }

      setThemeLoading(false)
    }

    loadTheme()

    return () => {
      active = false
    }
  }, [user?.id])

  // Apply the selected theme across the application.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.style.colorScheme = theme
  }, [theme])

  // Save the theme to the logged-in user's Supabase record.
  async function updateTheme(newTheme) {
    if (!user || !['light', 'dark'].includes(newTheme)) {
      return { error: new Error('A valid signed-in user is required.') }
    }

    setThemeSaving(true)

    const { error } = await supabase
      .from('user_settings')
      .upsert(
        {
          user_id: user.id,
          theme: newTheme,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )

    if (error) {
      console.error('Theme saving error:', error.message)
      setThemeSaving(false)
      return { error }
    }

    setTheme(newTheme)
    setThemeSaving(false)

    return { error: null }
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        updateTheme,
        themeLoading,
        themeSaving,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider')
  }

  return context
}
