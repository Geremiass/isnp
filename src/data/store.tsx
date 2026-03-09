import { createContext, useContext, useState, useCallback, useMemo, useEffect, type ReactNode } from 'react'
import type { Utilizador, Projeto, Produto, Periodo, UIState } from './types'
import { parsePercent } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useAuth } from './auth'

// ─── DB ↔ UI mappers ────────────────────────────────────

function dbRowToProjeto(row: Record<string, unknown>): Projeto {
  return {
    id: row.id_projeto as string,
    _dbId: row.id as number,
    nome: (row.nome as string) || '',
    departamento: (row.departamento as string) || '',
    pilarINSP: (row.pilar_insp as string) || '',
    linhaINSP: (row.linha_insp as string) || '',
    eixoANIS: (row.eixo_anis as string) || '',
    linhaANIS: (row.linha_anis as string) || '',
    investigadores: row.investigadores ? (row.investigadores as string).split(',').map(s => s.trim()).filter(Boolean) : [],
    localidades: row.localidade ? (row.localidade as string).split(';;').map(s => s.trim()).filter(Boolean) : [],
    duracao: (row.duracao as string) || '',
    inicio: (row.inicio as string) || '',
    termino: (row.termino as string) || '',
    parceiros: row.parceiros ? (row.parceiros as string).split(',').map(s => s.trim()).filter(Boolean) : [],
    orcamento: Number(row.orcamento) || 0,
    fonteFinanciamento: (row.fonte_financiamento as string) || '',
    estadoFisico: (row.estado_fisico as Projeto['estadoFisico']) || 'Não_Iniciado',
    percExecFisica: (row.perc_exec_fisica as string) || '0%',
    percExecFinanceira: (row.perc_exec_financeira as string) || '0% (Sem Verba Disponível)',
    observacoes: (row.observacoes as string) || '',
  }
}

function projetoToDbRow(p: Omit<Projeto, 'id' | '_dbId'>, responsavelId: number) {
  return {
    nome: p.nome,
    departamento: p.departamento,
    pilar_insp: p.pilarINSP,
    linha_insp: p.linhaINSP,
    eixo_anis: p.eixoANIS,
    linha_anis: p.linhaANIS,
    investigadores: p.investigadores.join(', '),
    responsavel_id: responsavelId,
    localidade: p.localidades.length > 0 ? p.localidades.join(';;') : null,
    duracao: p.duracao || null,
    inicio: p.inicio || null,
    termino: p.termino || null,
    parceiros: p.parceiros.join(', '),
    orcamento: p.orcamento,
    fonte_financiamento: p.fonteFinanciamento || null,
    estado_fisico: p.estadoFisico,
    perc_exec_fisica: p.percExecFisica,
    perc_exec_financeira: p.percExecFinanceira,
    observacoes: p.observacoes || null,
  }
}

function dbRowToProduto(row: Record<string, unknown>, idProjeto: string): Produto {
  return {
    id: String(row.id),
    idProjeto,
    _projetoDbId: row.projeto_id as number,
    tipo: (row.tipo_produto as string) || '',
    nome: (row.nome_produto as string) || null,
    dataEntrega: (row.data_entrega as string) || null,
    estado: (row.estado_produto as string) || 'Planeado',
  }
}

function dbRowToUser(row: Record<string, unknown>): Utilizador {
  return {
    id: String(row.id),
    nome: (row.nome as string) || '',
    email: (row.email as string) || '',
    papel: (row.papel as Utilizador['papel']) || 'nenhum',
    departamento: (row.departamento as string) || '',
  }
}

// ─── Context interface (same as before) ─────────────────

interface AppState {
  currentUser: Utilizador
  users: Utilizador[]
  projetos: Projeto[]
  produtos: Produto[]
  ui: UIState
  setCurrentUser: (user: Utilizador) => void
  setPeriodo: (p: Periodo) => void
  setTabelaDensa: (v: boolean) => void
  setAnimacoes: (v: boolean) => void
  setBuscaProjetos: (v: string) => void
  addProjeto: (p: Projeto) => void
  updateProjeto: (id: string, data: Partial<Projeto>) => void
  deleteProjeto: (id: string) => void
  addProduto: (p: Produto) => void
  updateProduto: (id: string, data: Partial<Produto>) => void
  deleteProduto: (id: string) => void
  addUser: (u: Utilizador) => void
  updateUser: (id: string, data: Partial<Utilizador>) => void
  deleteUser: (id: string) => void
  filteredProjetos: Projeto[]
  visibleProjetos: Projeto[]
  showToast: (title: string, description?: string) => void
  toast: { title: string; description?: string } | null
  dismissToast: () => void
  dataLoading: boolean
}

