import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Session, User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session)
        setUser(session.user)
        setLoading(false)
      } else {
        supabase.auth.signInAnonymously().then(({ data, error }) => {
          if (error) {
            console.error('Anonymous sign-in failed:', error)
          } else {
            setSession(data.session)
            setUser(data.user)
          }
          setLoading(false)
        })
      }
    }).catch((error) => {
      console.error('Failed to get session:', error)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
      },
    )

    return () => subscription.unsubscribe()
  }, [])

  return { user, session, loading }
}
