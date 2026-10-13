
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import {
  CalendarDays,
  ChevronDown,
  ArrowUpRight,
  RotateCcw,
  ListFilter,
  Ticket,
  Tickets,
  FolderOpen,
} from "lucide-react";

import CardIndicador from "../components/CardIndicador";
import { listarChamados } from "../services/chamadosService";

import "../styles/dashboard.css";

// ========================================
// MESES DISPONÍVEIS
// ========================================

const meses = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

// ========================================
// CLASSES DOS STATUS
// ========================================

function classeStatus(status) {
  const classes = {
    Novo: "novo",
    "Aguardando Atendimento": "aguardando",
    "Aguardando Retorno do Cliente": "aguardando",
    "Encaminhado para o DEV": "dev",
    "Encaminhado para Equipe de Produto": "produto",
    Fechado: "fechado",
  };

  return classes[status] || "";
}

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

function obterDataAbertura(chamado) {
  return chamado.dataAbertura || chamado.dataCriacao || "";
}

function obterAnoMes(data) {
  if (!data) {
    return { ano: null, mes: null };
  }

  const texto = String(data).slice(0, 10);
  const partes = texto.split("-");

  if (partes.length !== 3) {
    return { ano: null, mes: null };
  }

  const ano = Number(partes[0]);
  const mes = Number(partes[1]);

  if (
    !Number.isInteger(ano) ||
    !Number.isInteger(mes) ||
    mes < 1 ||
    mes > 12
  ) {
    return { ano: null, mes: null };
  }

  return { ano, mes };
}

