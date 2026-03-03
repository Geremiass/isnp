import { useMemo } from 'react'
import { useApp, useKPIs } from '@/data/store'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { eixosANISLabels, pilaresINSPLabels, estadosFisicosLabels, estadosFisicosColors } from '@/data/constants'
import { formatCurrencyShort, formatCurrency, parsePercent } from '@/lib/utils'
import { FlaskConical, TrendingUp, CheckCircle2, Wallet } from 'lucide-react'
import type { Periodo } from '@/data/types'

const COLORS_PIE = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#f97316', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16', '#64748b', '#14b8a6', '#a855f7', '#f43f5e', '#0ea5e9', '#d946ef', '#fb923c']

export default function Dashboard() {
  const { filteredProjetos, ui, setPeriodo } = useApp()
  const kpis = useKPIs()

  const projetosPorEixo = useMemo(() => {
    const map: Record<string, number> = {}
    for (const p of filteredProjetos) {
      const label = eixosANISLabels[p.eixoANIS] || p.eixoANIS
      map[label] = (map[label] || 0) + 1
    }
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  }, [filteredProjetos])

  const projetosPorPilar = useMemo(() => {
    const data: Record<string, Record<string, number>> = {}
    for (const p of filteredProjetos) {
      const pilar = pilaresINSPLabels[p.pilarINSP] || p.pilarINSP
      if (!data[pilar]) data[pilar] = {}
      const estado = estadosFisicosLabels[p.estadoFisico] || p.estadoFisico
      data[pilar][estado] = (data[pilar][estado] || 0) + 1
    }
    return Object.entries(data).map(([pilar, estados]) => ({ pilar, ...estados }))
  }, [filteredProjetos])

  const execFinanceira = useMemo(() =>
    filteredProjetos.map(p => ({
      name: p.id,
      fullName: p.nome,
      executada: parsePercent(p.percExecFinanceira),
      restante: 100 - parsePercent(p.percExecFinanceira),
      orcamento: p.orcamento,
      fonte: p.fonteFinanciamento,
    })),
    [filteredProjetos]
  )

  const orcamentoPorFonte = useMemo(() => {
    const map: Record<string, number> = {}
    for (const p of filteredProjetos) {
      map[p.fonteFinanciamento] = (map[p.fonteFinanciamento] || 0) + p.orcamento
    }
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  }, [filteredProjetos])

  const perfDepartamento = useMemo(() => {
    const map: Record<string, { total: number; andamento: number; concluidos: number; execSum: number; orcamento: number }> = {}
    for (const p of filteredProjetos) {
      if (!map[p.departamento]) map[p.departamento] = { total: 0, andamento: 0, concluidos: 0, execSum: 0, orcamento: 0 }
      const d = map[p.departamento]
      d.total++
      if (p.estadoFisico === 'Em_andamento') { d.andamento++; d.execSum += parsePercent(p.percExecFisica) }
      if (p.estadoFisico === 'Concluido') d.concluidos++
      d.orcamento += p.orcamento
    }
    return Object.entries(map)
      .map(([dept, d]) => ({
        departamento: dept,
        total: d.total,
        andamento: d.andamento,
        concluidos: d.concluidos,
        taxaExec: d.andamento > 0 ? Math.round(d.execSum / d.andamento) : d.concluidos > 0 ? 100 : 0,
        orcamento: d.orcamento,
      }))
      .sort((a, b) => b.total - a.total)
  }, [filteredProjetos])

  const estadoKeys = Object.values(estadosFisicosLabels)

  return (
    <div>
      <PageHeader title="Dashboard" breadcrumb="INSP — Monitor de Investigação">
        <Select value={ui.periodo} onChange={e => setPeriodo(e.target.value as Periodo)} className="w-48">
          <option value="ano_atual">Ano Atual</option>
          <option value="2anos">Últimos 2 Anos</option>
          <option value="total">Total</option>
        </Select>
      </PageHeader>

      {filteredProjetos.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg">Sem dados no período seleccionado</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total de Projetos</CardTitle>
                      <FlaskConical className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{kpis.total}</p>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>Quantidade de projetos registados no período</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Execução Física</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{kpis.taxaExecMedia}%</p>
                      <Progress value={kpis.taxaExecMedia} className="mt-2" />
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>Média das percentagens de execução física dos projetos ativos</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Projetos Concluídos</CardTitle>
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{kpis.concluidos}</p>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>Projetos com estado de execução "Concluído"</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Orçamento Total</CardTitle>
                      <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{formatCurrencyShort(kpis.orcamentoTotal)}</p>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>Soma dos orçamentos: {formatCurrency(kpis.orcamentoTotal)}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Linha 2 — ANIS + INSP */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Projetos por Eixo da ANIS</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={projetosPorEixo} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis type="number" allowDecimals={false} stroke="#71717a" />
                    <YAxis dataKey="name" type="category" width={200} tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                    <RTooltip contentStyle={{ backgroundColor: '#0c0c10', border: '1px solid #27272a', borderRadius: 8 }} />
                    <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Projetos" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Projetos por Pilar Estratégico INSP</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={projetosPorPilar} margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="pilar" tick={{ fill: '#a1a1aa', fontSize: 11 }} interval={0} tickFormatter={(v: string) => v.split(':')[0]} />
                    <YAxis allowDecimals={false} stroke="#71717a" />
                    <RTooltip contentStyle={{ backgroundColor: '#0c0c10', border: '1px solid #27272a', borderRadius: 8 }} />
                    <Legend />
                    {estadoKeys.map((key, i) => (
                      <Bar key={key} dataKey={key} stackId="a" fill={Object.values(estadosFisicosColors)[i]} name={key} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Linha 3 — Termómetro Financeiro */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Execução Financeira por Projeto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {execFinanceira.map(p => (
                    <TooltipProvider key={p.name}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-xs font-medium">{p.name}</span>
                              <span className="text-xs text-muted-foreground">{p.executada}%</span>
                            </div>
                            <Progress value={p.executada} />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{p.fullName}</p>
                          <p>Orçamento: {formatCurrency(p.orcamento)}</p>
                          <p>Executado: {p.executada}% · Fonte: {p.fonte}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Orçamento por Fonte de Financiamento</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={orcamentoPorFonte}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                    >
                      {orcamentoPorFonte.map((_, i) => (
                        <Cell key={i} fill={COLORS_PIE[i % COLORS_PIE.length]} />
                      ))}
                    </Pie>
                    <RTooltip
                      contentStyle={{ backgroundColor: '#0c0c10', border: '1px solid #27272a', borderRadius: 8 }}
                      formatter={(value: number | undefined) => formatCurrency(value ?? 0)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Linha 4 — Performance por Departamento */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Performance por Departamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Departamento</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Nº Projetos</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Em Andamento</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Concluídos</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Taxa Exec. Física</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Orçamento (ECV)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {perfDepartamento.map(d => (
                      <tr key={d.departamento} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4">{d.departamento}</td>
                        <td className="text-center py-3 px-4">
                          <Badge variant="secondary">{d.total}</Badge>
                        </td>
                        <td className="text-center py-3 px-4">{d.andamento}</td>
                        <td className="text-center py-3 px-4">{d.concluidos}</td>
                        <td className="py-3 px-4">
                          <Progress value={d.taxaExec} showLabel />
                        </td>
                        <td className="text-right py-3 px-4">{formatCurrency(d.orcamento)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
