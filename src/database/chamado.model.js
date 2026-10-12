/**
 * Modelo de dados dos chamados do HelpDesk PWA.
 *
 * Este módulo centraliza a estrutura e as validações
 * básicas dos registros armazenados no IndexedDB.
 */

/**
 * Valores permitidos para o status de um chamado.
 */
export const STATUS_CHAMADO = Object.freeze({
  ABERTO: "Aberto",
  EM_ANDAMENTO: "Em andamento",
  PENDENTE: "Pendente",
  CONCLUIDO: "Concluído",
});

/**
 * Valores permitidos para a prioridade de um chamado.
 */
export const PRIORIDADE_CHAMADO = Object.freeze({
  BAIXA: "Baixa",
  NORMAL: "Normal",
  ALTA: "Alta",
  URGENTE: "Urgente",
});

/**
 * Cria a estrutura inicial de um chamado.
 *
 * O ID será gerado automaticamente pelo IndexedDB.
 *
 * @param {Object} dados - Dados fornecidos para o chamado.
 * @returns {Object} Objeto padronizado do chamado.
 */
export function criarModeloChamado(dados = {}) {
  const agora = new Date().toISOString();

  return {
    titulo: dados.titulo?.trim() ?? "",
    descricao: dados.descricao?.trim() ?? "",
    categoria: dados.categoria?.trim() ?? "",
    prioridade: dados.prioridade ?? PRIORIDADE_CHAMADO.NORMAL,
    status: dados.status ?? STATUS_CHAMADO.ABERTO,
    cliente: dados.cliente?.trim() ?? "",
    usuario: dados.usuario?.trim() ?? "",
    dataCriacao: agora,
    dataAtualizacao: agora,
    dataAbertura: dados.dataAbertura ?? agora,
  };
}

/**
 * Valida os campos obrigatórios e os valores permitidos.
 *
 * @param {Object} chamado - Registro a ser validado.
 * @returns {{ valido: boolean, erros: string[] }}
 */
export function validarChamado(chamado) {
  const erros = [];

  if (!chamado || typeof chamado !== "object") {
    return {
      valido: false,
      erros: ["Os dados do chamado são inválidos."],
    };
  }

  if (!chamado.titulo?.trim()) {
    erros.push("O título é obrigatório.");
  }

  if (!chamado.descricao?.trim()) {
    erros.push("A descrição é obrigatória.");
  }

  if (!chamado.categoria?.trim()) {
    erros.push("A categoria é obrigatória.");
  }

  if (
    !Object.values(PRIORIDADE_CHAMADO).includes(
      chamado.prioridade
    )
  ) {
    erros.push("A prioridade informada é inválida.");
  }

  if (
    !Object.values(STATUS_CHAMADO).includes(
      chamado.status
    )
  ) {
    erros.push("O status informado é inválido.");
  }

  return {
    valido: erros.length === 0,
    erros,
  };
}
