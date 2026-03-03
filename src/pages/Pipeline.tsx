import { useState } from 'react'
import { DndContext, DragOverlay, closestCorners, type DragStartEvent, type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useDroppable } from '@dnd-kit/core'
import { useApp } from '@/data/store'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { ProjetoFormModal } from '@/components/projetos/ProjetoFormModal'
import { ProjetoDetailModal } from '@/components/projetos/ProjetoDetailModal'
import { estadosFisicos, estadosFisicosLabels, estadosFisicosColors, eixosANISLabels, pilaresINSPLabels } from '@/data/constants'
import { parsePercent, formatDate } from '@/lib/utils'
import type { Projeto, EstadoFisico } from '@/data/types'
import { Plus, GripVertical } from 'lucide-react'

function KanbanColumn({ estado, projetos, children }: { estado: EstadoFisico; projetos: Projeto[]; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: estado })
  const color = estadosFisicosColors[estado]

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-[260px] max-w-[320px] rounded-xl border border-border bg-card/50 flex flex-col transition-colors ${isOver ? 'border-primary/50 bg-primary/5' : ''}`}
    >
      <div className="p-4 border-b border-border flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
        <h3 className="text-sm font-semibold">{estadosFisicosLabels[estado]}</h3>
        <Badge variant="secondary" className="ml-auto text-xs">{projetos.length}</Badge>
      </div>
      <div className="p-2 flex-1 space-y-2 overflow-y-auto min-h-[200px]">
        <SortableContext items={projetos.map(p => p.id)} strategy={verticalListSortingStrategy}>
          {children}
        </SortableContext>
        {projetos.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8">Nenhum projeto nesta fase</p>
        )}
      </div>
    </div>
  )
}

function ProjectCard({ projeto, onClick }: { projeto: Projeto; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: projeto.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const perc = parsePercent(projeto.percExecFisica)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-3 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        <button {...attributes} {...listeners} className="mt-0.5 cursor-grab" aria-label="Arrastar projeto">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">{projeto.id}</p>
          <p className="text-sm font-medium truncate">{projeto.nome}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            <Badge variant="secondary" className="text-[10px]">{projeto.departamento.split('.')[0].trim()}. {projeto.departamento.split('.')[1]?.trim().substring(0, 15)}</Badge>
            <Badge variant="outline" className="text-[10px]">{(pilaresINSPLabels[projeto.pilarINSP] || '').substring(0, 20)}</Badge>
          </div>
          <div className="mt-2">
            <Progress value={perc} showLabel />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-muted-foreground">{formatDate(projeto.termino)}</span>
            <Badge variant="outline" className="text-[10px]">{(eixosANISLabels[projeto.eixoANIS] || '').substring(0, 18)}</Badge>
          </div>
        </div>
      </div>
    </div>
  )
}

function DragOverlayCard({ projeto }: { projeto: Projeto }) {
  const perc = parsePercent(projeto.percExecFisica)
  return (
    <div className="p-3 rounded-lg border border-primary bg-card shadow-xl w-[280px]">
      <p className="text-xs text-muted-foreground">{projeto.id}</p>
      <p className="text-sm font-medium">{projeto.nome}</p>
      <Progress value={perc} showLabel className="mt-2" />
    </div>
  )
}

export default function Pipeline() {
  const { visibleProjetos, updateProjeto, showToast } = useApp()
  const [formOpen, setFormOpen] = useState(false)
  const [detailProjeto, setDetailProjeto] = useState<Projeto | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{ projeto: Projeto; newEstado: EstadoFisico } | null>(null)
  const [motivo, setMotivo] = useState('')

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const columns = estadosFisicos.map(estado => ({
    estado: estado as EstadoFisico,
    projetos: visibleProjetos.filter(p => p.estadoFisico === estado),
  }))

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null)
    const { active, over } = event
    if (!over) return

    const projetoId = active.id as string
    const projeto = visibleProjetos.find(p => p.id === projetoId)
    if (!projeto) return

    let targetEstado: EstadoFisico | null = null

    if (estadosFisicos.includes(over.id as string)) {
      targetEstado = over.id as EstadoFisico
    } else {
      const targetProjeto = visibleProjetos.find(p => p.id === over.id)
      if (targetProjeto) targetEstado = targetProjeto.estadoFisico
    }

    if (!targetEstado || targetEstado === projeto.estadoFisico) return

    if (targetEstado === 'Concluido' || targetEstado === 'Cancelado' || targetEstado === 'Suspenso') {
      setConfirmDialog({ projeto, newEstado: targetEstado })
      setMotivo('')
    } else {
      updateProjeto(projetoId, { estadoFisico: targetEstado })
      showToast('Estado atualizado', `"${projeto.nome}" movido para ${estadosFisicosLabels[targetEstado]}`)
    }
  }

  function handleConfirm() {
    if (!confirmDialog) return
    if (confirmDialog.newEstado === 'Cancelado' && !motivo.trim()) return

    const updates: Partial<Projeto> = { estadoFisico: confirmDialog.newEstado }
    if (confirmDialog.newEstado === 'Concluido') updates.percExecFisica = '100%'
    if (motivo.trim()) updates.observacoes = motivo

    updateProjeto(confirmDialog.projeto.id, updates)
    showToast('Estado atualizado', `"${confirmDialog.projeto.nome}" movido para ${estadosFisicosLabels[confirmDialog.newEstado]}`)
    setConfirmDialog(null)
    setMotivo('')
  }

  const activeProjeto = activeId ? visibleProjetos.find(p => p.id === activeId) : null

  const dialogTitle = confirmDialog?.newEstado === 'Concluido'
    ? 'Confirmar conclusão do projeto?'
    : confirmDialog?.newEstado === 'Cancelado'
      ? 'Confirmar cancelamento?'
      : 'Confirmar suspensão?'

  const dialogDesc = confirmDialog?.newEstado === 'Concluido'
    ? 'Confirmar que o projeto foi concluído com todos os produtos entregues e validados?'
    : confirmDialog?.newEstado === 'Cancelado'
      ? 'Esta ação marcará o projeto como cancelado. Indique o motivo (obrigatório).'
      : 'Esta ação suspenderá temporariamente o projeto. Indique o motivo (opcional).'

  return (
    <div>
      <PageHeader title="Pipeline de Projetos" breadcrumb="INSP — Pipeline">
        <Button data-new-project onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" /> Novo Projeto
        </Button>
      </PageHeader>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map(({ estado, projetos }) => (
            <KanbanColumn key={estado} estado={estado} projetos={projetos}>
              {projetos.map(p => (
                <ProjectCard key={p.id} projeto={p} onClick={() => setDetailProjeto(p)} />
              ))}
            </KanbanColumn>
          ))}
        </div>
        <DragOverlay>
          {activeProjeto ? <DragOverlayCard projeto={activeProjeto} /> : null}
        </DragOverlay>
      </DndContext>

      <ProjetoFormModal open={formOpen} onOpenChange={setFormOpen} />
      <ProjetoDetailModal open={!!detailProjeto} onOpenChange={v => { if (!v) setDetailProjeto(null) }} projeto={detailProjeto} />

      <Dialog open={!!confirmDialog} onOpenChange={v => { if (!v) setConfirmDialog(null) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogDesc}</DialogDescription>
          </DialogHeader>
          <div className="mt-2">
            <p className="text-sm font-medium mb-2">{confirmDialog?.projeto.id} — {confirmDialog?.projeto.nome}</p>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder={confirmDialog?.newEstado === 'Cancelado' ? 'Motivo do cancelamento (obrigatório)...' : 'Observação (opcional)...'}
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog(null)}>Cancelar</Button>
            <Button
              onClick={handleConfirm}
              disabled={confirmDialog?.newEstado === 'Cancelado' && !motivo.trim()}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
