export const departamentos = [
  "1. Observatório Nacional de Saúde",
  "2. LCQAA e LAM",
  "3. Laboratório de Virologia",
  "4. Promoção da Saúde",
  "5. Investigação, Ciência, Inovação e Formação",
  "6. Projetos não previstos no plano de atividades"
]

export const pilaresINSP = [
  "Pilar_1_Vigilância_em_Saúde",
  "Pilar_2_Compreensão_da_interface_saúde_e_doença",
  "Pilar_3_Desenvolvimento_tecnológico_em_saúde"
]

export const pilaresINSPLabels: Record<string, string> = {
  "Pilar_1_Vigilância_em_Saúde": "Pilar 1: Vigilância em Saúde",
  "Pilar_2_Compreensão_da_interface_saúde_e_doença": "Pilar 2: Compreensão da Interface Saúde e Doença",
  "Pilar_3_Desenvolvimento_tecnológico_em_saúde": "Pilar 3: Desenvolvimento Tecnológico em Saúde",
}

export const linhasINSPPorPilar: Record<string, string[]> = {
  "Pilar_1_Vigilância_em_Saúde": [
    "1. Saúde e bem-estar",
    "2. Saúde mental",
    "3. Segurança alimentar e nutricional",
  ],
  "Pilar_2_Compreensão_da_interface_saúde_e_doença": [
    "4. Doenças transmissíveis",
    "5. Doenças não transmissíveis",
  ],
  "Pilar_3_Desenvolvimento_tecnológico_em_saúde": [
    "6. Sistema de informação e de epidemiologia analítica",
    "7. Inovação tecnológica em saúde",
  ],
}

export const eixosANIS = [
  "Eixo_1_Doenças_não_Transmissíveis_Saúde_Mental_e_Causas_Externas",
  "Eixo_2_Doenças_Transmissíveis_e_Emergências_em_Saúde_Pública",
  "Eixo_3_Políticas_e_Sistema_de_Saúde",
  "Eixo_4_Determinantes_da_Saúde",
  "Eixo_5_Epidemiologia_Demografia_e_Saúde",
  "Eixo_6_Investigação_Clínica",
  "Eixo_7_Saúde_de_Grupos_Populacionais",
  "Eixo_8_Cuidados_Farmacêuticos_e_Outras_Terapias",
  "Eixo_9_Tecnologias_em_Saúde",
  "Eixo_10_Comunicação_e_Promoção_da_Saúde"
]

export const eixosANISLabels: Record<string, string> = {
  "Eixo_1_Doenças_não_Transmissíveis_Saúde_Mental_e_Causas_Externas": "Eixo 1: Doenças não Transmissíveis",
  "Eixo_2_Doenças_Transmissíveis_e_Emergências_em_Saúde_Pública": "Eixo 2: Doenças Transmissíveis",
  "Eixo_3_Políticas_e_Sistema_de_Saúde": "Eixo 3: Políticas e Sistema de Saúde",
  "Eixo_4_Determinantes_da_Saúde": "Eixo 4: Determinantes da Saúde",
  "Eixo_5_Epidemiologia_Demografia_e_Saúde": "Eixo 5: Epidemiologia e Demografia",
  "Eixo_6_Investigação_Clínica": "Eixo 6: Investigação Clínica",
  "Eixo_7_Saúde_de_Grupos_Populacionais": "Eixo 7: Saúde de Grupos Populacionais",
  "Eixo_8_Cuidados_Farmacêuticos_e_Outras_Terapias": "Eixo 8: Cuidados Farmacêuticos",
  "Eixo_9_Tecnologias_em_Saúde": "Eixo 9: Tecnologias em Saúde",
  "Eixo_10_Comunicação_e_Promoção_da_Saúde": "Eixo 10: Comunicação e Promoção da Saúde",
}

