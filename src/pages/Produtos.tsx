import { useState, useMemo } from 'react'
import { useApp } from '@/data/store'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { tiposProduto, estadosProduto, estadosProdutoColors } from '@/data/constants'
import { formatDate, exportCSV, generateId } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, Legend, ResponsiveContainer } from 'recharts'
import { Search, Download, Plus } from 'lucide-react'
import type { Produto } from '@/data/types'

export default function Produtos() {
  const { produtos, projetos, addProduto, showToast } = useApp()
  const [search, setSearch] = useState('')
  const [filterEstado, setFilterEstado] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ idProjeto: '', tipo: '', nome: '', dataEntrega: '', estado: 'Planeado' })
  const [formErrors, setFormErrors] = useState<string[]>([])

  const produtosEnriquecidos = useMemo(() =>
    produtos.map(p => ({
      ...p,
      projetoNome: projetos.find(pr => pr.id === p.idProjeto)?.nome || '—',
    })),
    [produtos, projetos]
  )

  const filtered = useMemo(() => {
    let result = produtosEnriquecidos
    if (filterEstado) result = result.filter(p => p.estado === filterEstado)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(p =>
        (p.nome || '').toLowerCase().includes(q) ||
        p.projetoNome.toLowerCase().includes(q) ||
        p.idProjeto.toLowerCase().includes(q)
      )
    }
    return result
  }, [produtosEnriquecidos, search, filterEstado])

  const chartData = useMemo(() => {
    return tiposProduto.map(tipo => {
      const row: Record<string, string | number> = { tipo }
      for (const estado of estadosProduto) {
        row[estado] = produtos.filter(p => p.tipo === tipo && p.estado === estado).length
      }
      return row
    }).filter(row => estadosProduto.some(e => (row[e] as number) > 0))
  }, [produtos])

  const counters = useMemo(() => {
    const byType: Record<string, number> = {}
    const byEstado: Record<string, number> = {}
    for (const p of produtos) {
      byType[p.tipo] = (byType[p.tipo] || 0) + 1
      byEstado[p.estado] = (byEstado[p.estado] || 0) + 1
    }
    return { byType, byEstado }
  }, [produtos])

  function handleAddProduto() {
    const errors: string[] = []
    if (!form.idProjeto) errors.push('Selecione um projeto')
    if (!form.tipo) errors.push('Selecione o tipo de produto')
    if (errors.length > 0) {
      setFormErrors(errors)
      return
    }
    setFormErrors([])
    const id = generateId('P', produtos.map(p => p.id))
    const newProduto: Produto = {
      id,
      idProjeto: form.idProjeto,
      tipo: form.tipo,
      nome: form.nome || null,
      dataEntrega: form.dataEntrega || null,
      estado: form.estado,
    }
    addProduto(newProduto)
    showToast('Produto adicionado')
    setForm({ idProjeto: '', tipo: '', nome: '', dataEntrega: '', estado: 'Planeado' })
    setDialogOpen(false)
  }

  function handleExportCSV() {
    const headers = ['ID Projeto', 'Nome Projeto', 'Tipo de Produto', 'Nome do Produto', 'Data de Entrega', 'Estado']
    const rows = filtered.map(p => [
      p.idProjeto, p.projetoNome, p.tipo, p.nome || '—', formatDate(p.dataEntrega), p.estado,
    ])
    const today = new Date().toLocaleDateString('pt-CV').replace(/\//g, '')
    exportCSV(`outputs_insp_export_${today}.csv`, headers, rows)
  }

  return (
    <div>
      <PageHeader title="Produtos / Outputs" breadcrumb="INSP — Produtos">
        <Button variant="outline" onClick={handleExportCSV}>
          <Download className="h-4 w-4" /> Exportar CSV
        </Button>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" /> Novo Produto
        </Button>
      </PageHeader>

      {/* Dialog Novo Produto */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Produto / Output</DialogTitle>
            <DialogDescription>Associe o produto a um projeto existente.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div>
              <Select className={!form.idProjeto && formErrors.length > 0 ? 'border-red-500' : ''} value={form.idProjeto} onChange={e => { setForm(f => ({ ...f, idProjeto: e.target.value })); setFormErrors([]) }}>
                <option value="">Selecionar projeto... *</option>
                {projetos.map(p => <option key={p.id} value={p.id}>{p.id} — {p.nome}</option>)}
              </Select>
            </div>
            <div>
              <Select className={!form.tipo && formErrors.length > 0 ? 'border-red-500' : ''} value={form.tipo} onChange={e => { setForm(f => ({ ...f, tipo: e.target.value })); setFormErrors([]) }}>
                <option value="">Tipo de produto... *</option>
                {tiposProduto.map(t => <option key={t} value={t}>{t}</option>)}
              </Select>
            </div>
            <Input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Nome do produto (opcional)" />
            <Input type="date" value={form.dataEntrega} onChange={e => setForm(f => ({ ...f, dataEntrega: e.target.value }))} />
            <Select value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value }))}>
              {estadosProduto.map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>
          {formErrors.length > 0 && (
            <div className="text-sm text-red-400 space-y-1">
              {formErrors.map(e => <p key={e}>• {e}</p>)}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => { setDialogOpen(false); setFormErrors([]) }}>Cancelar</Button>
            <Button onClick={handleAddProduto}>Adicionar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Counters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant={filterEstado === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterEstado(null)}
        >
          Todos ({produtos.length})
        </Button>
        {estadosProduto.map(e => (
          <Button
            key={e}
            variant={filterEstado === e ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterEstado(filterEstado === e ? null : e)}
            style={filterEstado === e ? { backgroundColor: estadosProdutoColors[e] } : {}}
          >
            {e} ({counters.byEstado[e] || 0})
          </Button>
        ))}
      </div>

      {/* Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Pipeline de Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData} layout="vertical" margin={{ right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
              <XAxis type="number" allowDecimals={false} stroke="#71717a" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
              <YAxis type="category" dataKey="tipo" width={180} tick={{ fill: '#a1a1aa', fontSize: 11 }} />
              <RTooltip contentStyle={{ backgroundColor: '#0c0c10', border: '1px solid #27272a', borderRadius: 8, color: '#f4f4f5' }} itemStyle={{ color: '#f4f4f5' }} />
              <Legend />
              {estadosProduto.map(e => (
                <Bar key={e} dataKey={e} stackId="a" fill={estadosProdutoColors[e]} name={e} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Search + Table */}
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          data-search-input
          className="pl-10 max-w-lg"
          placeholder="Pesquisar por nome do produto ou projeto"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p>Nenhum produto encontrado</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-border rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">ID Projeto</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Nome Projeto</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Tipo de Produto</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Nome do Produto</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Data de Entrega</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-2.5 px-4 font-mono text-xs">{p.idProjeto}</td>
                  <td className="py-2.5 px-4 max-w-[200px] truncate">{p.projetoNome}</td>
                  <td className="py-2.5 px-4 text-xs">{p.tipo}</td>
                  <td className="py-2.5 px-4">{p.nome || '—'}</td>
                  <td className="py-2.5 px-4 text-xs whitespace-nowrap">{formatDate(p.dataEntrega)}</td>
                  <td className="py-2.5 px-4">
                    <Badge style={{ backgroundColor: estadosProdutoColors[p.estado] + '33', color: estadosProdutoColors[p.estado] }}>
                      {p.estado}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
