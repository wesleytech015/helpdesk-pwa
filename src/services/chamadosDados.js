import * as banco from "../database/db.js";

function validarId(id) {
  const textoValido = typeof id === "string" && id.trim();
  const numeroValido = Number.isSafeInteger(id) && id > 0;
  if (!textoValido && !numeroValido) {
    throw new Error("O identificador do chamado é obrigatório.");
  }
}

function validarRegistro(chamado) {
  if (!chamado || typeof chamado !== "object" || Array.isArray(chamado)) {
    throw new Error("Os dados do chamado devem ser um objeto.");
  }
  validarId(chamado.id);
}

export async function salvarChamado(chamado) {
  validarRegistro(chamado);
  const registro = structuredClone(chamado);
  if (await banco.buscarChamadoPorId(registro.id)) {
    throw new Error("Já existe um chamado com esse identificador.");
  }
  const salvo = await banco.adicionarChamado(registro);
  // O banco novo retorna o registro; o atual retorna apenas o ID.
  if (salvo && typeof salvo === "object") return salvo;
  return banco.buscarChamadoPorId(registro.id);
}

export async function listarChamados() {
  return banco.listarChamados();
}

export async function buscarChamadoPorId(id) {
  validarId(id);
  let chamado = await banco.buscarChamadoPorId(id);

  // Os IDs antigos são números; as rotas do Frontend recebem texto.
  if (!chamado && typeof id === "string" && /^\d+$/.test(id)) {
    chamado = await banco.buscarChamadoPorId(Number(id));
  }
  return chamado ?? null;
}

export async function atualizarChamado(chamado) {
  validarRegistro(chamado);
  const atual = await buscarChamadoPorId(chamado.id);
  if (!atual) {
    throw new Error("Chamado não encontrado.");
  }
  const atualizado = {
    ...atual,
    ...structuredClone(chamado),
    id: atual.id,
    dataCriacao: atual.dataCriacao,
  };
  if (Object.hasOwn(atual, "numero")) {
    atualizado.numero = atual.numero;
  } else {
    delete atualizado.numero;
  }
  return banco.atualizarChamado(atual.id, atualizado);
}
