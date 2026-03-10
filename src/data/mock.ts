import type { Utilizador, Projeto, Produto } from './types'

export const mockUsers: Utilizador[] = [
  { id: "u0", nome: "Gestor Demo", email: "gestor@insp.gov.cv", papel: "admin", departamento: "DIICF" },
  { id: "u1", nome: "Dra. Ana Évora", email: "ana.evora@insp.gov.cv", papel: "investigador", departamento: "1. Observatório Nacional de Saúde" },
  { id: "u2", nome: "Dr. Carlos Brito", email: "carlos.brito@insp.gov.cv", papel: "investigador", departamento: "2. LCQAA e LAM" },
  { id: "u3", nome: "Dra. Filipa Lopes", email: "filipa.lopes@insp.gov.cv", papel: "gestor", departamento: "5. Investigação, Ciência, Inovação e Formação" },
]

export const mockProjetos: Projeto[] = [
  {
    id: "ID001", nome: "Estudo de Prevalência das Doenças Metabólicas em Cabo Verde",
    departamento: "1. Observatório Nacional de Saúde",
    pilarINSP: "Pilar_1_Vigilância_em_Saúde", linhaINSP: "1. Saúde e bem-estar",
    eixoANIS: "Eixo_1_Doenças_não_Transmissíveis_Saúde_Mental_e_Causas_Externas",
    linhaANIS: "1. Doenças metabólicas e da nutrição",
    investigadores: ["Dra. Ana Évora"], localidades: ["Santiago — Praia"],
    duracao: "2 anos", inicio: "2024-01-15", termino: "2025-12-31",
    parceiros: ["Uni-CV", "DNS"], orcamento: 3500000, fonteFinanciamento: "Banco Mundial",
    estadoFisico: "Em_andamento", percExecFisica: "50%", percExecFinanceira: "40% - 60% (Fase Intermédia)",
    observacoes: "Recolha de dados em curso em 4 concelhos"
  },
  {
    id: "ID002", nome: "Vigilância Laboratorial de Doenças Cardiovasculares",
    departamento: "2. LCQAA e LAM",
    pilarINSP: "Pilar_1_Vigilância_em_Saúde", linhaINSP: "1. Saúde e bem-estar",
    eixoANIS: "Eixo_1_Doenças_não_Transmissíveis_Saúde_Mental_e_Causas_Externas",
    linhaANIS: "2. Doenças cardio e cerebrovasculares",
    investigadores: ["Dr. Carlos Brito"], localidades: ["São Vicente — São Vicente (Mindelo)"],
    duracao: "1 ano", inicio: "2024-03-01", termino: "2025-02-28",
    parceiros: ["UniMindelo"], orcamento: 1200000, fonteFinanciamento: "UNICEF",
    estadoFisico: "Em_andamento", percExecFisica: "25%", percExecFinanceira: "10% - 30% (Fase Inicial)",
    observacoes: "Fase de revisão bibliográfica concluída"
  },
  {
    id: "ID003", nome: "Avaliação dos Serviços de Saúde em Cabo Verde",
    departamento: "5. Investigação, Ciência, Inovação e Formação",
    pilarINSP: "Pilar_2_Compreensão_da_interface_saúde_e_doença", linhaINSP: "5. Doenças não transmissíveis",
    eixoANIS: "Eixo_3_Políticas_e_Sistema_de_Saúde", linhaANIS: "17. Avaliação dos programas e serviços de saúde",
    investigadores: ["Dra. Filipa Lopes"], localidades: ["Santiago — Praia"],
    duracao: "3 anos", inicio: "2023-06-01", termino: "2026-05-31",
    parceiros: ["OMS", "MS"], orcamento: 5000000, fonteFinanciamento: "OMS",
    estadoFisico: "Em_andamento", percExecFisica: "75%", percExecFinanceira: "70% - 90% (Fase de Encerramento)",
    observacoes: "Análise de dados em curso"
  },
  {
    id: "ID004", nome: "Estudo Epidemiológico da Tuberculose",
    departamento: "3. Laboratório de Virologia",
    pilarINSP: "Pilar_2_Compreensão_da_interface_saúde_e_doença", linhaINSP: "4. Doenças transmissíveis",
    eixoANIS: "Eixo_2_Doenças_Transmissíveis_e_Emergências_em_Saúde_Pública",
    linhaANIS: "14. Outras doenças transmissíveis",
    investigadores: ["Dra. Ana Évora", "Dr. Carlos Brito"], localidades: ["Santiago — Praia", "Santiago — Ribeira Grande de Santiago"],
    duracao: "2 anos", inicio: "2024-09-01", termino: "2026-08-31",
    parceiros: ["DNS", "DS da Praia"], orcamento: 2800000, fonteFinanciamento: "BAD",
    estadoFisico: "Em_andamento", percExecFisica: "25%", percExecFinanceira: "10% - 30% (Fase Inicial)",
    observacoes: "Protocolo aprovado; início de campo previsto para Q1 2025"
  },
  {
    id: "ID005", nome: "Determinantes Sociais e Saúde Mental em Adolescentes",
    departamento: "4. Promoção da Saúde",
    pilarINSP: "Pilar_1_Vigilância_em_Saúde", linhaINSP: "2. Saúde mental",
    eixoANIS: "Eixo_1_Doenças_não_Transmissíveis_Saúde_Mental_e_Causas_Externas",
    linhaANIS: "4. Doenças mentais, álcool e outras drogas",
    investigadores: ["Dra. Filipa Lopes"], localidades: ["Santo Antão — Ribeira Grande", "Santo Antão — Paul", "Santo Antão — Porto Novo"],
    duracao: "2 anos", inicio: "2023-01-10", termino: "2024-12-31",
    parceiros: ["Uni-CV", "UNICEF"], orcamento: 1800000, fonteFinanciamento: "UNICEF",
    estadoFisico: "Concluido", percExecFisica: "100%", percExecFinanceira: "100% (Totalmente Executado)",
    observacoes: "Relatório final submetido ao financiador"
  },
  {
    id: "ID006", nome: "Monitorização de Resistência Antimicrobiana",
    departamento: "2. LCQAA e LAM",
    pilarINSP: "Pilar_3_Desenvolvimento_tecnológico_em_saúde", linhaINSP: "6. Sistema de informação e de epidemiologia analítica",
    eixoANIS: "Eixo_2_Doenças_Transmissíveis_e_Emergências_em_Saúde_Pública",
    linhaANIS: "11. Bacteriologia",
    investigadores: ["Dr. Carlos Brito"], localidades: ["Nacional"],
    duracao: "3 anos", inicio: "2022-05-01", termino: "2025-04-30",
    parceiros: ["OMS", "FCT"], orcamento: 4200000, fonteFinanciamento: "FCT",
    estadoFisico: "Em_andamento", percExecFisica: "75%", percExecFinanceira: "70% - 90% (Fase de Encerramento)",
    observacoes: "3ª campanha de recolha de amostras realizada"
  },
  {
    id: "ID007", nome: "Inquérito de Saúde Reprodutiva",
    departamento: "1. Observatório Nacional de Saúde",
    pilarINSP: "Pilar_1_Vigilância_em_Saúde", linhaINSP: "1. Saúde e bem-estar",
    eixoANIS: "Eixo_7_Saúde_de_Grupos_Populacionais",
    linhaANIS: "1. Saúde e bem-estar",
    investigadores: ["Dra. Ana Évora"], localidades: ["Nacional"],
    duracao: "1 ano", inicio: "2025-02-01", termino: "2026-01-31",
    parceiros: ["UNFPA"], orcamento: 900000, fonteFinanciamento: "Governo",
    estadoFisico: "Não_Iniciado", percExecFisica: "0%", percExecFinanceira: "0% (Sem Verba Disponível)",
    observacoes: "Aguarda aprovação orçamental"
  },
  {
    id: "ID008", nome: "Desenvolvimento de Sistema de Informação em Saúde",
    departamento: "5. Investigação, Ciência, Inovação e Formação",
    pilarINSP: "Pilar_3_Desenvolvimento_tecnológico_em_saúde", linhaINSP: "6. Sistema de informação e de epidemiologia analítica",
    eixoANIS: "Eixo_9_Tecnologias_em_Saúde", linhaANIS: "18. Sistema de informação em saúde",
    investigadores: ["Dra. Filipa Lopes"], localidades: ["Santiago — Praia"],
    duracao: "4 anos", inicio: "2021-09-01", termino: "2025-08-31",
    parceiros: ["Uni-CV", "Banco Mundial"], orcamento: 8500000, fonteFinanciamento: "Banco Mundial",
    estadoFisico: "Concluido", percExecFisica: "100%", percExecFinanceira: "100% (Totalmente Executado)",
    observacoes: "Sistema entregue e em produção no MS"
  },
  {
    id: "ID009", nome: "Estudo de Parasitologia Clínica em São Nicolau",
    departamento: "3. Laboratório de Virologia",
    pilarINSP: "Pilar_2_Compreensão_da_interface_saúde_e_doença", linhaINSP: "4. Doenças transmissíveis",
    eixoANIS: "Eixo_2_Doenças_Transmissíveis_e_Emergências_em_Saúde_Pública",
    linhaANIS: "12. Parasitologia",
    investigadores: ["Dr. Carlos Brito"], localidades: ["São Nicolau — Tarrafal de São Nicolau"],
    duracao: "2 anos", inicio: "2023-03-01", termino: "2025-02-28",
    parceiros: ["DS do Tarrafal de São Nicolau", "UniMindelo"], orcamento: 1100000, fonteFinanciamento: "OGE",
    estadoFisico: "Suspenso", percExecFisica: "25%", percExecFinanceira: "10% - 30% (Fase Inicial)",
    observacoes: "Suspenso por falta de pessoal no terreno"
  },
  {
    id: "ID010", nome: "Comunicação em Saúde e Mudança de Comportamento",
    departamento: "4. Promoção da Saúde",
    pilarINSP: "Pilar_1_Vigilância_em_Saúde", linhaINSP: "1. Saúde e bem-estar",
    eixoANIS: "Eixo_10_Comunicação_e_Promoção_da_Saúde", linhaANIS: "1. Saúde e bem-estar",
    investigadores: ["Dra. Ana Évora", "Dra. Filipa Lopes"], localidades: ["Nacional"],
    duracao: "1 ano", inicio: "2024-07-01", termino: "2025-06-30",
    parceiros: ["CCS-SIDA", "OMS"], orcamento: 650000, fonteFinanciamento: "CCS-SIDA",
    estadoFisico: "Em_andamento", percExecFisica: "50%", percExecFinanceira: "40% - 60% (Fase Intermédia)",
    observacoes: "Materiais de comunicação em produção"
  },
]

