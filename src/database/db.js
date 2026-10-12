
/**
 * Banco de dados local do HelpDesk PWA.
 *
 * Utiliza IndexedDB para persistência dos chamados.
 * Aceita identificadores UUID em texto e IDs numéricos
 * legados, sem exigir autoIncrement.
 */

import { validarChamado } from "./chamado.model.js";

const DB_NAME = "helpdesk-pwa";
const DB_VERSION = 2;
const STORE_NAME = "chamados";

/**
 * Cria os índices utilizados pelo banco.
 */
function criarIndices(store) {
  if (!store.indexNames.contains("status")) {
    store.createIndex("status", "status", { unique: false });
  }

  if (!store.indexNames.contains("prioridade")) {
    store.createIndex("prioridade", "prioridade", { unique: false });
  }

  if (!store.indexNames.contains("dataCriacao")) {
    store.createIndex("dataCriacao", "dataCriacao", { unique: false });
  }
}

/**
 * Abre o banco e prepara a estrutura.
 */
export function abrirBanco() {
  return new Promise((resolve, reject) => {
    if (!globalThis.indexedDB) {
      reject(new Error("IndexedDB não é suportado neste navegador."));
      return;
    }

    const requisicao = indexedDB.open(DB_NAME, DB_VERSION);

    requisicao.onupgradeneeded = (evento) => {
      const banco = evento.target.result;
      const transacao = evento.target.transaction;

      if (!banco.objectStoreNames.contains(STORE_NAME)) {
        const store = banco.createObjectStore(STORE_NAME, {
          keyPath: "id",
        });

        criarIndices(store);
        return;
      }

      const storeAtual = transacao.objectStore(STORE_NAME);

      if (!storeAtual.autoIncrement && storeAtual.keyPath === "id") {
        criarIndices(storeAtual);
        return;
      }

      /*
       * Migração do armazenamento antigo.
       * A leitura e a recriação ocorrem na transação de upgrade.
       */
      const leitura = storeAtual.getAll();

      leitura.onsuccess = () => {
        const registros = leitura.result;

        banco.deleteObjectStore(STORE_NAME);

        const novoStore = banco.createObjectStore(STORE_NAME, {
          keyPath: "id",
        });

        criarIndices(novoStore);

        for (const registro of registros) {
          if (registro.id === undefined || registro.id === null) {
            continue;
          }

          novoStore.put(registro);
        }
      };

      leitura.onerror = () => {
        try {
          transacao.abort();
        } catch {
          // A transação pode já estar finalizada.
        }
      };
    };

    requisicao.onsuccess = () => {
      const banco = requisicao.result;

      banco.onversionchange = () => banco.close();

      resolve(banco);
    };

    requisicao.onerror = () => {
      reject(
        requisicao.error ??
          new Error("Não foi possível abrir o banco de dados.")
      );
    };

    requisicao.onblocked = () => {
      console.warn(
        "A abertura do banco está bloqueada por outra conexão."
      );
    };
  });
}

/**
 * Executa uma operação IndexedDB e fecha a conexão.
 */
async function executarOperacao(modo, operacao) {
  const banco = await abrirBanco();

  return new Promise((resolve, reject) => {
    let transacao;

    try {
      transacao = banco.transaction(STORE_NAME, modo);
    } catch (erro) {
      banco.close();
      reject(erro);
      return;
    }

    const store = transacao.objectStore(STORE_NAME);

    let resultado;
    let erroOperacao;

    const definirResultado = (valor) => {
      resultado = valor;
    };

    transacao.oncomplete = () => {
      banco.close();

      if (erroOperacao) {
        reject(erroOperacao);
      } else {
        resolve(resultado);
      }
    };

    transacao.onerror = () => {
      banco.close();

      reject(
        erroOperacao ??
          transacao.error ??
          new Error("A operação no banco de dados falhou.")
      );
    };

    transacao.onabort = () => {
      banco.close();

      reject(
        erroOperacao ??
          transacao.__erroAtualizacao ??
          transacao.error ??
          new Error("A operação no banco de dados foi cancelada.")
      );
    };

    try {
      operacao(store, transacao, definirResultado);
    } catch (erro) {
      erroOperacao = erro;

      try {
        transacao.abort();
      } catch {
        banco.close();
        reject(erro);
      }
    }
  });
}

/**
 * Inclui um chamado.
 *
 * @param {Object} chamado
 * @returns {Promise<string|number>}
 */
export async function adicionarChamado(chamado) {
  if (!chamado || typeof chamado !== "object" || Array.isArray(chamado)) {
    throw new Error("Os dados do chamado são inválidos.");
  }

  const registro = { ...chamado };

  if (
    (typeof registro.id !== "string" &&
      typeof registro.id !== "number") ||
    String(registro.id).trim() === ""
  ) {
    throw new Error("O identificador do chamado é obrigatório.");
  }

  const resultado = validarChamado(registro);

  if (!resultado.valido) {
    throw new Error(resultado.erros.join(" "));
  }

  return executarOperacao("readwrite", (store, transacao, definirResultado) => {
    const requisicao = store.add(registro);

    requisicao.onsuccess = () => {
      definirResultado(requisicao.result);
    };
  });
}

/**
 * Lista todos os chamados.
 *
 * @returns {Promise<Object[]>}
 */
export async function listarChamados() {
  return executarOperacao("readonly", (store, transacao, definirResultado) => {
    const requisicao = store.getAll();

    requisicao.onsuccess = () => {
      definirResultado(requisicao.result);
    };
  });
}

/**
 * Busca um chamado por ID.
 *
 * @param {string|number} id
 * @returns {Promise<Object|undefined>}
 */
export async function buscarChamadoPorId(id) {
  return executarOperacao("readonly", (store, transacao, definirResultado) => {
    const requisicao = store.get(id);

    requisicao.onsuccess = () => {
      definirResultado(requisicao.result);
    };
  });
}

/**
 * Atualiza um chamado existente, preservando a data de criação.
 *
 * @param {string|number} id
 * @param {Object} dados
 * @returns {Promise<Object>}
 */
export async function atualizarChamado(id, dados) {
  if (!dados || typeof dados !== "object" || Array.isArray(dados)) {
    throw new Error("Os dados para atualização são inválidos.");
  }

  return executarOperacao("readwrite", (store, transacao, definirResultado) => {
    const requisicao = store.get(id);

    requisicao.onsuccess = () => {
      const atual = requisicao.result;

      if (!atual) {
        transacao.__erroAtualizacao = new Error("Chamado não encontrado.");
        transacao.abort();
        return;
      }

      const atualizado = {
        ...atual,
        ...dados,
        id,
        dataCriacao: atual.dataCriacao,
        dataAtualizacao: new Date().toISOString(),
      };

      const resultado = validarChamado(atualizado);

      if (!resultado.valido) {
        transacao.__erroAtualizacao = new Error(resultado.erros.join(" "));
        transacao.abort();
        return;
      }

      const gravacao = store.put(atualizado);

      gravacao.onsuccess = () => {
        definirResultado(atualizado);
      };
    };
  });
}

/**
 * Exclui um chamado por ID.
 *
 * @param {string|number} id
 * @returns {Promise<void>}
 */
export async function excluirChamado(id) {
  return executarOperacao("readwrite", (store) => {
    store.delete(id);
  });
}
