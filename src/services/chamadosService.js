import { CATEGORIAS, PRIORIDADES, STATUS_CHAMADO } from "../constants/chamados.js";
import * as chamadosDados from "./chamadosDados.js";

export async function listarChamados() {
  return chamadosDados.listarChamados();
}

export async function buscarChamadoPorId(id) {
  return chamadosDados.buscarChamadoPorId(id);
}

export async function atualizarChamado(id, dados) {
  if (!dados || typeof dados !== "object" || Array.isArray(dados)) {
    throw new Error("Os dados do chamado devem ser um objeto.");
  }

  const camposEditaveis = [
    "titulo",
    "descricao",
    "categoria",
    "prioridade",
    "status",
    "responsavelId",
  ];

  for (const campo of Object.keys(dados)) {
    if (!camposEditaveis.includes(campo)) {
      throw new Error(
        `O campo ${campo} não pode ser alterado nesta operação.`
      );
    }
  }

  const atual = await chamadosDados.buscarChamadoPorId(id);

  if (!atual) {
    throw new Error("Chamado não encontrado.");
  }

  const atualizado = { ...atual, ...dados };

  validarChamado(atualizado);

  if (!STATUS_CHAMADO.includes(atualizado.status)) {
    throw new Error("Selecione um status válido.");
  }

  if (
    Object.hasOwn(dados, "responsavelId") &&
    (typeof dados.responsavelId !== "string" || !dados.responsavelId.trim())
  ) {
    throw new Error("Informe um identificador de responsável válido.");
  }

  if (Object.hasOwn(dados, "responsavelId")) {
    atualizado.responsavelId = dados.responsavelId.trim();
  }

  atualizado.titulo = atualizado.titulo.trim();
  atualizado.descricao = atualizado.descricao.trim();

  const mudou = camposEditaveis.some(
    (campo) => atualizado[campo] !== atual[campo]
  );

  if (!mudou) {
    return atual;
  }

  atualizado.dataAtualizacao = new Date().toISOString();

  return chamadosDados.atualizarChamado(atualizado);
}

export async function fecharChamado(id) {
  return atualizarChamado(id, { status: "Fechado" });
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
    responsavelId: "nao-atribuido",
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

