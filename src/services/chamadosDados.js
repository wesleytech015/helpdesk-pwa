/**
 * Contrato temporário de persistência para os serviços de chamados.
 * Os dados ficam em memória e são perdidos ao recarregar a aplicação.
 * O módulo IndexedDB poderá oferecer as mesmas operações assíncronas.
 * Validação de negócio, geração de ID e datas pertencem aos serviços.
 */
const chamados = new Map();

function validarId(id) {
  if (typeof id !== "string" || !id.trim()) {
    throw new Error("O identificador do chamado é obrigatório.");
  }
}

/** Insere um chamado novo e retorna uma cópia do registro salvo. */
export async function salvarChamado(chamado) {
  if (!chamado || typeof chamado !== "object" || Array.isArray(chamado)) {
    throw new Error("Os dados do chamado devem ser um objeto.");
  }
  validarId(chamado.id);
  if (chamados.has(chamado.id)) {
    throw new Error("Já existe um chamado com esse identificador.");
  }
  // Copiar antes de gravar evita deixar um registro parcial se a cópia falhar.
  const registro = structuredClone(chamado);
  chamados.set(registro.id, registro);
  return structuredClone(registro);
}

/** Retorna uma lista independente dos registros mantidos em memória. */
export async function listarChamados() {
  return structuredClone(Array.from(chamados.values()));
}

/* Retorna uma cópia do chamado ou null quando o ID não existe. */
export async function buscarChamadoPorId(id) {
  validarId(id);
  const chamado = chamados.get(id);
  return chamado === undefined ? null : structuredClone(chamado);
}
