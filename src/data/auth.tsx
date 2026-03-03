import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { Session } from '@supabase/supabase-js'
import type { Utilizador, Papel } from './types'

interface AuthState {
  session: Session | null
  profile: Utilizador | null
  role: Papel
  loading: boolean
  signIn: (email: string, password: string) => Promise<string | null>
  signUp: (email: string, password: string, nome: string, departamento: string) => Promise<string | null>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<string | null>
}

const AuthContext = createContext<AuthState | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

async function loadProfile(session: Session): Promise<Utilizador | null> {
  // Try to get existing profile via RPC
  const { data, error } = await supabase.rpc('current_identity')
  if (error || !data || (Array.isArray(data) && data.length === 0)) {
    // Profile doesn't exist yet — init it
    const meta = session.user.user_metadata
    const { data: initData, error: initError } = await supabase.rpc('init_current_user', {
      p_nome: meta?.nome || session.user.email?.split('@')[0] || 'Novo Utilizador',
      p_email: session.user.email || '',
      p_departamento: meta?.departamento || null,
    })
    if (initError || !initData) return null
    return {
      id: String(initData.id),
      nome: initData.nome,
      email: initData.email || '',
      papel: initData.papel as Papel,
      departamento: initData.departamento || '',
    }
  }

  const row = Array.isArray(data) ? data[0] : data
  // Now fetch full profile
  const { data: userRow } = await supabase
    .from('app_users')
    .select('*')
    .eq('id', row.user_id)
    .single()

  if (!userRow) return null
  return {
    id: String(userRow.id),
    nome: userRow.nome,
    email: userRow.email || '',
    papel: userRow.papel as Papel,
    departamento: userRow.departamento || '',
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Utilizador | null>(null)
  const [loading, setLoading] = useState(true)

  const role: Papel = profile?.papel || 'nenhum'

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      if (s) {
        loadProfile(s).then(p => {
          setProfile(p)
          setLoading(false)
        })
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      if (s) {
        loadProfile(s).then(p => {
          setProfile(p)
          setLoading(false)
        })
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = useCallback(async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return error.message
    return null
  }, [])

  const signUp = useCallback(async (email: string, password: string, nome: string, departamento: string): Promise<string | null> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nome, departamento } },
    })
    if (error) return error.message
    return null
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setSession(null)
    setProfile(null)
  }, [])

  const resetPassword = useCallback(async (email: string): Promise<string | null> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) return error.message
    return null
  }, [])

  return (
    <AuthContext.Provider value={{ session, profile, role, loading, signIn, signUp, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  )
}