function formatarData(data) {
  if (!data) {
    return "-";
  }

  const texto = String(data).slice(0, 10);
  const partes = texto.split("-");

  if (partes.length !== 3) {
    return texto;
  }

  const [ano, mes, dia] = partes;

  return `${dia}/${mes}/${ano}`;
}

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export default function Dashboard() {
  const agora = new Date();

  // ========================================
  // CHAMADOS REAIS DO INDEXEDDB
  // ========================================

  const [chamados, setChamados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState("");

  // ========================================
  // ESTADOS DOS FILTROS
  // ========================================

  const [mes, setMes] = useState(
    String(agora.getMonth() + 1)
  );

  const [ano, setAno] = useState(
    String(agora.getFullYear())
  );

  const [situacao, setSituacao] = useState("todos");

  const [calendarioAberto, setCalendarioAberto] =
    useState(false);

  const calendarioRef = useRef(null);
  const calendarioBotaoRef = useRef(null);

  // ========================================
  // CONSULTA AOS CHAMADOS REAIS
  // ========================================

  useEffect(() => {
    let ativo = true;

    async function carregarChamados() {
      setCarregando(true);
      setErroCarregamento("");

      try {
        const dados = await listarChamados();

        if (ativo) {
          setChamados(
            Array.isArray(dados) ? dados : []
          );
        }
      } catch (erro) {
        if (ativo) {
          setChamados([]);

          setErroCarregamento(
            erro instanceof Error
              ? erro.message
              : "Não foi possível carregar os chamados."
          );
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregarChamados();

    return () => {
      ativo = false;
    };
  }, []);

  // ========================================
  // FECHAR CALENDÁRIO
  // ========================================

  useEffect(() => {
    function fecharAoClicarFora(evento) {
      if (
        calendarioRef.current &&
        !calendarioRef.current.contains(evento.target)
      ) {
        setCalendarioAberto(false);
      }
    }

    function fecharComEscape(evento) {
      if (evento.key === "Escape") {
        setCalendarioAberto(false);
        calendarioBotaoRef.current?.focus();
      }
    }

    document.addEventListener(
      "pointerdown",
      fecharAoClicarFora
    );

    document.addEventListener(
      "keydown",
      fecharComEscape
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        fecharAoClicarFora
      );

      document.removeEventListener(
        "keydown",
        fecharComEscape
      );
    };
  }, []);

  // ========================================
  // ANOS DISPONÍVEIS
  // ========================================

  const anosDisponiveis = [
    ...new Set([
      agora.getFullYear(),
      ...chamados
        .map((chamado) =>
          obterAnoMes(
            obterDataAbertura(chamado)
          ).ano
        )
        .filter((valor) => valor !== null),
    ]),
  ].sort((a, b) => b - a);

  // ========================================
  // FILTRAGEM DOS CHAMADOS
  // ========================================

  const chamadosFiltrados = chamados.filter(
    (chamado) => {
      const { ano: anoChamado, mes: mesChamado } =
        obterAnoMes(
          obterDataAbertura(chamado)
        );

      const correspondeAno =
        ano === "todos" ||
        anoChamado === Number(ano);

      const correspondeMes =
        mes === "todos" ||
        mesChamado === Number(mes);

      const correspondeSituacao =
        situacao === "todos" ||
        (
          situacao === "abertos" &&
          chamado.status !== "Fechado"
        ) ||
        (
          situacao === "fechados" &&
          chamado.status === "Fechado"
        );

      return (
        correspondeAno &&
        correspondeMes &&
        correspondeSituacao
      );
    }
  );

  // ========================================
  // CONTAGEM DOS INDICADORES
  // ========================================

  function contar(status) {
    return chamadosFiltrados.filter(
      (chamado) => chamado.status === status
    ).length;
  }

  const total = chamadosFiltrados.length;

  // Todo chamado diferente de Fechado
  // é considerado Em Aberto.
  const emAberto = chamadosFiltrados.filter(
    (chamado) => chamado.status !== "Fechado"
  ).length;

  // DEV e Produto fazem parte de Em Aberto.
  const encaminhados = chamadosFiltrados.filter(
    (chamado) =>
      chamado.status === "Encaminhado para o DEV" ||
      chamado.status ===
        "Encaminhado para Equipe de Produto"
  ).length;

  // ========================================
  // SELEÇÃO DO MÊS
  // ========================================

  function selecionarMes(valor) {
    setMes(valor);
    setCalendarioAberto(false);
    calendarioBotaoRef.current?.focus();
  }

  const nomeMesSelecionado =
    mes === "todos"
      ? "Todos os meses"
      : meses[Number(mes) - 1];

  // ========================================
  // LIMPAR FILTROS
  // ========================================

  function limparFiltros() {
    setMes("todos");
    setAno("todos");
    setSituacao("todos");
    setCalendarioAberto(false);
  }

  // ========================================
  // INTERFACE
  // ========================================

  return (
    <main className="conteudo dashboard">
      {/* CABEÇALHO */}

      <div className="dashboard-topo">
        <div>
          <h1>Dashboard</h1>

          <p className="subtitulo">
            Acompanhe os indicadores e chamados do HelpDesk
          </p>
        </div>

        <Link
          to="/novo-chamado"
          className="dashboard-novo-chamado"
        >
          <Ticket size={17} aria-hidden="true" />
          Novo Chamado
        </Link>
      </div>

      {/* ========================================
          PAINEL DE FILTROS
      ======================================== */}

      <section
        className="dashboard-filtros-painel"
        aria-label="Filtros do Dashboard"
      >
        <div className="dashboard-filtros-titulo">
          <ListFilter size={17} aria-hidden="true" />
          <strong>Filtros</strong>
        </div>

        <div className="dashboard-filtros-campos">
          {/* FILTRO DE MÊS */}

          <div
            className="dashboard-filtro-campo dashboard-filtro-mes"
            ref={calendarioRef}
          >
            <span
              id="dashboard-mes-label"
              className="dashboard-filtro-label"
            >
              <CalendarDays
                size={14}
                aria-hidden="true"
              />
              Mês
            </span>

            <button
              ref={calendarioBotaoRef}
              type="button"
              className={`dashboard-mes-botao ${
                calendarioAberto ? "aberto" : ""
              }`}
              aria-labelledby="dashboard-mes-label dashboard-mes-valor"
              aria-expanded={calendarioAberto}
              aria-controls={
                calendarioAberto
                  ? "dashboard-calendario"
                  : undefined
              }
              aria-haspopup="true"
              onClick={() =>
                setCalendarioAberto(
                  (anterior) => !anterior
                )
              }
            >
              <span id="dashboard-mes-valor">
                {nomeMesSelecionado}
              </span>

              <ChevronDown
                size={16}
                aria-hidden="true"
                className={
                  calendarioAberto
                    ? "mes-seta-aberta"
                    : ""
                }
              />
            </button>

            {/* CALENDÁRIO DOS MESES */}

            {calendarioAberto && (
              <div
                id="dashboard-calendario"
                className="dashboard-calendario"
                aria-label="Selecionar mês"
              >
                <div className="dashboard-calendario-topo">
                  <strong>Selecionar mês</strong>

                  <span>
                    {ano === "todos"
                      ? "Todos os anos"
                      : ano}
                  </span>
                </div>

                <div className="dashboard-calendario-grade">
                  {meses.map((nome, index) => {
                    const valor = String(index + 1);
                    const selecionado = mes === valor;

                    return (
                      <button
                        key={nome}
                        type="button"
                        className={`dashboard-mes-opcao ${
                          selecionado
                            ? "selecionado"
                            : ""
                        }`}
                        aria-pressed={selecionado}
                        aria-label={nome}
                        onClick={() =>
                          selecionarMes(valor)
                        }
                      >
                        {nome.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  className={`dashboard-meses-todos ${
                    mes === "todos"
                      ? "selecionado"
                      : ""
                  }`}
                  aria-pressed={mes === "todos"}
                  onClick={() =>
                    selecionarMes("todos")
                  }
                >
                  Todos os meses
                </button>
              </div>
            )}
          </div>

          {/* FILTRO POR ANO */}

          <div className="dashboard-filtro-campo">
            <label htmlFor="dashboard-ano">
              Ano
            </label>

            <select
              id="dashboard-ano"
              value={ano}
              onChange={(e) =>
                setAno(e.target.value)
              }
            >
              <option value="todos">
                Todos os anos
              </option>

              {anosDisponiveis.map((item) => (
                <option
                  key={item}
                  value={String(item)}
                >
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* FILTRO POR SITUAÇÃO */}

          <div className="dashboard-filtro-campo">
            <label htmlFor="dashboard-situacao">
              Situação
            </label>

            <select
              id="dashboard-situacao"
              value={situacao}
              onChange={(e) =>
                setSituacao(e.target.value)
              }
            >
              <option value="todos">
                Todos os chamados
              </option>

              <option value="abertos">
                Em aberto
              </option>

              <option value="fechados">
                Fechados
              </option>
            </select>
          </div>

          {/* LIMPAR FILTROS */}

          <button
            type="button"
            className="dashboard-limpar"
            onClick={limparFiltros}
          >
            <RotateCcw
              size={15}
              aria-hidden="true"
            />
            Limpar
          </button>
        </div>
      </section>

      {/* ========================================
          MENSAGENS DE CARREGAMENTO E ERRO
      ======================================== */}

      {carregando && (
        <p role="status" className="subtitulo">
          Carregando indicadores e chamados...
        </p>
      )}

      {erroCarregamento && (
        <p role="alert" className="subtitulo">
          Erro ao carregar os chamados: {erroCarregamento}
        </p>
      )}

      {/* ========================================
          GRADE DOS INDICADORES
      ======================================== */}

      <div className="dashboard-grade">
        {/* INDICADORES GERAIS */}

        <section
          className="dashboard-resumo"
          aria-label="Resumo geral dos chamados"
        >
          {/* TOTAL DE CHAMADOS */}

          <article className="dashboard-resumo-card resumo-total">
            <div>
              <span>Total de Chamados</span>

              <strong>{total}</strong>

              <small>Conforme os filtros</small>
            </div>

            <div
              className="dashboard-resumo-icone"
              aria-hidden="true"
            >
              <Tickets
                size={20}
                strokeWidth={1.8}
              />
            </div>
          </article>

          {/* EM ABERTO */}

          {situacao === "todos" && (
            <article className="dashboard-resumo-card resumo-abertos">
              <div>
                <span>Em Aberto</span>

                <strong>{emAberto}</strong>

                <small>
                  Inclui novos, aguardando e encaminhados
                </small>
              </div>

              <div
                className="dashboard-resumo-icone"
                aria-hidden="true"
              >
                <FolderOpen
                  size={20}
                  strokeWidth={1.8}
                />
              </div>
            </article>
          )}
        </section>

        {/* INDICADORES POR STATUS */}

        <section
          className="indicadores"
          aria-label="Chamados por status"
        >
          {situacao !== "fechados" && (
            <>
              <CardIndicador
                titulo="Novos"
                quantidade={contar("Novo")}
                cor="azul"
                tipo="novos"
              />

              <CardIndicador
                titulo="Aguardando Retorno do Cliente"
                quantidade={contar(
                  "Aguardando Retorno do Cliente"
                )}
                cor="verde-claro"
                tipo="aguardando"
              />

              <CardIndicador
                titulo="Encaminhados para DEV / Produto"
                quantidade={encaminhados}
                cor="amarelo"
                tipo="encaminhados"
              />
            </>
          )}

          {situacao !== "abertos" && (
            <CardIndicador
              titulo="Fechados"
              quantidade={contar("Fechado")}
              cor="verde"
              tipo="fechados"
            />
          )}
        </section>
      </div>

      {/* ========================================
          TABELA DE CHAMADOS
      ======================================== */}

      <section className="secao-chamados">
        <div className="dashboard-tabela-topo">
          <div>
            <h2>Chamados encontrados</h2>

            <p>
              {carregando
                ? "Carregando chamados..."
                : `${total} chamado(s) conforme os filtros`}
            </p>
          </div>

          <Link
            to="/chamados"
            className="dashboard-ver-todos"
          >
            Ver listagem completa

            <ArrowUpRight
              size={16}
              aria-hidden="true"
            />
          </Link>
        </div>

        <div className="tabela-container">
          <table className="dashboard-tabela">
            <thead>
              <tr>
                <th>Número</th>
                <th>Título</th>
                <th>Categoria</th>
                <th>Prioridade</th>
                <th>Status</th>
                <th>Abertura</th>
              </tr>
            </thead>

            <tbody>
              {!carregando &&
                !erroCarregamento &&
                chamadosFiltrados.map((chamado) => (
                  <tr key={chamado.id}>
                    <td>
                      <Link
                        to={`/chamados/${chamado.id}`}
                        className="link-protocolo"
                      >
                        {chamado.numero || chamado.id}
                      </Link>
                    </td>

                    <td>{chamado.titulo}</td>

                    <td>{chamado.categoria}</td>

                    <td>
                      <span
                        className={`dashboard-prioridade prioridade-${String(
                          chamado.prioridade || ""
                        ).toLowerCase()}`}
                      >
                        {chamado.prioridade}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`dashboard-status status-${classeStatus(
                          chamado.status
                        )}`}
                      >
                        {chamado.status}
                      </span>
                    </td>

                    <td>
                      {formatarData(
                        obterDataAbertura(chamado)
                      )}
                    </td>
                  </tr>
                ))}

              {carregando && (
                <tr>
                  <td
                    colSpan={6}
                    className="sem-dados"
                  >
                    Carregando chamados...
                  </td>
                </tr>
              )}

              {!carregando && erroCarregamento && (
                <tr>
                  <td
                    colSpan={6}
                    className="sem-dados"
                    role="alert"
                  >
                    Não foi possível consultar os chamados.
                  </td>
                </tr>
              )}

              {!carregando &&
                !erroCarregamento &&
                total === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="sem-dados"
                    >
                      Nenhum chamado encontrado para
                      os filtros selecionados.
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