export const linhasANISPorEixo: Record<string, string[]> = {
  "Eixo_1_Doenças_não_Transmissíveis_Saúde_Mental_e_Causas_Externas": [
    "1. Doenças metabólicas e da nutrição",
    "2. Doenças cardio e cerebrovasculares",
    "3. Doenças oncológicas",
    "4. Doenças mentais, álcool e outras drogas",
    "5. Causas externas (acidentes e violência)",
  ],
  "Eixo_2_Doenças_Transmissíveis_e_Emergências_em_Saúde_Pública": [
    "6. HIV/SIDA",
    "7. Tuberculose",
    "8. Malária",
    "9. Hepatites virais",
    "10. Dengue e arboviroses",
    "11. Bacteriologia",
    "12. Parasitologia",
    "13. Micologia",
    "14. Outras doenças transmissíveis",
    "15. Emergências em Saúde Pública",
  ],
  "Eixo_3_Políticas_e_Sistema_de_Saúde": [
    "16. Políticas, governação e financiamento da saúde",
    "17. Avaliação dos programas e serviços de saúde",
  ],
  "Eixo_4_Determinantes_da_Saúde": [
    "18. Determinantes sociais, ambientais e comportamentais",
  ],
  "Eixo_5_Epidemiologia_Demografia_e_Saúde": [
    "19. Epidemiologia descritiva e analítica",
    "20. Demografia e saúde",
  ],
  "Eixo_6_Investigação_Clínica": [
    "21. Ensaios clínicos e investigação translacional",
  ],
  "Eixo_7_Saúde_de_Grupos_Populacionais": [
    "1. Saúde e bem-estar",
  ],
  "Eixo_8_Cuidados_Farmacêuticos_e_Outras_Terapias": [
    "22. Farmácia e terapêuticas",
  ],
  "Eixo_9_Tecnologias_em_Saúde": [
    "18. Sistema de informação em saúde",
    "23. Tecnologias biomédicas",
  ],
  "Eixo_10_Comunicação_e_Promoção_da_Saúde": [
    "1. Saúde e bem-estar",
    "24. Comunicação em saúde",
  ],
}

export const estadosFisicos = [
  "Não_Iniciado",
  "Em_andamento",
  "Concluido",
  "Suspenso",
  "Cancelado",
] as const

export const estadosFisicosLabels: Record<string, string> = {
  "Não_Iniciado": "Não Iniciado",
  "Em_andamento": "Em Andamento",
  "Concluido": "Concluído",
  "Suspenso": "Suspenso",
  "Cancelado": "Cancelado",
}

export const estadosFisicosColors: Record<string, string> = {
  "Não_Iniciado": "#6b7280",
  "Em_andamento": "#eab308",
  "Concluido": "#22c55e",
  "Suspenso": "#f97316",
  "Cancelado": "#ef4444",
}

export const percExecFisicaOptions = [
  "0%",
  "25%",
  "50%",
  "75%",
  "100%",
]

export const percExecFinanceiraOptions = [
  "0% (Sem Verba Disponível)",
  "10% - 30% (Fase Inicial)",
  "40% - 60% (Fase Intermédia)",
  "70% - 90% (Fase de Encerramento)",
  "100% (Totalmente Executado)",
]

export const tiposProduto = [
  "Artigo Científico (Indexado)",
  "Artigo Científico (Não Indexado)",
  "Relatório Técnico",
  "Guia/Manual",
  "Trabalho Final de Curso",
  "Dissertação de Mestrado",
  "Tese de Doutoramento",
  "Boletim Oficial",
  "Base de Dados",
  "Policy Brief",
  "Poster/Comunicação Oral",
  "Protocolo de Investigação",
]

export const estadosProduto = [
  "Planeado",
  "Em Elaboração",
  "Submetido",
  "Em Revisão",
  "Publicado/Entregue",
]

export const estadosProdutoColors: Record<string, string> = {
  "Planeado": "#6b7280",
  "Em Elaboração": "#3b82f6",
  "Submetido": "#eab308",
  "Em Revisão": "#f97316",
  "Publicado/Entregue": "#22c55e",
}

export const duracoes = [
  "<1 ano", "1 ano", "2 anos", "3 anos", "4 anos", "5 anos",
  "6 anos", "7 anos", "8 anos", "9 anos", "10 anos", ">10 anos",
]

export const fontesFinanciamento = [
  "Banco Mundial", "UNICEF", "BAD", "MS", "OMS", "FCGB", "FCT",
  "Governo", "INSP", "OAS", "CCS-SIDA", "OGE", "AGHA KHAN", "OOAS", "N/A", "Outras",
]

export const parceirosConhecidos = [
  "Uni-CV", "UniMindelo", "UniPéage", "UniSantiago", "DNS", "OMS",
  "DS de Ribeira Grande (Sto Antão)", "DS do Porto Novo", "DS do Paul",
  "DS de São Vicente (Mindelo)", "DS de Ribeira Brava",
  "DS do Tarrafal de São Nicolau", "DS do Sal", "DS da Boa Vista",
  "DS do Maio", "DS da Praia", "DS de Ribeira Grande de Santiago",
  "DS de São Domingos", "MS", "UNICEF", "UNFPA", "FCT",
  "Banco Mundial", "CCS-SIDA", "Outros",
]

export const papeis = ["admin", "investigador", "gestor"] as const
