// Temporário: os dados são perdidos ao recarregar a aplicação.
// As funções são assíncronas para facilitar a troca pelo IndexedDB.
const chamados = new Map();

function validarId(id) {
  if (typeof id !== "string" || !id.trim()) {
    throw new Error("O identificador do chamado é obrigatório.");
  }
}

export async function salvarChamado(chamado) {
  if (!chamado || typeof chamado !== "object" || Array.isArray(chamado)) {
    throw new Error("Os dados do chamado devem ser um objeto.");
  }
  validarId(chamado.id);
  if (chamados.has(chamado.id)) {
    throw new Error("Já existe um chamado com esse identificador.");
  }
  // As cópias impedem que a interface altere os dados salvos sem passar pelo serviço.
  const registro = structuredClone(chamado);
  chamados.set(registro.id, registro);
  return structuredClone(registro);
}

export async function listarChamados() {
  return structuredClone(Array.from(chamados.values()));
}

export async function atualizarChamado(chamado) {
  if (!chamado || typeof chamado !== "object" || Array.isArray(chamado)) {
    throw new Error("Os dados do chamado devem ser um objeto.");
  }
  validarId(chamado.id);
  if (!chamados.has(chamado.id)) {
    throw new Error("Chamado não encontrado.");
  }

  const registro = structuredClone(chamado);
  chamados.set(registro.id, registro);
  return structuredClone(registro);
}

export async function buscarChamadoPorId(id) {
  validarId(id);
  const chamado = chamados.get(id);
  return chamado === undefined ? null : structuredClone(chamado);
}
