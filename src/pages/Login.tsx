import { useState } from 'react'
import { useAuth } from '@/data/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { departamentos } from '@/data/constants'

type Mode = 'login' | 'signup' | 'reset'

export default function Login() {
  const { signIn, signUp, resetPassword } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nome, setNome] = useState('')
  const [departamento, setDepartamento] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    if (mode === 'login') {
      const err = await signIn(email, password)
      if (err) setError(err)
    } else if (mode === 'signup') {
      if (!nome.trim()) { setError('Nome é obrigatório'); setLoading(false); return }
      if (!departamento) { setError('Departamento é obrigatório'); setLoading(false); return }
      const err = await signUp(email, password, nome, departamento)
      if (err) setError(err)
      else setSuccess('Conta criada. Verifique o seu email para confirmar o registo.')
    } else {
      const err = await resetPassword(email)
      if (err) setError(err)
      else setSuccess('Email de recuperação enviado.')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">INSP</h1>
          <p className="text-sm text-muted-foreground mt-1">Monitor de Investigação</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-center">
            {mode === 'login' ? 'Iniciar Sessão' : mode === 'signup' ? 'Criar Conta' : 'Recuperar Password'}
          </h2>

          {error && <p className="text-sm text-red-400 bg-red-400/10 rounded-lg p-3">{error}</p>}
          {success && <p className="text-sm text-green-400 bg-green-400/10 rounded-lg p-3">{success}</p>}

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="text-sm font-medium">Nome completo</label>
                  <Input value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Dra. Ana Évora" />
                </div>
                <div>
                  <label className="text-sm font-medium">Departamento</label>
                  <Select value={departamento} onChange={e => setDepartamento(e.target.value)}>
                    <option value="">Selecionar...</option>
                    <option value="DIICF">DIICF</option>
                    {departamentos.map(d => <option key={d} value={d}>{d}</option>)}
                  </Select>
                </div>
              </>
            )}
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="nome@insp.gov.cv" required />
            </div>
            {mode !== 'reset' && (
              <div>
                <label className="text-sm font-medium">Password</label>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 caracteres" required minLength={6} />
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'A processar...' : mode === 'login' ? 'Entrar' : mode === 'signup' ? 'Criar Conta' : 'Enviar Email'}
            </Button>
          </form>

          <div className="text-center space-y-1 text-sm">
            {mode === 'login' && (
              <>
                <button onClick={() => { setMode('signup'); setError(null); setSuccess(null) }} className="text-primary hover:underline block w-full">
                  Criar uma conta
                </button>
                <button onClick={() => { setMode('reset'); setError(null); setSuccess(null) }} className="text-muted-foreground hover:underline block w-full">
                  Esqueci a password
                </button>
              </>
            )}
            {mode !== 'login' && (
              <button onClick={() => { setMode('login'); setError(null); setSuccess(null) }} className="text-primary hover:underline block w-full">
                Voltar ao login
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