export const mockProdutos: Produto[] = [
  { id: "P001", idProjeto: "ID001", tipo: "Artigo Científico (Indexado)", nome: null, dataEntrega: "2026-01-01", estado: "Em Elaboração" },
  { id: "P002", idProjeto: "ID002", tipo: "Artigo Científico (Não Indexado)", nome: null, dataEntrega: null, estado: "Submetido" },
  { id: "P003", idProjeto: "ID003", tipo: "Relatório Técnico", nome: "Relatório de Avaliação 2024", dataEntrega: "2024-12-31", estado: "Publicado/Entregue" },
  { id: "P004", idProjeto: "ID003", tipo: "Policy Brief", nome: "Recomendações para o Sistema de Saúde CV", dataEntrega: "2025-06-30", estado: "Em Elaboração" },
  { id: "P005", idProjeto: "ID005", tipo: "Relatório Técnico", nome: "Relatório Final — Saúde Mental Adolescentes", dataEntrega: "2024-12-31", estado: "Publicado/Entregue" },
  { id: "P006", idProjeto: "ID005", tipo: "Artigo Científico (Indexado)", nome: null, dataEntrega: "2025-06-01", estado: "Submetido" },
  { id: "P007", idProjeto: "ID006", tipo: "Base de Dados", nome: "Base de Dados de Resistência Antimicrobiana CV", dataEntrega: "2025-04-30", estado: "Em Elaboração" },
  { id: "P008", idProjeto: "ID008", tipo: "Base de Dados", nome: "SIS — Sistema de Informação em Saúde", dataEntrega: "2025-08-31", estado: "Publicado/Entregue" },
  { id: "P009", idProjeto: "ID004", tipo: "Protocolo de Investigação", nome: "Protocolo TBC 2024", dataEntrega: "2024-11-01", estado: "Publicado/Entregue" },
  { id: "P010", idProjeto: "ID010", tipo: "Guia/Manual", nome: "Guia de Comunicação em Saúde", dataEntrega: "2025-03-01", estado: "Planeado" },
]
