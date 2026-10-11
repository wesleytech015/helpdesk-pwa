import { CATEGORIAS, PRIORIDADES } from "../constants/chamados.js";
import * as chamadosDados from "./chamadosDados.js";

export async function listarChamados() {
  return chamadosDados.listarChamados();
}

export async function buscarChamadoPorId(id) {
  return chamadosDados.buscarChamadoPorId(id);
}

export async function criarChamado(dados) {
  validarChamado(dados);

  const agora = new Date();
  const instante = agora.toISOString();
  // O Frontend usa AAAA-MM-DD. Usamos a data local para evitar mudança de dia em UTC.
  const dataAbertura = [
    agora.getFullYear(),
    String(agora.getMonth() + 1).padStart(2, "0"),
    String(agora.getDate()).padStart(2, "0"),
  ].join("-");

  const chamado = {
    id: globalThis.crypto.randomUUID(),
    titulo: dados.titulo.trim(),
    descricao: dados.descricao.trim(),
    categoria: dados.categoria,
    prioridade: dados.prioridade,
    status: "Novo",
    dataAbertura,
    dataCriacao: instante,
    dataAtualizacao: instante,
  };

  return chamadosDados.salvarChamado(chamado);
}

export function validarChamado(dados) {
  if (!dados || typeof dados !== "object" || Array.isArray(dados)) {
    throw new Error("Os dados do chamado devem ser um objeto.");
  }

  if (typeof dados.titulo !== "string" || !dados.titulo.trim()) {
    throw new Error("O título do chamado é obrigatório.");
  }
  if (typeof dados.descricao !== "string" || !dados.descricao.trim()) {
    throw new Error("A descrição do chamado é obrigatória.");
  }

  if (!CATEGORIAS.includes(dados.categoria)) {
    throw new Error("Selecione uma categoria válida.");
  }

  if (!PRIORIDADES.includes(dados.prioridade)) {
    throw new Error("Selecione uma prioridade válida.");
  }
}

