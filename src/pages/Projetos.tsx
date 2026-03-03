import { useState, useMemo, useCallback } from 'react'
import { useApp } from '@/data/store'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { ProjetoFormModal } from '@/components/projetos/ProjetoFormModal'
import { ProjetoDetailModal } from '@/components/projetos/ProjetoDetailModal'
import { estadosFisicosLabels, estadosFisicosColors, eixosANISLabels, pilaresINSPLabels } from '@/data/constants'
import { formatCurrency, formatDate, parsePercent, exportCSV } from '@/lib/utils'
import type { Projeto } from '@/data/types'
import { Plus, Download, Search, Eye, Pencil, Trash2, ArrowUpDown } from 'lucide-react'

type SortKey = 'id' | 'nome' | 'departamento' | 'pilarINSP' | 'eixoANIS' | 'investigadores' | 'estadoFisico' | 'percExecFisica' | 'percExecFinanceira' | 'orcamento' | 'inicio' | 'termino'

export default function Projetos() {
  const { visibleProjetos, deleteProjeto, showToast, ui } = useApp()
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('id')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(0)
  const [formOpen, setFormOpen] = useState(false)
  const [editProjeto, setEditProjeto] = useState<Projeto | null>(null)
  const [detailProjeto, setDetailProjeto] = useState<Projeto | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Projeto | null>(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return visibleProjetos.filter(p =>
      p.id.toLowerCase().includes(q) ||
      p.nome.toLowerCase().includes(q) ||
      p.departamento.toLowerCase().includes(q) ||
      p.investigadores.some(i => i.toLowerCase().includes(q))
    )
  }, [visibleProjetos, search])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let va: string | number = ''
      let vb: string | number = ''
      switch (sortKey) {
        case 'percExecFisica': va = parsePercent(a.percExecFisica); vb = parsePercent(b.percExecFisica); break
        case 'percExecFinanceira': va = parsePercent(a.percExecFinanceira); vb = parsePercent(b.percExecFinanceira); break
        case 'orcamento': va = a.orcamento; vb = b.orcamento; break
        case 'investigadores': va = a.investigadores.join(', '); vb = b.investigadores.join(', '); break
        default: va = String(a[sortKey]); vb = String(b[sortKey]); break
      }
      if (typeof va === 'number' && typeof vb === 'number') {
        return sortDir === 'asc' ? va - vb : vb - va
      }
      return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va))
    })
  }, [filtered, sortKey, sortDir])

  const pageSize = ui.tabelaDensa ? 30 : 25
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize)
  const totalPages = Math.ceil(sorted.length / pageSize)

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
    setPage(0)
  }

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setPage(0)
  }, [])

  function handleDelete() {
    if (!deleteConfirm) return
    deleteProjeto(deleteConfirm.id)
    showToast('Projeto removido', `"${deleteConfirm.nome}" foi eliminado.`)
    setDeleteConfirm(null)
  }

  function handleExportCSV() {
    const headers = ['ID', 'Nome', 'Departamento', 'Pilar INSP', 'Eixo ANIS', 'Investigadores', 'Estado', 'Exec. Física', 'Exec. Financeira', 'Orçamento (ECV)', 'Início', 'Término']
    const rows = sorted.map(p => [
      p.id, p.nome, p.departamento,
      pilaresINSPLabels[p.pilarINSP] || p.pilarINSP,
      eixosANISLabels[p.eixoANIS] || p.eixoANIS,
      p.investigadores.join('; '),
      estadosFisicosLabels[p.estadoFisico],
      p.percExecFisica, p.percExecFinanceira,
      String(p.orcamento), formatDate(p.inicio), formatDate(p.termino),
    ])
    const today = new Date().toLocaleDateString('pt-CV').replace(/\//g, '')
    exportCSV(`projetos_insp_export_${today}.csv`, headers, rows)
    showToast('CSV exportado', `${sorted.length} projetos exportados.`)
  }

  function SortHeader({ label, field }: { label: string; field: SortKey }) {
    return (
      <th className="py-3 px-3 font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground" onClick={() => handleSort(field)}>
        <div className="flex items-center gap-1">
          {label}
          <ArrowUpDown className="h-3 w-3" />
        </div>
      </th>
    )
  }

  return (
    <div>
      <PageHeader title="Projetos de Investigação" breadcrumb="INSP — Projetos">
        <Button data-new-project onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" /> Novo Projeto
        </Button>
        <Button variant="outline" onClick={handleExportCSV}>
          <Download className="h-4 w-4" /> Exportar CSV
        </Button>
      </PageHeader>

      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          data-search-input
          className="pl-10 max-w-lg"
          placeholder="Pesquisar por ID, nome do projeto, departamento ou investigador"
          value={search}
          onChange={handleSearch}
        />
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg">Nenhum projeto corresponde à sua pesquisa</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto border border-border rounded-xl">
            <table className={`w-full text-sm ${ui.tabelaDensa ? 'text-xs' : ''}`}>
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <SortHeader label="ID" field="id" />
                  <SortHeader label="Nome" field="nome" />
                  <SortHeader label="Departamento" field="departamento" />
                  <SortHeader label="Estado" field="estadoFisico" />
                  <SortHeader label="Exec. Física" field="percExecFisica" />
                  <SortHeader label="Orçamento" field="orcamento" />
                  <th className="py-3 px-3 font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {paged.map(p => (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-xs">{p.id}</td>
                    <td className="py-2.5 px-3 max-w-[260px] truncate">{p.nome}</td>
                    <td className="py-2.5 px-3 text-xs">{p.departamento}</td>
                    <td className="py-2.5 px-3">
                      <Badge style={{ backgroundColor: estadosFisicosColors[p.estadoFisico] + '33', color: estadosFisicosColors[p.estadoFisico] }} className="text-[10px]">
                        {estadosFisicosLabels[p.estadoFisico]}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 w-32">
                      <Progress value={parsePercent(p.percExecFisica)} showLabel />
                    </td>
                    <td className="py-2.5 px-3 text-right text-xs whitespace-nowrap">{formatCurrency(p.orcamento)}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex gap-1">
                        <button onClick={() => setDetailProjeto(p)} className="p-1.5 rounded hover:bg-accent" aria-label="Ver detalhes"><Eye className="h-3.5 w-3.5" /></button>
                        <button onClick={() => setEditProjeto(p)} className="p-1.5 rounded hover:bg-accent" aria-label="Editar"><Pencil className="h-3.5 w-3.5" /></button>
                        <button onClick={() => setDeleteConfirm(p)} className="p-1.5 rounded hover:bg-accent text-red-400" aria-label="Eliminar"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">{sorted.length} projetos · Página {page + 1} de {totalPages}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Anterior</Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Próxima</Button>
              </div>
            </div>
          )}
        </>
      )}

      <ProjetoFormModal open={formOpen || !!editProjeto} onOpenChange={v => { if (!v) { setFormOpen(false); setEditProjeto(null) } }} projeto={editProjeto} />
      <ProjetoDetailModal open={!!detailProjeto} onOpenChange={v => { if (!v) setDetailProjeto(null) }} projeto={detailProjeto} />

      <Dialog open={!!deleteConfirm} onOpenChange={v => { if (!v) setDeleteConfirm(null) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar Projeto</DialogTitle>
            <DialogDescription>Tem a certeza que deseja eliminar este projeto? Esta acção não poderá ser desfeita.</DialogDescription>
          </DialogHeader>
          <p className="text-sm">{deleteConfirm?.id} — {deleteConfirm?.nome}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
