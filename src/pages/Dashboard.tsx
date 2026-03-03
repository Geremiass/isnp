import { useMemo } from 'react'
import { useApp, useKPIs } from '@/data/store'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { eixosANISLabels, pilaresINSPLabels, estadosFisicosLabels, estadosFisicosColors } from '@/data/constants'
import { formatCurrencyShort, formatCurrency, parsePercent } from '@/lib/utils'
import { FlaskConical, TrendingUp, CheckCircle2, Wallet, Info } from 'lucide-react'
import type { Periodo } from '@/data/types'

const COLORS_PIE = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#f97316', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16', '#64748b', '#14b8a6', '#a855f7', '#f43f5e', '#0ea5e9', '#d946ef', '#fb923c']

const KPI_CONFIG = [
  { key: 'total', label: 'TOTAL DE PROJETOS', icon: FlaskConical, color: '#3b82f6', tooltip: 'Quantidade de projetos registados no período' },
  { key: 'taxaExec', label: 'TAXA EXECUÇÃO FÍSICA', icon: TrendingUp, color: '#22c55e', tooltip: 'Média das percentagens de execução física dos projetos ativos' },
  { key: 'concluidos', label: 'PROJETOS CONCLUÍDOS', icon: CheckCircle2, color: '#eab308', tooltip: 'Projetos com estado de execução "Concluído"' },
  { key: 'orcamento', label: 'ORÇAMENTO TOTAL', icon: Wallet, color: '#8b5cf6', tooltip: 'Soma dos orçamentos de todos os projetos' },
] as const

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

  const totalOrcamento = useMemo(() => orcamentoPorFonte.reduce((sum, f) => sum + f.value, 0), [orcamentoPorFonte])

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

  function getKPIValue(key: string) {
    switch (key) {
      case 'total': return String(kpis.total)
      case 'taxaExec': return `${kpis.taxaExecMedia}%`
      case 'concluidos': return String(kpis.concluidos)
      case 'orcamento': return formatCurrencyShort(kpis.orcamentoTotal)
      default: return '—'
    }
  }

  return (
    <div>
      <PageHeader title="Dashboard" breadcrumb="INSP — Painel de saúde da agenda de investigação">
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
              {KPI_CONFIG.map(kpi => (
                <Tooltip key={kpi.key}>
                  <TooltipTrigger asChild>
                    <Card className="relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" style={{ backgroundColor: kpi.color }} />
                      <CardHeader className="flex flex-row items-start justify-between pb-2 pl-5">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg p-2" style={{ backgroundColor: kpi.color + '1a' }}>
                            <kpi.icon className="h-5 w-5" style={{ color: kpi.color }} />
                          </div>
                          <span className="text-[11px] font-semibold tracking-wider text-muted-foreground">{kpi.label}</span>
                        </div>
                        <Info className="h-3.5 w-3.5 text-muted-foreground/50" />
                      </CardHeader>
                      <CardContent className="pl-5">
                        <p className="text-3xl font-bold">{getKPIValue(kpi.key)}</p>
                        {kpi.key === 'taxaExec' && <Progress value={kpis.taxaExecMedia} className="mt-2" />}
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent>{kpi.tooltip}</TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
          </div>

          {/* Linha 2 — ANIS + INSP */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Projetos por Eixo da ANIS</CardTitle>
                <CardDescription>Distribuição da investigação por áreas prioritárias</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={450}>
                  <BarChart data={projetosPorEixo} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} stroke="#71717a" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" width={200} tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                    <RTooltip contentStyle={{ backgroundColor: '#0c0c10', border: '1px solid #27272a', borderRadius: 8, color: '#f4f4f5' }} />
                    <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Projetos" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Projetos por Pilar Estratégico INSP</CardTitle>
                <CardDescription>Distribuição por estado de execução em cada pilar</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={450}>
                  <BarChart data={projetosPorPilar} margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="pilar" tick={{ fill: '#a1a1aa', fontSize: 11 }} interval={0} tickFormatter={(v: string) => v.split(':')[0]} />
                    <YAxis allowDecimals={false} stroke="#71717a" />
                    <RTooltip contentStyle={{ backgroundColor: '#0c0c10', border: '1px solid #27272a', borderRadius: 8, color: '#f4f4f5' }} />
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
                <CardDescription>Termómetro de execução orçamental</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {execFinanceira.map(p => (
                    <div key={p.name} className="space-y-1.5">
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm font-medium truncate mr-3">
                          {p.name} — <span className="text-muted-foreground font-normal">{p.fullName}</span>
                        </span>
                        <span className="text-sm font-semibold shrink-0">{p.executada}%</span>
                      </div>
                      <Progress value={p.executada} />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{p.fonte}</span>
                        <span>{formatCurrency(p.orcamento)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Orçamento por Fonte de Financiamento</CardTitle>
                <CardDescription>Distribuição dos recursos financeiros</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width="55%" height={300}>
                    <PieChart>
                      <Pie
                        data={orcamentoPorFonte}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={120}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {orcamentoPorFonte.map((_, i) => (
                          <Cell key={i} fill={COLORS_PIE[i % COLORS_PIE.length]} />
                        ))}
                      </Pie>
                      <RTooltip
                        contentStyle={{ backgroundColor: '#0c0c10', border: '1px solid #27272a', borderRadius: 8, color: '#f4f4f5' }}
                        formatter={(value: number | undefined) => formatCurrency(value ?? 0)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-3">
                    {orcamentoPorFonte.map((f, i) => {
                      const pct = totalOrcamento > 0 ? Math.round((f.value / totalOrcamento) * 100) : 0
                      return (
                        <div key={f.name} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS_PIE[i % COLORS_PIE.length] }} />
                            <span className="text-sm truncate">{f.name}</span>
                          </div>
                          <div className="flex justify-between pl-[18px] text-xs text-muted-foreground">
                            <span>{formatCurrency(f.value)}</span>
                            <span>{pct}%</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Linha 4 — Performance por Departamento */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Performance por Departamento</CardTitle>
              <CardDescription>Métricas agregadas por unidade organizacional</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground w-8">#</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Departamento</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">N.º Projetos</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Em Andamento</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Concluídos</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Taxa Exec. Física</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Orçamento (ECV)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {perfDepartamento.map((d, i) => (
                      <tr key={d.departamento} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4 text-muted-foreground">{i + 1}</td>
                        <td className="py-3 px-4 font-medium">{d.departamento}</td>
                        <td className="text-center py-3 px-4">
                          <Badge variant="secondary">{d.total}</Badge>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className="text-blue-400 font-semibold">{d.andamento}</span>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className="text-emerald-400 font-semibold">{d.concluidos}</span>
                        </td>
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
