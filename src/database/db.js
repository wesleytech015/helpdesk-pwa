
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
 * Abre o banco e prepara a estrutura.
 *
 * A versão 2 permite alterar a chave primária
 * para aceitar UUIDs e IDs numéricos.
 *
 * Atenção: a migração preserva os registros existentes.
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

      let store;

      if (banco.objectStoreNames.contains(STORE_NAME)) {
        store = transacao.objectStore(STORE_NAME);

        // Se a chave anterior era autoIncrement, é necessário
        // recriar o armazenamento para remover essa propriedade.
        if (store.autoIncrement || store.keyPath !== "id") {
          const leitura = store.getAll();

          leitura.onsuccess = () => {
            const registros = leitura.result;

            banco.deleteObjectStore(STORE_NAME);

            const novoStore = banco.createObjectStore(STORE_NAME, {
              keyPath: "id",
            });

            novoStore.createIndex("status", "status", {
              unique: false,
            });

            novoStore.createIndex("prioridade", "prioridade", {
              unique: false,
            });

            novoStore.createIndex("dataCriacao", "dataCriacao", {
              unique: false,
            });

            for (const registro of registros) {
              novoStore.put(registro);
            }
          };
        }
      } else {
        store = banco.createObjectStore(STORE_NAME, {
          keyPath: "id",
        });

        store.createIndex("status", "status", {
          unique: false,
        });

        store.createIndex("prioridade", "prioridade", {
          unique: false,
        });

        store.createIndex("dataCriacao", "dataCriacao", {
          unique: false,
        });
      }
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
      console.warn("A abertura do banco está bloqueada por outra conexão.");
    };
  });
}

/**
 * Executa uma operação IndexedDB e fecha a conexão.
 *
 * @param {string} modo
 * @param {(store: IDBObjectStore, transacao: IDBTransaction) => void} operacao
 * @returns {Promise<unknown>}
 */
async function executarOperacao(modo, operacao) {
  const banco = await abrirBanco();

  return new Promise((resolve, reject) => {
    const transacao = banco.transaction(STORE_NAME, modo);
    const store = transacao.objectStore(STORE_NAME);

    let resultado;
    let erroOperacao;

    try {
      operacao(store, transacao, (valor) => {
        resultado = valor;
      });
    } catch (erro) {
      erroOperacao = erro;

      try {
        transacao.abort();
      } catch {
        banco.close();
        reject(erro);
      }
    }

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
          transacao.error ??
          new Error("A operação no banco de dados foi cancelada.")
      );
    };
  });
}

/**
 * Inclui um chamado.
 *
 * @param {Object} chamado
 * @returns {Promise<string|number>} ID do registro.
 */
export async function adicionarChamado(chamado) {
  if (!chamado || typeof chamado !== "object" || Array.isArray(chamado)) {
    throw new Error("Os dados do chamado são inválidos.");
  }

  const registro = { ...chamado };

  if (
    (typeof registro.id !== "string" && typeof registro.id !== "number") ||
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

    requisicao.onsuccess = () => definirResultado(requisicao.result);

    requisicao.onerror = () => {
      // O erro será tratado pela transação.
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

    requisicao.onsuccess = () => definirResultado(requisicao.result);
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

    requisicao.onsuccess = () => definirResultado(requisicao.result);
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
  return executarOperacao("readwrite", (store, transacao, definirResultado) => {
    const requisicao = store.get(id);

    requisicao.onsuccess = () => {
      const atual = requisicao.result;

      if (!atual) {
        try {
          transacao.abort();
        } catch {
          // A transação já pode estar finalizada.
        }
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
        try {
          transacao.abort();
        } catch {
          // A transação já pode estar finalizada.
        }
        return;
      }

      const gravacao = store.put(atualizado);

      gravacao.onsuccess = () => definirResultado(atualizado);
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
