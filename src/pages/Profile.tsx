import { useApp } from '@/data/store'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select } from '@/components/ui/select'
import { mockUsers } from '@/data/mock'
import { UserCircle } from 'lucide-react'

export default function Profile() {
  const { currentUser, setCurrentUser, ui, setAnimacoes, setTabelaDensa } = useApp()

  return (
    <div>
      <PageHeader title="Meu Perfil" breadcrumb="INSP — Perfil" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
        {/* User Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <UserCircle className="h-10 w-10 text-primary" />
              </div>
              <div>
                <p className="text-lg font-semibold">{currentUser.nome}</p>
                <p className="text-sm text-muted-foreground">{currentUser.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-xs text-muted-foreground">Papel</p>
                <Badge className="capitalize mt-1">{currentUser.papel}</Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Departamento</p>
                <p className="text-sm mt-1">{currentUser.departamento}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preferências Locais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Animações</p>
                <p className="text-xs text-muted-foreground">Activar/desactivar animações da interface</p>
              </div>
              <Switch checked={ui.animacoes} onCheckedChange={setAnimacoes} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Tabela compacta</p>
                <p className="text-xs text-muted-foreground">Aumentar a densidade das tabelas</p>
              </div>
              <Switch checked={ui.tabelaDensa} onCheckedChange={setTabelaDensa} />
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-sm font-medium mb-2">Simular troca de papel (modo mock)</p>
              <p className="text-xs text-muted-foreground mb-3">
                Selecione um utilizador para simular as permissões do seu papel.
              </p>
              <Select
                value={currentUser.id}
                onChange={e => {
                  const user = mockUsers.find(u => u.id === e.target.value)
                  if (user) setCurrentUser(user)
                }}
              >
                {mockUsers.map(u => (
                  <option key={u.id} value={u.id}>{u.nome} — {u.papel}</option>
                ))}
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
