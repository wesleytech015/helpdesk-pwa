
/**
 * Módulo responsável pelo banco de dados local do HelpDesk PWA.
 *
 * Utiliza a API IndexedDB do navegador para armazenar chamados.
 */

// Importa a função de validação do modelo de chamados.
import { validarChamado } from "./chamado.model.js";

// Nome do banco de dados.
const DB_NAME = "helpdesk-pwa";

// Versão da estrutura do banco.
const DB_VERSION = 1;

// Nome do armazenamento de chamados.
const STORE_NAME = "chamados";

/**
 * Abre o banco de dados e cria sua estrutura inicial.
 *
 * @returns {Promise<IDBDatabase>}
 */
export function abrirBanco() {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(
        new Error("IndexedDB não é suportado neste navegador.")
      );
      return;
    }

    const requisicao = indexedDB.open(DB_NAME, DB_VERSION);

    requisicao.onupgradeneeded = (evento) => {
      const banco = evento.target.result;

      if (!banco.objectStoreNames.contains(STORE_NAME)) {
        const store = banco.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
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

      // Fecha conexões antigas caso a estrutura precise ser atualizada.
      banco.onversionchange = () => {
        banco.close();
      };

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
 * Adiciona um chamado ao banco de dados.
 *
 * @param {Object} chamado - Dados do chamado.
 * @returns {Promise<number>} ID gerado pelo IndexedDB.
 */
export async function adicionarChamado(chamado) {
  // Valida os dados antes de iniciar a gravação.
  const resultado = validarChamado(chamado);

  if (!resultado.valido) {
    throw new Error(resultado.erros.join(" "));
  }

  const banco = await abrirBanco();

  return new Promise((resolve, reject) => {
    let idGerado;

    const transacao = banco.transaction(
      STORE_NAME,
      "readwrite"
    );

    const store = transacao.objectStore(STORE_NAME);
    const requisicao = store.add(chamado);

    requisicao.onsuccess = () => {
      idGerado = requisicao.result;
    };

    requisicao.onerror = () => {
      reject(
        requisicao.error ??
          new Error("Não foi possível adicionar o chamado.")
      );
    };

    transacao.oncomplete = () => {
      banco.close();
      resolve(idGerado);
    };

    transacao.onerror = () => {
      banco.close();

      reject(
        transacao.error ??
          new Error("A transação de inclusão falhou.")
      );
    };

    transacao.onabort = () => {
      banco.close();

      reject(
        transacao.error ??
          new Error("A inclusão do chamado foi cancelada.")
      );
    };
  });
}
