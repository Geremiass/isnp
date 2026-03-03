import { useState, useMemo } from 'react'
import { useApp } from '@/data/store'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { tiposProduto, estadosProduto, estadosProdutoColors } from '@/data/constants'
import { formatDate, exportCSV } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, Legend, ResponsiveContainer } from 'recharts'
import { Search, Download } from 'lucide-react'

export default function Produtos() {
  const { produtos, projetos } = useApp()
  const [search, setSearch] = useState('')
  const [filterEstado, setFilterEstado] = useState<string | null>(null)

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
      </PageHeader>

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
            <BarChart data={chartData} margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="tipo" tick={{ fill: '#a1a1aa', fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={100} />
              <YAxis allowDecimals={false} stroke="#71717a" />
              <RTooltip contentStyle={{ backgroundColor: '#0c0c10', border: '1px solid #27272a', borderRadius: 8 }} />
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
