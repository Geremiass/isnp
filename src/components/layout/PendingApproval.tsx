import { useAuth } from '@/data/auth'
import { Button } from '@/components/ui/button'
import { ShieldAlert } from 'lucide-react'

export function PendingApprovalOverlay() {
  const { signOut, profile } = useAuth()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="rounded-xl border border-border bg-card p-8 space-y-5">
          <div className="mx-auto h-16 w-16 rounded-full bg-yellow-500/10 flex items-center justify-center">
            <ShieldAlert className="h-8 w-8 text-yellow-500" />
          </div>
          <h2 className="text-xl font-bold">Conta Pendente de Aprovação</h2>
          <p className="text-sm text-muted-foreground">
            A sua conta ({profile?.email}) foi criada com sucesso, mas ainda não foi activada por um administrador.
          </p>
          <p className="text-sm text-muted-foreground">
            Contacte o <strong>DIICF</strong> (Departamento de Investigação, Inovação, Ciência e Formação) para que um administrador atribua o seu papel e departamento.
          </p>
          <Button variant="outline" onClick={signOut} className="w-full">
            Terminar Sessão
          </Button>
        </div>
      </div>
    </div>
  )
}