const AppContext = createContext<AppState | null>(null)

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

function filterByPeriod(projetos: Projeto[], periodo: Periodo): Projeto[] {
  const now = new Date()
  const currentYear = now.getFullYear()

  return projetos.filter(p => {
    if (!p.inicio || !p.termino) return periodo === 'total'
    const inicio = new Date(p.inicio)
    const termino = new Date(p.termino)

    if (periodo === 'ano_atual') {
      return inicio.getFullYear() <= currentYear && termino.getFullYear() >= currentYear
    }
    if (periodo === '2anos') {
      const twoYearsAgo = currentYear - 1
      return inicio.getFullYear() <= currentYear && termino.getFullYear() >= twoYearsAgo
    }
    return true
  })
}

function filterByRole(projetos: Projeto[], user: Utilizador): Projeto[] {
  if (user.papel === 'admin' || user.papel === 'gestor') return projetos
  return projetos.filter(p => p.departamento === user.departamento)
}

// ─── Provider ────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth()

  const currentUser: Utilizador = profile || {
    id: '0', nome: '', email: '', papel: 'nenhum', departamento: '',
  }
  const responsavelId = Number(currentUser.id) || 0

  const [users, setUsers] = useState<Utilizador[]>([])
  const [projetos, setProjetos] = useState<Projeto[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [ui, setUI] = useState<UIState>({
    periodo: 'ano_atual',
    tabelaDensa: false,
    animacoes: true,
    buscaProjetos: '',
  })
  const [toast, setToast] = useState<{ title: string; description?: string } | null>(null)

  // ─── Fetch data on mount / profile change ────────────
  useEffect(() => {
    if (!profile || profile.papel === 'nenhum') { setDataLoading(false); return }
    let cancelled = false

    async function load() {
      setDataLoading(true)

      // Fetch projetos (RLS filters automatically)
      const { data: projRows } = await supabase
        .from('projetos')
        .select('*')
        .order('criado_em', { ascending: false })

      if (!cancelled && projRows) {
        const projs = projRows.map(r => dbRowToProjeto(r as Record<string, unknown>))
        setProjetos(projs)

        // Build a dbId → idProjeto map for produtos
        const dbIdMap = new Map<number, string>()
        for (const p of projs) {
          if (p._dbId) dbIdMap.set(p._dbId, p.id)
        }

        // Fetch produtos (RLS filters automatically)
        const { data: prodRows } = await supabase
          .from('produtos_outputs')
          .select('*')
          .order('criado_em', { ascending: false })

        if (!cancelled && prodRows) {
          setProdutos(
            prodRows.map(r => {
              const row = r as Record<string, unknown>
              const idProjeto = dbIdMap.get(row.projeto_id as number) || ''
              return dbRowToProduto(row, idProjeto)
            })
          )
        }
      }

      // Fetch users if admin/gestor
      if (profile && (profile.papel === 'admin' || profile.papel === 'gestor')) {
        const { data: userRows } = await supabase
          .from('app_users')
          .select('*')
          .order('criado_em', { ascending: false })

        if (!cancelled && userRows) {
          setUsers(userRows.map(r => dbRowToUser(r as Record<string, unknown>)))
        }
      }

      if (!cancelled) setDataLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [profile])

  // ─── UI setters ─────────────────────────────────────
  const setCurrentUser = useCallback((_u: Utilizador) => {}, [])
  const setPeriodo = useCallback((p: Periodo) => setUI(s => ({ ...s, periodo: p })), [])
  const setTabelaDensa = useCallback((v: boolean) => setUI(s => ({ ...s, tabelaDensa: v })), [])
  const setAnimacoes = useCallback((v: boolean) => setUI(s => ({ ...s, animacoes: v })), [])
  const setBuscaProjetos = useCallback((v: string) => setUI(s => ({ ...s, buscaProjetos: v })), [])

  // ─── Toast ──────────────────────────────────────────
  const showToast = useCallback((title: string, description?: string) => {
    setToast({ title, description })
    setTimeout(() => setToast(null), 4000)
  }, [])
  const dismissToast = useCallback(() => setToast(null), [])

  // ─── Projetos CRUD ──────────────────────────────────
  const addProjeto = useCallback(async (p: Projeto) => {
    const row = projetoToDbRow(p, responsavelId)
    const { data, error } = await supabase
      .from('projetos')
      .insert({ ...row, id_projeto: p.id })
      .select()
      .single()

    if (error) {
      showToast('Erro ao criar projeto', error.message)
      return
    }
    if (data) {
      setProjetos(s => [dbRowToProjeto(data as Record<string, unknown>), ...s])
    }
  }, [responsavelId, showToast])

  const updateProjeto = useCallback(async (id: string, data: Partial<Projeto>) => {
    // Find current project
    const proj = projetos.find(p => p.id === id)
    if (!proj) return

    // Optimistic update
    setProjetos(s => s.map(p => p.id === id ? { ...p, ...data } : p))

    const dbId = proj._dbId
    if (!dbId) return

    const updates: Record<string, unknown> = {}
    if (data.nome !== undefined) updates.nome = data.nome
    if (data.departamento !== undefined) updates.departamento = data.departamento
    if (data.pilarINSP !== undefined) updates.pilar_insp = data.pilarINSP
    if (data.linhaINSP !== undefined) updates.linha_insp = data.linhaINSP
    if (data.eixoANIS !== undefined) updates.eixo_anis = data.eixoANIS
    if (data.linhaANIS !== undefined) updates.linha_anis = data.linhaANIS
    if (data.investigadores !== undefined) updates.investigadores = data.investigadores.join(', ')
    if (data.localidades !== undefined) updates.localidade = data.localidades.length > 0 ? data.localidades.join(';;') : null
    if (data.duracao !== undefined) updates.duracao = data.duracao
    if (data.inicio !== undefined) updates.inicio = data.inicio || null
    if (data.termino !== undefined) updates.termino = data.termino || null
    if (data.parceiros !== undefined) updates.parceiros = data.parceiros.join(', ')
    if (data.orcamento !== undefined) updates.orcamento = data.orcamento
    if (data.fonteFinanciamento !== undefined) updates.fonte_financiamento = data.fonteFinanciamento
    if (data.estadoFisico !== undefined) updates.estado_fisico = data.estadoFisico
    if (data.percExecFisica !== undefined) updates.perc_exec_fisica = data.percExecFisica
    if (data.percExecFinanceira !== undefined) updates.perc_exec_financeira = data.percExecFinanceira
    if (data.observacoes !== undefined) updates.observacoes = data.observacoes

    if (Object.keys(updates).length === 0) return

    const { error } = await supabase.from('projetos').update(updates).eq('id', dbId)
    if (error) {
      // Revert optimistic update
      setProjetos(s => s.map(p => p.id === id ? proj : p))
      showToast('Erro ao atualizar', error.message)
    }
  }, [projetos, showToast])

  const deleteProjeto = useCallback(async (id: string) => {
    const proj = projetos.find(p => p.id === id)
    if (!proj?._dbId) return

    // Optimistic
    setProjetos(s => s.filter(p => p.id !== id))
    setProdutos(s => s.filter(p => p.idProjeto !== id))

    const { error } = await supabase.from('projetos').delete().eq('id', proj._dbId)
    if (error) {
      showToast('Erro ao eliminar', error.message)
      // Reload data
      const { data: rows } = await supabase.from('projetos').select('*').order('criado_em', { ascending: false })
      if (rows) setProjetos(rows.map(r => dbRowToProjeto(r as Record<string, unknown>)))
    }
  }, [projetos, showToast])

  // ─── Produtos CRUD ──────────────────────────────────
  const addProduto = useCallback(async (p: Produto) => {
    const proj = projetos.find(pr => pr.id === p.idProjeto)
    if (!proj?._dbId) { showToast('Erro', 'Projeto não encontrado'); return }

    const { data, error } = await supabase
      .from('produtos_outputs')
      .insert({
        projeto_id: proj._dbId,
        tipo_produto: p.tipo,
        nome_produto: p.nome,
        data_entrega: p.dataEntrega || null,
        estado_produto: p.estado,
      })
      .select()
      .single()

    if (error) {
      showToast('Erro ao criar produto', error.message)
      return
    }
    if (data) {
      const row = data as Record<string, unknown>
      setProdutos(s => [dbRowToProduto(row, p.idProjeto), ...s])
    }
  }, [projetos, showToast])

  const updateProduto = useCallback(async (id: string, data: Partial<Produto>) => {
    setProdutos(s => s.map(p => p.id === id ? { ...p, ...data } : p))

    const updates: Record<string, unknown> = {}
    if (data.tipo !== undefined) updates.tipo_produto = data.tipo
    if (data.nome !== undefined) updates.nome_produto = data.nome
    if (data.dataEntrega !== undefined) updates.data_entrega = data.dataEntrega || null
    if (data.estado !== undefined) updates.estado_produto = data.estado

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase.from('produtos_outputs').update(updates).eq('id', Number(id))
      if (error) showToast('Erro ao atualizar produto', error.message)
    }
  }, [showToast])

  const deleteProduto = useCallback(async (id: string) => {
    setProdutos(s => s.filter(p => p.id !== id))
    const { error } = await supabase.from('produtos_outputs').delete().eq('id', Number(id))
    if (error) showToast('Erro ao eliminar produto', error.message)
  }, [showToast])

  // ─── Users CRUD (Admin) ─────────────────────────────
  const addUser = useCallback(async (u: Utilizador) => {
    const { data, error } = await supabase
      .from('app_users')
      .insert({ nome: u.nome, email: u.email, papel: u.papel, departamento: u.departamento })
      .select()
      .single()

    if (error) {
      showToast('Erro ao criar utilizador', error.message)
      return
    }
    if (data) setUsers(s => [dbRowToUser(data as Record<string, unknown>), ...s])
  }, [showToast])

  const updateUser = useCallback(async (id: string, data: Partial<Utilizador>) => {
    setUsers(s => s.map(u => u.id === id ? { ...u, ...data } : u))

    const updates: Record<string, unknown> = {}
    if (data.nome !== undefined) updates.nome = data.nome
    if (data.email !== undefined) updates.email = data.email
    if (data.papel !== undefined) updates.papel = data.papel
    if (data.departamento !== undefined) updates.departamento = data.departamento

    const { error } = await supabase.from('app_users').update(updates).eq('id', Number(id))
    if (error) showToast('Erro ao atualizar utilizador', error.message)
  }, [showToast])

  const deleteUser = useCallback(async (id: string) => {
    setUsers(s => s.filter(u => u.id !== id))
    const { error } = await supabase.from('app_users').delete().eq('id', Number(id))
    if (error) showToast('Erro ao eliminar utilizador', error.message)
  }, [showToast])

  // ─── Computed ───────────────────────────────────────
  const filteredProjetos = useMemo(
    () => filterByPeriod(projetos, ui.periodo),
    [projetos, ui.periodo]
  )

  const visibleProjetos = useMemo(
    () => filterByRole(projetos, currentUser),
    [projetos, currentUser]
  )

  const value = useMemo(() => ({
    currentUser, users, projetos, produtos, ui, toast, dataLoading,
    setCurrentUser, setPeriodo, setTabelaDensa, setAnimacoes, setBuscaProjetos,
    addProjeto, updateProjeto, deleteProjeto,
    addProduto, updateProduto, deleteProduto,
    addUser, updateUser, deleteUser,
    filteredProjetos, visibleProjetos,
    showToast, dismissToast,
  }), [currentUser, users, projetos, produtos, ui, toast, dataLoading,
    filteredProjetos, visibleProjetos,
    setCurrentUser, setPeriodo, setTabelaDensa, setAnimacoes, setBuscaProjetos,
    addProjeto, updateProjeto, deleteProjeto,
    addProduto, updateProduto, deleteProduto,
    addUser, updateUser, deleteUser,
    showToast, dismissToast])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// Derivation hooks
export function useKPIs() {
  const { filteredProjetos } = useApp()
  return useMemo(() => {
    const total = filteredProjetos.length
    const ativos = filteredProjetos.filter(p => p.estadoFisico === 'Em_andamento')
    const concluidos = filteredProjetos.filter(p => p.estadoFisico === 'Concluido')
    const taxaExecMedia = ativos.length > 0
      ? Math.round(ativos.reduce((sum, p) => sum + parsePercent(p.percExecFisica), 0) / ativos.length)
      : 0
    const orcamentoTotal = filteredProjetos.reduce((sum, p) => sum + p.orcamento, 0)
    return { total, ativos: ativos.length, concluidos: concluidos.length, taxaExecMedia, orcamentoTotal }
  }, [filteredProjetos])
}
