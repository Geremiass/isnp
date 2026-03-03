import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react'
import type { Utilizador, Projeto, Produto, Periodo, UIState } from './types'
import { mockUsers, mockProjetos, mockProdutos } from './mock'
import { parsePercent } from '@/lib/utils'

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

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Utilizador>(mockUsers[0])
  const [users, setUsers] = useState<Utilizador[]>([...mockUsers])
  const [projetos, setProjetos] = useState<Projeto[]>([...mockProjetos])
  const [produtos, setProdutos] = useState<Produto[]>([...mockProdutos])
  const [ui, setUI] = useState<UIState>({
    periodo: 'ano_atual',
    tabelaDensa: false,
    animacoes: true,
    buscaProjetos: '',
  })
  const [toast, setToast] = useState<{ title: string; description?: string } | null>(null)

  const setPeriodo = useCallback((p: Periodo) => setUI(s => ({ ...s, periodo: p })), [])
  const setTabelaDensa = useCallback((v: boolean) => setUI(s => ({ ...s, tabelaDensa: v })), [])
  const setAnimacoes = useCallback((v: boolean) => setUI(s => ({ ...s, animacoes: v })), [])
  const setBuscaProjetos = useCallback((v: string) => setUI(s => ({ ...s, buscaProjetos: v })), [])

  const addProjeto = useCallback((p: Projeto) => setProjetos(s => [...s, p]), [])
  const updateProjeto = useCallback((id: string, data: Partial<Projeto>) => {
    setProjetos(s => s.map(p => p.id === id ? { ...p, ...data } : p))
  }, [])
  const deleteProjeto = useCallback((id: string) => {
    setProjetos(s => s.filter(p => p.id !== id))
    setProdutos(s => s.filter(p => p.idProjeto !== id))
  }, [])

  const addProduto = useCallback((p: Produto) => setProdutos(s => [...s, p]), [])
  const updateProduto = useCallback((id: string, data: Partial<Produto>) => {
    setProdutos(s => s.map(p => p.id === id ? { ...p, ...data } : p))
  }, [])
  const deleteProduto = useCallback((id: string) => setProdutos(s => s.filter(p => p.id !== id)), [])

  const addUser = useCallback((u: Utilizador) => setUsers(s => [...s, u]), [])
  const updateUser = useCallback((id: string, data: Partial<Utilizador>) => {
    setUsers(s => s.map(u => u.id === id ? { ...u, ...data } : u))
  }, [])
  const deleteUser = useCallback((id: string) => setUsers(s => s.filter(u => u.id !== id)), [])

  const showToast = useCallback((title: string, description?: string) => {
    setToast({ title, description })
    setTimeout(() => setToast(null), 4000)
  }, [])
  const dismissToast = useCallback(() => setToast(null), [])

  const filteredProjetos = useMemo(
    () => filterByPeriod(projetos, ui.periodo),
    [projetos, ui.periodo]
  )

  const visibleProjetos = useMemo(
    () => filterByRole(projetos, currentUser),
    [projetos, currentUser]
  )

  const value = useMemo(() => ({
    currentUser, users, projetos, produtos, ui, toast,
    setCurrentUser, setPeriodo, setTabelaDensa, setAnimacoes, setBuscaProjetos,
    addProjeto, updateProjeto, deleteProjeto,
    addProduto, updateProduto, deleteProduto,
    addUser, updateUser, deleteUser,
    filteredProjetos, visibleProjetos,
    showToast, dismissToast,
  }), [currentUser, users, projetos, produtos, ui, toast,
    filteredProjetos, visibleProjetos,
    setPeriodo, setTabelaDensa, setAnimacoes, setBuscaProjetos,
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
