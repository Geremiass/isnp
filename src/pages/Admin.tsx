import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useApp } from '@/data/store'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { departamentos, papeis } from '@/data/constants'
import type { Utilizador, Papel } from '@/data/types'
import { Plus, Pencil, Trash2 } from 'lucide-react'

export default function Admin() {
  const { currentUser, users, addUser, updateUser, deleteUser, showToast } = useApp()
  const [formOpen, setFormOpen] = useState(false)
  const [editUser, setEditUser] = useState<Utilizador | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Utilizador | null>(null)
  const [form, setForm] = useState({ nome: '', email: '', papel: 'investigador' as Papel, departamento: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (currentUser.papel !== 'admin') return <Navigate to="/dashboard" replace />

  function openCreate() {
    setForm({ nome: '', email: '', papel: 'investigador', departamento: '' })
    setErrors({})
    setEditUser(null)
    setFormOpen(true)
  }

  function openEdit(u: Utilizador) {
    setForm({ nome: u.nome, email: u.email, papel: u.papel, departamento: u.departamento })
    setErrors({})
    setEditUser(u)
    setFormOpen(true)
  }

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!form.nome.trim()) e.nome = 'Obrigatório'
    if (!form.email.trim()) e.email = 'Obrigatório'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email inválido'
    if (!form.papel) e.papel = 'Obrigatório'
    if (!form.departamento) e.departamento = 'Obrigatório'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSave() {
    if (!validate()) return
    if (editUser) {
      updateUser(editUser.id, form)
      showToast('Utilizador actualizado', `"${form.nome}" foi actualizado.`)
    } else {
      const id = 'u' + Date.now()
      addUser({ id, ...form })
      showToast('Utilizador criado', `"${form.nome}" foi adicionado ao sistema.`)
    }
    setFormOpen(false)
  }

  function handleDelete() {
    if (!deleteConfirm) return
    deleteUser(deleteConfirm.id)
    showToast('Utilizador removido', `"${deleteConfirm.nome}" foi eliminado.`)
    setDeleteConfirm(null)
  }

  return (
    <div>
      <PageHeader title="Admin — Gestão de Utilizadores" breadcrumb="INSP — Admin">
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Criar Utilizador
        </Button>
      </PageHeader>

      <div className="overflow-x-auto border border-border rounded-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Nome</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Email</th>
              <th className="text-center py-3 px-4 font-medium text-muted-foreground">Papel</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Departamento</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <td className="py-2.5 px-4 font-medium">{u.nome}</td>
                <td className="py-2.5 px-4 text-muted-foreground">{u.email}</td>
                <td className="text-center py-2.5 px-4">
                  <Badge variant={u.papel === 'admin' ? 'default' : 'secondary'} className="capitalize">{u.papel}</Badge>
                </td>
                <td className="py-2.5 px-4 text-xs">{u.departamento}</td>
                <td className="py-2.5 px-4">
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(u)} className="p-1.5 rounded hover:bg-accent" aria-label="Editar utilizador"><Pencil className="h-3.5 w-3.5" /></button>
                    <button onClick={() => setDeleteConfirm(u)} className="p-1.5 rounded hover:bg-accent text-red-400" aria-label="Eliminar utilizador"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editUser ? 'Editar Utilizador' : 'Criar Utilizador'}</DialogTitle>
            <DialogDescription>{editUser ? 'Actualizar dados do utilizador.' : 'Preencha os dados do novo utilizador.'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-sm font-medium">Nome *</label>
              <Input className={errors.nome ? 'border-red-500' : ''} value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
              {errors.nome && <p className="text-xs text-red-400 mt-1">{errors.nome}</p>}
            </div>
            <div>
              <label className="text-sm font-medium">Email *</label>
              <Input type="email" className={errors.email ? 'border-red-500' : ''} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="text-sm font-medium">Papel *</label>
              <Select className={errors.papel ? 'border-red-500' : ''} value={form.papel} onChange={e => setForm(f => ({ ...f, papel: e.target.value as Papel }))}>
                {papeis.map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
              </Select>
              {errors.papel && <p className="text-xs text-red-400 mt-1">{errors.papel}</p>}
            </div>
            <div>
              <label className="text-sm font-medium">Departamento *</label>
              <Select className={errors.departamento ? 'border-red-500' : ''} value={form.departamento} onChange={e => setForm(f => ({ ...f, departamento: e.target.value }))}>
                <option value="">Selecionar...</option>
                <option value="DIICF">DIICF</option>
                {departamentos.map(d => <option key={d} value={d}>{d}</option>)}
              </Select>
              {errors.departamento && <p className="text-xs text-red-400 mt-1">{errors.departamento}</p>}
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteConfirm} onOpenChange={v => { if (!v) setDeleteConfirm(null) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar Utilizador</DialogTitle>
            <DialogDescription>Tem a certeza que deseja eliminar este utilizador?</DialogDescription>
          </DialogHeader>
          <p className="text-sm">{deleteConfirm?.nome} ({deleteConfirm?.email})</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
