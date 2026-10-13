
/**
 * Banco de dados local do HelpDesk PWA.
 *
 * Utiliza IndexedDB para persistência dos chamados.
 * Mantém UUIDs como identificadores internos e gera números
 * sequenciais contínuos no formato CH-0001, CH-0002...
 *
 * A numeração não é reutilizada após a exclusão de chamados.
 */

import { validarChamado } from "./chamado.model.js";

const DB_NAME = "helpdesk-pwa";
const DB_VERSION = 3;

const STORE_NAME = "chamados";
const CONTADOR_STORE = "contadores";
const CONTADOR_CHAMADOS = "chamados";

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
 * Extrai o número de um código no formato CH-0001.
 */
function extrairNumeroSequencial(numero) {
  if (typeof numero !== "string") {
    return 0;
  }

  const correspondencia = numero.match(/^CH-(\d+)$/i);

  return correspondencia ? Number(correspondencia[1]) : 0;
}

/**
 * Abre o banco e prepara sua estrutura.
 *
 * Na atualização para a versão 3:
 * - cria o armazenamento de contadores;
 * - atribui números aos chamados antigos que ainda não possuem;
 * - inicializa o contador com o maior número existente.
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

      if (!banco.objectStoreNames.contains(STORE_NAME)) {
        store = banco.createObjectStore(STORE_NAME, {
          keyPath: "id",
        });

        criarIndices(store);
      } else {
        store = transacao.objectStore(STORE_NAME);

        /*
         * Compatibilidade com esquemas antigos.
         * Caso a chave primária seja diferente, preservamos
         * os registros e recriamos o armazenamento.
         */
        if (store.keyPath !== "id" || store.autoIncrement) {
          const leituraAntiga = store.getAll();

          leituraAntiga.onsuccess = () => {
            const registrosAntigos = leituraAntiga.result;

            banco.deleteObjectStore(STORE_NAME);

            const novoStore = banco.createObjectStore(STORE_NAME, {
              keyPath: "id",
            });

            criarIndices(novoStore);

            migrarRegistros(registrosAntigos, novoStore, transacao);
          };

          leituraAntiga.onerror = () => {
            try {
              transacao.abort();
            } catch {
              // A transação pode já estar finalizada.
            }
          };
        } else {
          criarIndices(store);

          const leitura = store.getAll();

          leitura.onsuccess = () => {
            migrarRegistros(leitura.result, store, transacao);
          };

          leitura.onerror = () => {
            try {
              transacao.abort();
            } catch {
              // A transação pode já estar finalizada.
            }
          };
        }
      }

      if (!banco.objectStoreNames.contains(CONTADOR_STORE)) {
        banco.createObjectStore(CONTADOR_STORE, {
          keyPath: "chave",
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
      console.warn(
        "A abertura do banco está bloqueada por outra conexão."
      );
    };
  });
}

/**
 * Migra registros existentes sem apagar seus dados.
 * Registros que já possuem numero mantêm esse número.
 */
function migrarRegistros(registros, store, transacao) {
  let maiorNumero = 0;

  for (const registro of registros) {
    maiorNumero = Math.max(
      maiorNumero,
      extrairNumeroSequencial(registro.numero)
    );
  }

  for (const registroOriginal of registros) {
    if (
      registroOriginal.id === undefined ||
      registroOriginal.id === null
    ) {
      continue;
    }

    const registro = { ...registroOriginal };

    if (!registro.numero) {
      maiorNumero += 1;
      registro.numero = `CH-${String(maiorNumero).padStart(4, "0")}`;
    }

    store.put(registro);
  }

  const contadores = transacao.objectStore(CONTADOR_STORE);

  contadores.put({
    chave: CONTADOR_CHAMADOS,
    ultimoNumero: maiorNumero,
  });
}

/**
 * Executa uma operação IndexedDB e fecha a conexão.
 */
async function executarOperacao(
  modo,
  operacao,
  stores = [STORE_NAME]
) {
  const banco = await abrirBanco();

  return new Promise((resolve, reject) => {
    let transacao;

    try {
      transacao = banco.transaction(stores, modo);
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
 * Inclui um chamado com número sequencial automático.
 *
 * Retorna o registro gravado, incluindo id e numero.
 *
 * @param {Object} chamado
 * @returns {Promise<Object>}
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

  const resultadoValidacao = validarChamado(registro);

  if (!resultadoValidacao.valido) {
    throw new Error(resultadoValidacao.erros.join(" "));
  }

  return executarOperacao(
    "readwrite",
    (store, transacao, definirResultado) => {
      const contadores = transacao.objectStore(CONTADOR_STORE);
      const leitura = contadores.get(CONTADOR_CHAMADOS);

      leitura.onsuccess = () => {
        const ultimoNumero = leitura.result?.ultimoNumero ?? 0;
        const proximoNumero = ultimoNumero + 1;

        const registroNumerado = {
          ...registro,
          numero: `CH-${String(proximoNumero).padStart(4, "0")}`,
        };

        const gravacaoContador = contadores.put({
          chave: CONTADOR_CHAMADOS,
          ultimoNumero: proximoNumero,
        });

        gravacaoContador.onsuccess = () => {
          const gravacaoChamado = store.add(registroNumerado);

          gravacaoChamado.onsuccess = () => {
            definirResultado(registroNumerado);
          };
        };
      };
    },
    [STORE_NAME, CONTADOR_STORE]
  );
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
 * Atualiza um chamado sem permitir alteração do número sequencial.
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
        id: atual.id,
        numero: atual.numero,
        dataCriacao: atual.dataCriacao,
        dataAtualizacao: new Date().toISOString(),
      };

      const resultadoValidacao = validarChamado(atualizado);

      if (!resultadoValidacao.valido) {
        transacao.__erroAtualizacao = new Error(
          resultadoValidacao.erros.join(" ")
        );
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
 * A exclusão não reduz o contador sequencial.
 *
 * @param {string|number} id
 * @returns {Promise<void>}
 */
export async function excluirChamado(id) {
  return executarOperacao("readwrite", (store) => {
    store.delete(id);
  });
}
