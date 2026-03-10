import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { useApp } from '@/data/store'
import type { Projeto, Produto } from '@/data/types'
import { estadosFisicosLabels, estadosFisicosColors, eixosANISLabels, pilaresINSPLabels, percExecFisicaOptions, percExecFinanceiraOptions, tiposProduto, estadosProduto } from '@/data/constants'
import { formatCurrency, formatDate, parsePercent, generateId } from '@/lib/utils'
import { CheckCircle2, PauseCircle, FileText } from 'lucide-react'

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  projeto: Projeto | null
}

export function ProjetoDetailModal({ open, onOpenChange, projeto }: Props) {
  const { produtos, updateProjeto, addProduto, showToast } = useApp()
  const [indicadorForm, setIndicadorForm] = useState({ percFisica: '', percFinanceira: '', obs: '' })
  const [produtoForm, setProdutoForm] = useState({ tipo: '', nome: '', dataEntrega: '', estado: 'Planeado' })

  if (!projeto) return null

  const projProdutos = produtos.filter(p => p.idProjeto === projeto.id)
  const percFisica = parsePercent(projeto.percExecFisica)
  const percFinanceira = parsePercent(projeto.percExecFinanceira)

  function handleSaveIndicadores() {
    const updates: Partial<Projeto> = {}
    if (indicadorForm.percFisica) updates.percExecFisica = indicadorForm.percFisica
    if (indicadorForm.percFinanceira) updates.percExecFinanceira = indicadorForm.percFinanceira
    if (indicadorForm.obs) updates.observacoes = indicadorForm.obs
    updateProjeto(projeto!.id, updates)
    showToast('Indicadores actualizados')
    setIndicadorForm({ percFisica: '', percFinanceira: '', obs: '' })
  }

  function handleAddProduto() {
    if (!produtoForm.tipo) return
    const id = generateId('P', produtos.map(p => p.id))
    const newProduto: Produto = {
      id,
      idProjeto: projeto!.id,
      tipo: produtoForm.tipo,
      nome: produtoForm.nome || null,
      dataEntrega: produtoForm.dataEntrega || null,
      estado: produtoForm.estado,
    }
    addProduto(newProduto)
    showToast('Produto adicionado')
    setProdutoForm({ tipo: '', nome: '', dataEntrega: '', estado: 'Planeado' })
  }

  function marcarConcluido() {
    updateProjeto(projeto!.id, { estadoFisico: 'Concluido', percExecFisica: '100%' })
    showToast('Projeto marcado como concluído')
  }

  function marcarSuspenso() {
    updateProjeto(projeto!.id, { estadoFisico: 'Suspenso' })
    showToast('Projeto marcado como suspenso')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle className="flex-1">{projeto.id} — {projeto.nome}</DialogTitle>
            <Badge style={{ backgroundColor: estadosFisicosColors[projeto.estadoFisico] + '33', color: estadosFisicosColors[projeto.estadoFisico] }}>
              {estadosFisicosLabels[projeto.estadoFisico]}
            </Badge>
          </div>
          <DialogDescription>Detalhes do projeto de investigação.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="resumo" className="mt-2">
          <TabsList className="w-full">
            <TabsTrigger value="resumo" className="flex-1">Resumo</TabsTrigger>
            <TabsTrigger value="indicadores" className="flex-1">Indicadores</TabsTrigger>
            <TabsTrigger value="produtos" className="flex-1">Produtos/Outputs</TabsTrigger>
          </TabsList>

          <TabsContent value="resumo" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Departamento</p>
                <p className="text-sm">{projeto.departamento}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Localidade(s)</p>
                {projeto.localidades.length > 0 ? (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {projeto.localidades.map(l => (
                      <span key={l} className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs">{l}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">—</p>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pilar INSP</p>
                <p className="text-sm">{pilaresINSPLabels[projeto.pilarINSP] || projeto.pilarINSP}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Eixo ANIS</p>
                <p className="text-sm">{eixosANISLabels[projeto.eixoANIS] || projeto.eixoANIS}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Investigadores</p>
                <p className="text-sm">{projeto.investigadores.join(', ')}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Duração</p>
                <p className="text-sm">{projeto.duracao}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Início</p>
                <p className="text-sm">{formatDate(projeto.inicio)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Término</p>
                <p className="text-sm">{formatDate(projeto.termino)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Orçamento</p>
                <p className="text-sm">{formatCurrency(projeto.orcamento)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Fonte de Financiamento</p>
                <p className="text-sm">{projeto.fonteFinanciamento}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Execução Física</p>
                <Progress value={percFisica} showLabel />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Execução Financeira</p>
                <Progress value={percFinanceira} showLabel />
              </div>
            </div>

            {projeto.parceiros.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Parceiros</p>
                <div className="flex flex-wrap gap-2">
                  {projeto.parceiros.map(p => <Badge key={p} variant="secondary">{p}</Badge>)}
                </div>
              </div>
            )}

            {projeto.observacoes && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Observações</p>
                <p className="text-sm text-muted-foreground">{projeto.observacoes}</p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              {projeto.estadoFisico !== 'Concluido' && projeto.estadoFisico !== 'Cancelado' && (
                <>
                  <Button size="sm" variant="outline" onClick={marcarConcluido}>
                    <CheckCircle2 className="h-4 w-4 mr-1" /> Marcar como Concluído
                  </Button>
                  <Button size="sm" variant="outline" onClick={marcarSuspenso}>
                    <PauseCircle className="h-4 w-4 mr-1" /> Marcar como Suspenso
                  </Button>
                </>
              )}
              <Button size="sm" variant="outline" onClick={() => showToast('Exportação simulada', 'Ficha do projeto exportada.')}>
                <FileText className="h-4 w-4 mr-1" /> Exportar Ficha
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="indicadores" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Execução Física (%)</label>
                <Select value={indicadorForm.percFisica || projeto.percExecFisica} onChange={e => setIndicadorForm(f => ({ ...f, percFisica: e.target.value }))}>
                  {percExecFisicaOptions.map(p => <option key={p} value={p}>{p}</option>)}
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Execução Financeira</label>
                <Select value={indicadorForm.percFinanceira || projeto.percExecFinanceira} onChange={e => setIndicadorForm(f => ({ ...f, percFinanceira: e.target.value }))}>
                  {percExecFinanceiraOptions.map(p => <option key={p} value={p}>{p}</option>)}
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Observação</label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={indicadorForm.obs}
                onChange={e => setIndicadorForm(f => ({ ...f, obs: e.target.value }))}
                placeholder="Adicionar observação..."
              />
            </div>
            <Button onClick={handleSaveIndicadores}>Salvar Indicadores</Button>
          </TabsContent>

          <TabsContent value="produtos" className="mt-4 space-y-4">
            {projProdutos.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhum produto associado a este projeto.</p>
            ) : (
              <div className="space-y-2">
                {projProdutos.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{p.nome || p.tipo}</p>
                      <p className="text-xs text-muted-foreground">{p.tipo} · {formatDate(p.dataEntrega)}</p>
                    </div>
                    <Badge variant="secondary">{p.estado}</Badge>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-border pt-4">
              <p className="text-sm font-medium mb-3">Adicionar Produto</p>
              <div className="grid grid-cols-2 gap-3">
                <Select value={produtoForm.tipo} onChange={e => setProdutoForm(f => ({ ...f, tipo: e.target.value }))}>
                  <option value="">Tipo de produto...</option>
                  {tiposProduto.map(t => <option key={t} value={t}>{t}</option>)}
                </Select>
                <Input value={produtoForm.nome} onChange={e => setProdutoForm(f => ({ ...f, nome: e.target.value }))} placeholder="Nome (opcional)" />
                <Input type="date" value={produtoForm.dataEntrega} onChange={e => setProdutoForm(f => ({ ...f, dataEntrega: e.target.value }))} />
                <Select value={produtoForm.estado} onChange={e => setProdutoForm(f => ({ ...f, estado: e.target.value }))}>
                  {estadosProduto.map(s => <option key={s} value={s}>{s}</option>)}
                </Select>
              </div>
              <Button size="sm" className="mt-3" onClick={handleAddProduto} disabled={!produtoForm.tipo}>Adicionar Produto</Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
