import { useMemo } from 'react'
import { useApp } from '@/data/store'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatCurrency, formatCurrencyShort } from '@/lib/utils'

export default function Parcerias() {
  const { projetos } = useApp()

  const parceirosPorVolume = useMemo(() => {
    const map: Record<string, number> = {}
    for (const p of projetos) {
      for (const parceiro of p.parceiros) {
        map[parceiro] = (map[parceiro] || 0) + 1
      }
    }
    return Object.entries(map)
      .map(([name, projetos]) => ({ name, projetos }))
      .sort((a, b) => b.projetos - a.projetos)
  }, [projetos])

  const financiadoresPorVolume = useMemo(() => {
    const map: Record<string, { projetos: number; orcamento: number }> = {}
    for (const p of projetos) {
      if (!map[p.fonteFinanciamento]) map[p.fonteFinanciamento] = { projetos: 0, orcamento: 0 }
      map[p.fonteFinanciamento].projetos++
      map[p.fonteFinanciamento].orcamento += p.orcamento
    }
    return Object.entries(map)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.projetos - a.projetos)
  }, [projetos])

  const tabelaParcerias = useMemo(() => {
    const map: Record<string, { tipo: string; projetos: number; orcamento: number }> = {}

    for (const p of projetos) {
      for (const parceiro of p.parceiros) {
        if (!map[parceiro]) map[parceiro] = { tipo: 'Parceiro', projetos: 0, orcamento: 0 }
        map[parceiro].projetos++
        map[parceiro].orcamento += p.orcamento
      }

      if (!map[p.fonteFinanciamento]) map[p.fonteFinanciamento] = { tipo: 'Financiador', projetos: 0, orcamento: 0 }
      else if (map[p.fonteFinanciamento].tipo === 'Parceiro') map[p.fonteFinanciamento].tipo = 'Ambos'
      if (map[p.fonteFinanciamento].tipo === 'Financiador') {
        map[p.fonteFinanciamento].projetos++
        map[p.fonteFinanciamento].orcamento += p.orcamento
      }
    }

    return Object.entries(map)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.projetos - a.projetos)
  }, [projetos])

  return (
    <div>
      <PageHeader title="Parcerias" breadcrumb="INSP — Parcerias" />

      {projetos.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg">Nenhum parceiro registado</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Parceiros por Volume */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Parceiros por Volume de Projetos</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={Math.max(250, parceirosPorVolume.length * 35)}>
                  <BarChart data={parceirosPorVolume} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis type="number" allowDecimals={false} stroke="#71717a" />
                    <YAxis dataKey="name" type="category" width={180} tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                    <RTooltip contentStyle={{ backgroundColor: '#0c0c10', border: '1px solid #27272a', borderRadius: 8 }} />
                    <Bar dataKey="projetos" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Projetos" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Financiadores */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Financiadores por Volume de Projetos e Orçamento</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={financiadoresPorVolume} margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="name" tick={{ fill: '#a1a1aa', fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={80} />
                    <YAxis yAxisId="left" allowDecimals={false} stroke="#71717a" />
                    <YAxis yAxisId="right" orientation="right" stroke="#71717a" tickFormatter={(v: number) => formatCurrencyShort(v)} />
                    <RTooltip
                      contentStyle={{ backgroundColor: '#0c0c10', border: '1px solid #27272a', borderRadius: 8 }}
                      formatter={(value: number, name: string) =>
                        name === 'orcamento' ? formatCurrency(value) : value
                      }
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="projetos" fill="#3b82f6" name="Nº Projetos" />
                    <Bar yAxisId="right" dataKey="orcamento" fill="#22c55e" name="Orçamento (ECV)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Tabela */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tabela de Parcerias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Parceiro/Financiador</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Tipo</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Nº Projetos</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Orçamento Total (ECV)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tabelaParcerias.map(p => (
                      <tr key={p.name} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 px-4">{p.name}</td>
                        <td className="text-center py-2.5 px-4">
                          <Badge variant={p.tipo === 'Ambos' ? 'default' : 'secondary'}>{p.tipo}</Badge>
                        </td>
                        <td className="text-center py-2.5 px-4">{p.projetos}</td>
                        <td className="text-right py-2.5 px-4">{formatCurrency(p.orcamento)}</td>
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
