
import {
  CATEGORIAS,
  PRIORIDADES,
  STATUS_CHAMADO,
} from "../constants/chamados.js";

/**
 * Modelo de dados dos chamados do HelpDesk PWA.
 *
 * Centraliza a estrutura e as validações dos registros
 * armazenados no IndexedDB.
 */

export function criarModeloChamado(dados = {}) {
  const agora = new Date().toISOString();

  return {
    id: dados.id ?? globalThis.crypto.randomUUID(),
    titulo: dados.titulo?.trim() ?? "",
    descricao: dados.descricao?.trim() ?? "",
    categoria: dados.categoria?.trim() ?? "",
    prioridade: dados.prioridade ?? "Normal",
    status: dados.status ?? "Novo",
    responsavelId: dados.responsavelId ?? "nao-atribuido",
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

  if (typeof chamado.descricao !== "string" || !chamado.descricao.trim()) {
    erros.push("A descrição é obrigatória.");
  }

  if (
    typeof chamado.categoria !== "string" ||
    !CATEGORIAS.includes(chamado.categoria)
  ) {
    erros.push("A categoria informada é inválida.");
  }

  if (!PRIORIDADES.includes(chamado.prioridade)) {
    erros.push("A prioridade informada é inválida.");
  }

  if (!STATUS_CHAMADO.includes(chamado.status)) {
    erros.push("O status informado é inválido.");
  }

  if (
    chamado.responsavelId !== undefined &&
    (typeof chamado.responsavelId !== "string" ||
      !chamado.responsavelId.trim())
  ) {
    erros.push("O identificador do responsável é inválido.");
  }

  return {
    valido: erros.length === 0,
    erros,
  };
}
