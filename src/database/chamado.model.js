
import { PRIORIDADES, STATUS_CHAMADO as statusPermitidos } from "../constants/chamados.js";

/**
 * Modelo de dados dos chamados do HelpDesk PWA.
 *
 * Centraliza a estrutura e as validações básicas
 * dos registros armazenados no IndexedDB.
 */

export const STATUS_CHAMADO = Object.freeze({
  NOVO: "Novo",
  AGUARDANDO_ATENDIMENTO: "Aguardando Atendimento",
  AGUARDANDO_CLIENTE: "Aguardando Retorno do Cliente",
  DEV: "Encaminhado para o DEV",
  PRODUTO: "Encaminhado para Equipe de Produto",
  FECHADO: "Fechado",
});

export const PRIORIDADE_CHAMADO = Object.freeze({
  BAIXA: "Baixo",
  NORMAL: "Normal",
  ALTA: "Alto",
});

/**
 * Cria a estrutura inicial de um chamado.
 *
 * @param {Object} dados
 * @returns {Object}
 */
export function criarModeloChamado(dados = {}) {
  const agora = new Date().toISOString();

  return {
    id: dados.id ?? globalThis.crypto.randomUUID(),
    titulo: dados.titulo?.trim() ?? "",
    descricao: dados.descricao?.trim() ?? "",
    categoria: dados.categoria?.trim() ?? "",
    prioridade: dados.prioridade ?? PRIORIDADE_CHAMADO.NORMAL,
    status: dados.status ?? STATUS_CHAMADO.NOVO,
    cliente: dados.cliente?.trim() ?? "",
    usuario: dados.usuario?.trim() ?? "",
    dataCriacao: dados.dataCriacao ?? agora,
    dataAtualizacao: dados.dataAtualizacao ?? agora,
    dataAbertura: dados.dataAbertura ?? agora,
  };
}

/**
 * Valida os campos obrigatórios e os valores permitidos.
 *
 * @param {Object} chamado
 * @returns {{ valido: boolean, erros: string[] }}
 */
export function validarChamado(chamado) {
  const erros = [];

  if (!chamado || typeof chamado !== "object" || Array.isArray(chamado)) {
    return {
      valido: false,
      erros: ["Os dados do chamado são inválidos."],
    };
  }

  if (typeof chamado.titulo !== "string" || !chamado.titulo.trim()) {
    erros.push("O título é obrigatório.");
  }

  if (
    typeof chamado.descricao !== "string" ||
    !chamado.descricao.trim()
  ) {
    erros.push("A descrição é obrigatória.");
  }

  if (
    typeof chamado.categoria !== "string" ||
    !chamado.categoria.trim()
  ) {
    erros.push("A categoria é obrigatória.");
  }

  if (!PRIORIDADES.includes(chamado.prioridade)) {
    erros.push("A prioridade informada é inválida.");
  }

  if (!statusPermitidos.includes(chamado.status)) {
    erros.push("O status informado é inválido.");
  }

  return {
    valido: erros.length === 0,
    erros,
  };
}

