export interface Utilizador {
  id: string
  nome: string
  email: string
  papel: Papel
  departamento: string
}

export interface Projeto {
  id: string
  nome: string
  departamento: string
  pilarINSP: string
  linhaINSP: string
  eixoANIS: string
  linhaANIS: string
  investigadores: string[]
  localidade: string
  duracao: string
  inicio: string
  termino: string
  parceiros: string[]
  orcamento: number
  fonteFinanciamento: string
  estadoFisico: EstadoFisico
  percExecFisica: string
  percExecFinanceira: string
  observacoes: string
}

export interface Produto {
  id: string
  idProjeto: string
  tipo: string
  nome: string | null
  dataEntrega: string | null
  estado: string
}

export type Papel = 'admin' | 'investigador' | 'gestor'
export type EstadoFisico = 'Não_Iniciado' | 'Em_andamento' | 'Concluido' | 'Suspenso' | 'Cancelado'
export type Periodo = 'ano_atual' | '2anos' | 'total'

export interface UIState {
  periodo: Periodo
  tabelaDensa: boolean
  animacoes: boolean
  buscaProjetos: string
}
