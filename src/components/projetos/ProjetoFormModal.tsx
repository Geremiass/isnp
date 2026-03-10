import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useApp } from '@/data/store'
import type { Projeto } from '@/data/types'
import {
  departamentos, pilaresINSP, pilaresINSPLabels, linhasINSPPorPilar,
  eixosANIS, eixosANISLabels, linhasANISPorEixo,
  duracoes, fontesFinanciamento, parceirosConhecidos,
  estadosFisicos, estadosFisicosLabels, percExecFisicaOptions, percExecFinanceiraOptions,
  localidadesCaboVerde,
} from '@/data/constants'
import { generateId } from '@/lib/utils'

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  projeto?: Projeto | null
}

function emptyProjeto(): Omit<Projeto, 'id'> {
  return {
    nome: '', departamento: '', pilarINSP: '', linhaINSP: '', eixoANIS: '', linhaANIS: '',
    investigadores: [], localidades: [], duracao: '', inicio: '', termino: '',
    parceiros: [], orcamento: 0, fonteFinanciamento: '',
    estadoFisico: 'Não_Iniciado', percExecFisica: '0%', percExecFinanceira: '0% (Sem Verba Disponível)',
    observacoes: '',
  }
}

export function ProjetoFormModal({ open, onOpenChange, projeto }: Props) {
  const { projetos, addProjeto, updateProjeto, showToast, currentUser } = useApp()
  const isEdit = !!projeto
  const [form, setForm] = useState<Omit<Projeto, 'id'>>(emptyProjeto())
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [investigadorInput, setInvestigadorInput] = useState('')

  useEffect(() => {
    if (open) {
      if (projeto) {
        const { id: _id, ...rest } = projeto
        setForm(rest)
      } else {
        const initial = emptyProjeto()
        if (currentUser.papel === 'investigador') {
          initial.departamento = currentUser.departamento
        }
        setForm(initial)
      }
      setErrors({})
      setInvestigadorInput('')
    }
  }, [open, projeto, currentUser])

  function setField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm(f => ({ ...f, [key]: value }))
    if (errors[key]) setErrors(e => { const next = { ...e }; delete next[key]; return next })
  }

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!form.nome.trim()) e.nome = 'Obrigatório'
    if (!form.departamento) e.departamento = 'Obrigatório'
    if (!form.pilarINSP) e.pilarINSP = 'Obrigatório'
    if (!form.linhaINSP) e.linhaINSP = 'Obrigatório'
    if (!form.eixoANIS) e.eixoANIS = 'Obrigatório'
    if (!form.linhaANIS) e.linhaANIS = 'Obrigatório'
    if (form.investigadores.length === 0) e.investigadores = 'Obrigatório'
    if (!form.duracao) e.duracao = 'Obrigatório'
    if (!form.inicio) e.inicio = 'Obrigatório'
    if (!form.termino) e.termino = 'Obrigatório'
    if (form.inicio && form.termino && form.termino < form.inicio) e.termino = 'Deve ser após a data de início'
    if (!form.fonteFinanciamento) e.fonteFinanciamento = 'Obrigatório'
    if (form.orcamento < 0) e.orcamento = 'Deve ser positivo'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSave() {
    if (!validate()) return
    if (isEdit && projeto) {
      updateProjeto(projeto.id, form)
      showToast('Projeto actualizado', `"${form.nome}" foi actualizado com sucesso.`)
    } else {
      const id = generateId('ID', projetos.map(p => p.id))
      addProjeto({ id, ...form })
      showToast('Projeto registado com sucesso', `"${form.nome}" foi adicionado ao sistema.`)
    }
    onOpenChange(false)
  }

  function addInvestigador() {
    const name = investigadorInput.trim()
    if (name && !form.investigadores.includes(name)) {
      setField('investigadores', [...form.investigadores, name])
    }
    setInvestigadorInput('')
  }

  const linhasINSP = form.pilarINSP ? (linhasINSPPorPilar[form.pilarINSP] || []) : []
  const linhasANIS = form.eixoANIS ? (linhasANISPorEixo[form.eixoANIS] || []) : []

  function fieldClass(key: string) {
    return errors[key] ? 'border-red-500' : ''
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Projeto' : 'Novo Projeto'}</DialogTitle>
          <DialogDescription>{isEdit ? 'Actualizar dados do projeto.' : 'Preencha os dados para registar um novo projeto.'}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="geral" className="mt-2">
          <TabsList className="w-full">
            <TabsTrigger value="geral" className="flex-1">Dados Gerais</TabsTrigger>
            <TabsTrigger value="execucao" className="flex-1">Execução</TabsTrigger>
            <TabsTrigger value="parceiros" className="flex-1">Parceiros</TabsTrigger>
          </TabsList>

          <TabsContent value="geral" className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium">Nome do Projeto *</label>
              <Input className={fieldClass('nome')} value={form.nome} onChange={e => setField('nome', e.target.value)} />
              {errors.nome && <p className="text-xs text-red-400 mt-1">{errors.nome}</p>}
            </div>
            <div>
              <label className="text-sm font-medium">Departamento *</label>
              <Select className={fieldClass('departamento')} value={form.departamento} onChange={e => setField('departamento', e.target.value)}>
                <option value="">Selecionar...</option>
                {departamentos.map(d => <option key={d} value={d}>{d}</option>)}
              </Select>
              {errors.departamento && <p className="text-xs text-red-400 mt-1">{errors.departamento}</p>}
            </div>
            <div>
                <label className="text-sm font-medium">Localidade(s)</label>
                <div className="mt-1 max-h-48 overflow-y-auto border border-border rounded-lg p-2 space-y-2">
                  {/* Nacional option */}
                  <label className="flex items-center gap-2 text-sm cursor-pointer hover:bg-accent rounded px-2 py-1 font-medium">
                    <input
                      type="checkbox"
                      checked={form.localidades.includes('Nacional')}
                      onChange={e => {
                        if (e.target.checked) setField('localidades', ['Nacional'])
                        else setField('localidades', form.localidades.filter(l => l !== 'Nacional'))
                      }}
                      className="rounded"
                    />
                    Nacional (todo o país)
                  </label>
                  <hr className="border-border" />
                  {localidadesCaboVerde.map(ilha => (
                    <div key={ilha.ilha}>
                      <p className="text-xs font-semibold text-muted-foreground px-2 pt-1">{ilha.ilha}</p>
                      {ilha.concelhos.map(c => {
                        const val = `${ilha.ilha} — ${c}`
                        return (
                          <label key={val} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-accent rounded px-2 py-0.5">
                            <input
                              type="checkbox"
                              checked={form.localidades.includes(val)}
                              disabled={form.localidades.includes('Nacional')}
                              onChange={e => {
                                if (e.target.checked) setField('localidades', [...form.localidades, val])
                                else setField('localidades', form.localidades.filter(l => l !== val))
                              }}
                              className="rounded"
                            />
                            {c}
                          </label>
                        )
                      })}
                    </div>
                  ))}
                </div>
                {form.localidades.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Selecionados: {form.localidades.join(', ')}
                  </p>
                )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Pilar Estratégico INSP *</label>
                <Select className={fieldClass('pilarINSP')} value={form.pilarINSP} onChange={e => { setField('pilarINSP', e.target.value); setField('linhaINSP', '') }}>
                  <option value="">Selecionar...</option>
                  {pilaresINSP.map(p => <option key={p} value={p}>{pilaresINSPLabels[p]}</option>)}
                </Select>
                {errors.pilarINSP && <p className="text-xs text-red-400 mt-1">{errors.pilarINSP}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">Linha de Pesquisa INSP *</label>
                <Select className={fieldClass('linhaINSP')} value={form.linhaINSP} onChange={e => setField('linhaINSP', e.target.value)} disabled={!form.pilarINSP}>
                  <option value="">Selecionar...</option>
                  {linhasINSP.map(l => <option key={l} value={l}>{l}</option>)}
                </Select>
                {errors.linhaINSP && <p className="text-xs text-red-400 mt-1">{errors.linhaINSP}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Eixo ANIS *</label>
                <Select className={fieldClass('eixoANIS')} value={form.eixoANIS} onChange={e => { setField('eixoANIS', e.target.value); setField('linhaANIS', '') }}>
                  <option value="">Selecionar...</option>
                  {eixosANIS.map(e => <option key={e} value={e}>{eixosANISLabels[e]}</option>)}
                </Select>
                {errors.eixoANIS && <p className="text-xs text-red-400 mt-1">{errors.eixoANIS}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">Linha de Investigação ANIS *</label>
                <Select className={fieldClass('linhaANIS')} value={form.linhaANIS} onChange={e => setField('linhaANIS', e.target.value)} disabled={!form.eixoANIS}>
                  <option value="">Selecionar...</option>
                  {linhasANIS.map(l => <option key={l} value={l}>{l}</option>)}
                </Select>
                {errors.linhaANIS && <p className="text-xs text-red-400 mt-1">{errors.linhaANIS}</p>}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Investigador(es) Principal(ais) *</label>
              <div className="flex gap-2">
                <Input
                  value={investigadorInput}
                  onChange={e => setInvestigadorInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addInvestigador() } }}
                  placeholder="Nome do investigador"
                />
                <Button type="button" variant="secondary" onClick={addInvestigador} size="sm">Adicionar</Button>
              </div>
              {form.investigadores.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.investigadores.map(inv => (
                    <span key={inv} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs">
                      {inv}
                      <button onClick={() => setField('investigadores', form.investigadores.filter(i => i !== inv))} className="ml-1 hover:text-red-400">&times;</button>
                    </span>
                  ))}
                </div>
              )}
              {errors.investigadores && <p className="text-xs text-red-400 mt-1">{errors.investigadores}</p>}
            </div>
          </TabsContent>

          <TabsContent value="execucao" className="space-y-4 mt-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Duração *</label>
                <Select className={fieldClass('duracao')} value={form.duracao} onChange={e => setField('duracao', e.target.value)}>
                  <option value="">Selecionar...</option>
                  {duracoes.map(d => <option key={d} value={d}>{d}</option>)}
                </Select>
                {errors.duracao && <p className="text-xs text-red-400 mt-1">{errors.duracao}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">Data de Início *</label>
                <Input type="date" className={fieldClass('inicio')} value={form.inicio} onChange={e => setField('inicio', e.target.value)} />
                {errors.inicio && <p className="text-xs text-red-400 mt-1">{errors.inicio}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">Data de Término *</label>
                <Input type="date" className={fieldClass('termino')} value={form.termino} min={form.inicio || undefined} onChange={e => setField('termino', e.target.value)} />
                {errors.termino && <p className="text-xs text-red-400 mt-1">{errors.termino}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Estado de Execução</label>
                <Select value={form.estadoFisico} onChange={e => setField('estadoFisico', e.target.value as Projeto['estadoFisico'])}>
                  {estadosFisicos.map(s => <option key={s} value={s}>{estadosFisicosLabels[s]}</option>)}
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Execução Física (%)</label>
                <Select value={form.percExecFisica} onChange={e => setField('percExecFisica', e.target.value)}>
                  {percExecFisicaOptions.map(p => <option key={p} value={p}>{p}</option>)}
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Execução Financeira</label>
                <Select value={form.percExecFinanceira} onChange={e => setField('percExecFinanceira', e.target.value)}>
                  {percExecFinanceiraOptions.map(p => <option key={p} value={p}>{p}</option>)}
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Orçamento (ECV)</label>
                <Input type="number" min={0} className={fieldClass('orcamento')} value={form.orcamento || ''} onChange={e => setField('orcamento', Number(e.target.value))} />
                {errors.orcamento && <p className="text-xs text-red-400 mt-1">{errors.orcamento}</p>}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Fonte de Financiamento *</label>
              <Select className={fieldClass('fonteFinanciamento')} value={form.fonteFinanciamento} onChange={e => setField('fonteFinanciamento', e.target.value)}>
                <option value="">Selecionar...</option>
                {fontesFinanciamento.map(f => <option key={f} value={f}>{f}</option>)}
              </Select>
              {errors.fonteFinanciamento && <p className="text-xs text-red-400 mt-1">{errors.fonteFinanciamento}</p>}
            </div>
            <div>
              <label className="text-sm font-medium">Observações</label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={form.observacoes}
                onChange={e => setField('observacoes', e.target.value)}
              />
            </div>
          </TabsContent>

          <TabsContent value="parceiros" className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium">Parceiros (selecção múltipla)</label>
              <div className="grid grid-cols-2 gap-2 mt-2 max-h-64 overflow-y-auto p-2 border border-border rounded-lg">
                {parceirosConhecidos.map(p => (
                  <label key={p} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-accent rounded px-2 py-1">
                    <input
                      type="checkbox"
                      checked={form.parceiros.includes(p)}
                      onChange={e => {
                        if (e.target.checked) setField('parceiros', [...form.parceiros, p])
                        else setField('parceiros', form.parceiros.filter(x => x !== p))
                      }}
                      className="rounded"
                    />
                    {p}
                  </label>
                ))}
              </div>
              {form.parceiros.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">Selecionados: {form.parceiros.join(', ')}</p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
