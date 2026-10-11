
/**
 * Dados fictícios utilizados durante o desenvolvimento
 * do Frontend do HelpDesk PWA.
 *
 * Posteriormente serão substituídos pelos dados
 * fornecidos pela camada de serviços e IndexedDB.
 */

export const chamadosMock = [
  {
    id: "CH-001",
    titulo: "Erro ao acessar sistema",
    descricao:
      "Ao tentar acessar o sistema, é apresentado um erro de autenticação.",
    categoria: "Não Conformidade",
    prioridade: "Alto",
    status: "Novo",
    dataAbertura: "2026-10-02"
  },
  {
    id: "CH-002",
    titulo: "Dúvida sobre cadastro",
    descricao:
      "Preciso de orientação para realizar o cadastro.",
    categoria: "Dúvida ou Conceito",
    prioridade: "Normal",
    status: "Aguardando Retorno do Cliente",
    dataAbertura: "2026-10-05"
  },
  {
    id: "CH-003",
    titulo: "Erro na emissão de relatório",
    descricao:
      "O sistema apresenta um erro ao emitir o relatório.",
    categoria: "Não Conformidade",
    prioridade: "Alto",
    status: "Encaminhado para o DEV",
    dataAbertura: "2026-10-07"
  },
  {
    id: "CH-004",
    titulo: "Melhoria na tela de pesquisa",
    descricao:
      "Sugestão para melhorar os filtros de pesquisa.",
    categoria: "Sugestão de Melhoria",
    prioridade: "Baixo",
    status: "Encaminhado para Equipe de Produto",
    dataAbertura: "2026-09-15"
  },
  {
    id: "CH-005",
    titulo: "Configuração concluída",
    descricao:
      "A configuração solicitada foi finalizada.",
    categoria: "Dúvida ou Conceito",
    prioridade: "Normal",
    status: "Fechado",
    dataAbertura: "2026-10-08"
  }
];
